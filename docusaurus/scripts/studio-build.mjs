import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { hash } from './core.mjs';
import { inside } from './paths.mjs';

const execute = promisify(execFile);
async function run(command, args, cwd, env = process.env) {
  try {
    return (await execute(command, args, { cwd, env, maxBuffer: 16 * 1024 * 1024 })).stdout.trim();
  } catch (error) {
    throw Error(`${command} ${args[0]} failed:\n${error.stderr || error.stdout || error.message}`.replaceAll(os.homedir(), '~'));
  }
}

/** Build a pinned, feature-local Studio distribution; no host paths or runtime relay ship. */
export async function prepareStudio(config, feature) {
  const bundle = config.studio.bundle;
  const patch = (await fs.readFile(await inside(feature, bundle.patch), 'utf8'))
    .replaceAll('__DOCS_STUDIO_SOURCE_PARAMETER__', bundle.queryParameter);
  const base = config.baseUrl + bundle.mount + '/';
  const key = hash(JSON.stringify([bundle.repository, bundle.revision, patch, base]));
  const cache = await inside(feature, '.studio/' + key);
  const source = await inside(feature, '.studio/' + key + '/source');
  const ready = path.join(cache, 'ready');
  const distribution = async () => {
    const output = await inside(feature, '.studio/' + key + '/source/dist');
    await fs.copyFile(path.join(source, 'LICENSE'), path.join(output, 'LICENSE'));
    await fs.writeFile(path.join(output, 'studio-provenance.json'), JSON.stringify({
      repository: bundle.repository, revision: bundle.revision, adapterSha256: hash(patch), baseUrl: base,
    }, null, 2));
    return output;
  };
  try {
    if (await fs.readFile(ready, 'utf8') === key) {
      await fs.access(path.join(source, 'dist/index.html'));
      return distribution();
    }
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await fs.mkdir(cache, { recursive: true });
  let initialized = true;
  try { await fs.access(path.join(source, '.git')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; initialized = false; }
  if (!initialized) {
    await fs.mkdir(source, { recursive: true });
    await run('git', ['init', '--quiet'], source);
  }
  let origin;
  try { origin = await run('git', ['remote', 'get-url', 'origin'], source); } catch { /* An interrupted initialization may not have added the remote yet. */ }
  if (!origin) await run('git', ['remote', 'add', 'origin', bundle.repository], source);
  else if (origin !== bundle.repository) throw Error('Studio checkout has an unexpected origin');
  let revision;
  try { revision = await run('git', ['rev-parse', '--verify', 'HEAD'], source); } catch { /* Resume an interrupted first fetch. */ }
  if (!revision) {
    await run('git', ['fetch', '--depth=1', 'origin', bundle.revision], source);
    await run('git', ['checkout', '--detach', '--quiet', 'FETCH_HEAD'], source);
  }
  if (await run('git', ['rev-parse', 'HEAD'], source) !== bundle.revision) throw Error('Studio checkout differs from its pinned revision');
  const patchFile = path.join(cache, 'static-entry.patch');
  await fs.writeFile(patchFile, patch);
  // Interrupted builds resume without resetting or discarding source changes.
  try { await run('git', ['apply', '--reverse', '--check', patchFile], source); }
  catch {
    await run('git', ['apply', '--check', patchFile], source);
    await run('git', ['apply', patchFile], source);
  }
  await run('pnpm', ['install', '--frozen-lockfile', '--ignore-scripts'], source);
  await run('pnpm', ['test', 'tests/integration/edit-links.test.ts'], source);
  await run('pnpm', ['build'], source, { ...process.env, VITE_BASE_PATH: base });
  await fs.writeFile(ready, key);
  console.log('Built pinned Studio assets for same-site embedding.');
  return distribution();
}
