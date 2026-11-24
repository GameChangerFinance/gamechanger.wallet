import path from 'node:path';
import fs from 'node:fs/promises';

/** Reject traversal and symlinks before reads/copies or generated-tree cleanup. */
export async function inside(root, relative) {
  if (!relative || path.isAbsolute(relative)) throw Error('Expected a nonempty relative path');
  const target = path.resolve(root, relative);
  const resolvedRoot = path.resolve(root);
  if (await fs.realpath(resolvedRoot) !== resolvedRoot) throw Error('Symlink roots are not supported');
  if (target === resolvedRoot || !target.startsWith(resolvedRoot + path.sep)) throw Error('Path escapes allowed root');
  let current = resolvedRoot;
  for (const segment of path.relative(resolvedRoot, target).split(path.sep)) {
    current = path.join(current, segment);
    try {
      if ((await fs.lstat(current)).isSymbolicLink()) throw Error('Symlink paths are not supported');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return target;
}

export async function files(root, relative) {
  const target = await inside(root, relative);
  const stat = await fs.lstat(target);
  if (!stat.isDirectory()) return [relative];
  const result = [];
  for (const entry of (await fs.readdir(target)).sort()) result.push(...await files(root, `${relative}/${entry}`));
  return result;
}

export async function cleanGenerated(feature, configured) {
  // Exact allowlist prevents a configuration typo from deleting host/source paths.
  if (configured !== '.generated') throw Error('Generated output must be the feature-local .generated directory');
  const target = await inside(feature, configured);
  let exists = true;
  try { await fs.lstat(target); } catch (error) { if (error.code === 'ENOENT') exists = false; else throw error; }
  if (exists) {
    await files(feature, configured); // Reject symlinks anywhere in the tree before removal.
    let marker;
    try { marker = await fs.readFile(path.join(target, '.generator-owned'), 'utf8'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (marker !== 'gc-docs-v1\n') throw Error('Refusing to overwrite an unowned output directory');
    await fs.rm(target, { recursive: true });
  }
  await fs.mkdir(target, { recursive: true });
  await fs.writeFile(path.join(target, '.generator-owned'), 'gc-docs-v1\n');
  return target;
}
