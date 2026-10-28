import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { getConfig } from './config.mjs';
import { hash } from './core.mjs';
import { files, inside } from './paths.mjs';

async function verifyLocalReferences(rendered, label, config, feature) {
  for (const [, value] of rendered.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (!value.startsWith('/') || value.startsWith('//')) continue;
    if (!value.startsWith(config.baseUrl)) throw Error(`Local URL uses a different base path on ${label}: ${value}`);
    const relative = decodeURIComponent(value.split(/[?#]/)[0].slice(config.baseUrl.length));
    let filename = await inside(feature, 'build/' + (relative || 'index.html'));
    try {
      if ((await fs.stat(filename)).isDirectory()) filename = path.join(filename, 'index.html');
      if (!(await fs.stat(filename)).isFile()) throw Error('Not a file');
    } catch { throw Error(`Missing static target on ${label}: ${value}. Rebuild for the intended --base-url.`); }
  }
}

export async function main() {
  const feature = fileURLToPath(new URL('../', import.meta.url));
  const generated = await inside(feature, getConfig().paths.generated);
  const config = JSON.parse(await fs.readFile(path.join(generated, 'site-config.json'), 'utf8'));
  const root = path.resolve(feature, config.sourceRoot);
  const fingerprints = JSON.parse(await fs.readFile(path.join(generated, 'sources.json')));
  for (const [filename, fingerprint] of Object.entries(fingerprints)) {
    if (hash(await fs.readFile(await inside(root, filename))) !== fingerprint) throw Error(`Source changed: ${filename}`);
    if (hash(await fs.readFile(await inside(feature, `build/${config.paths.rawMount}/${filename}`))) !== fingerprint) throw Error(`Original artifact not preserved: ${filename}`);
  }
  const routes = JSON.parse(await fs.readFile(path.join(generated, 'routes.json')));
  for (const doc of Object.values(routes)) {
    const page = await inside(feature, 'build/' + (doc.slug === '/' ? '' : doc.slug.slice(1) + '/') + 'index.html');
    if (!(await fs.stat(page)).isFile()) throw Error(`Missing static page: ${doc.source}`);
    const rendered = await fs.readFile(page, 'utf8');
    await verifyLocalReferences(rendered, doc.source, config, feature);
    if (!/<h1(?:\s|>)/.test(rendered)) throw Error(`Missing visible document title: ${doc.source}`);
    const artifactPrefix = config.baseUrl + config.paths.rawMount + '/';
    for (const [, url] of rendered.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (!url.startsWith(artifactPrefix)) continue;
      const filename = decodeURIComponent(url.slice(config.baseUrl.length).split(/[?#]/)[0]);
      if (!(await fs.stat(await inside(feature, `build/${filename}`))).isFile()) throw Error(`Broken artifact URL on ${doc.source}`);
    }
  }
  await fs.access(path.join(feature, 'build', config.search.indexFilename));
  await fs.access(path.join(feature, 'build', '.nojekyll'));
  if (config.features.studio && config.studio.bundle.enabled) {
    const studio = await inside(feature, `build/${config.studio.bundle.mount}/index.html`);
    await verifyLocalReferences(await fs.readFile(studio, 'utf8'), 'Studio', config, feature);
  }
  for (const filename of await files(feature, 'build')) {
    if (filename.startsWith(`build/${config.paths.rawMount}/`) || !/\.(?:html|js|css|json|map)$/.test(filename)) continue;
    if ((await fs.readFile(await inside(feature, filename), 'utf8')).includes(os.homedir())) {
      throw Error(`Host home path leaked into generated output: ${filename}`);
    }
  }
  console.log(`Verified ${Object.keys(fingerprints).length} unchanged sources/original artifacts and ${Object.keys(routes).length} static page routes.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
