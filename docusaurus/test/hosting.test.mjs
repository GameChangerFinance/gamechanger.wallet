import assert from 'node:assert/strict';
import { test } from 'node:test';
import { main } from '../scripts/docs.mjs';
import { getConfig } from '../scripts/config.mjs';
import { documentInfo, transform } from '../scripts/core.mjs';

test('hosting uses configured defaults and explicit overrides, independent of provider variables', () => {
  assert.equal(getConfig({}).baseUrl, '/gamechanger.wallet/');
  for (const env of [
    { NETLIFY: 'true', DEPLOY_PRIME_URL: 'https://preview.netlify.app' },
    { VERCEL: '1', VERCEL_URL: 'preview.vercel.app' },
  ]) {
    const config = getConfig(env);
    assert.equal(config.baseUrl, '/gamechanger.wallet/');
    assert.equal(config.url, 'https://gamechangerfinance.github.io');
    const overridden = getConfig({ ...env, DOCS_BASE_URL: '/custom/', DOCS_URL: 'https://docs.example' });
    assert.equal(overridden.baseUrl, '/custom/');
    assert.equal(overridden.url, 'https://docs.example');
  }
  assert.equal(getConfig({ NETLIFY: 'false', VERCEL: '0' }).baseUrl, '/gamechanger.wallet/');
  assert.equal(getConfig({ DOCS_BASE_URL: '/', DOCS_URL: 'https://apache.example' }).baseUrl, '/');
  assert.throws(() => getConfig({ DOCS_BASE_URL: 'auto' }), /absolute path with a trailing slash/);
});

test('root and nested hosting rewrite canonical absolute/root links, images, queries and fragments', () => {
  for (const baseUrl of ['/', '/custom/docs/']) {
    const config = getConfig({ DOCS_BASE_URL: baseUrl, DOCS_URL: 'https://preview.example' });
    const documents = new Map(['README.md', 'docs/a.md'].map(source => [source, documentInfo(source, config)]));
    const { content } = transform('[home](/README.md)\n\n[a](https://gamechangerfinance.github.io/gamechanger.wallet/docs/a.md?q=1#part)\n\n![logo](/img/a%20b.png)', {
      config, filename: 'README.md', documents, artifacts: new Set(['img/a b.png']), diagnostics: [],
    });
    assert.ok(content.includes(`](${baseUrl})`));
    assert.ok(content.includes(`${baseUrl}docs/a/?q=1#part`));
    assert.ok(content.includes(`${baseUrl}original/img/a%20b.png`));
    assert.ok(!content.includes('/gamechanger.wallet/'));
  }
});

test('a root deployment preserves unrelated project links on the same origin', () => {
  const config = getConfig({ DOCS_BASE_URL: '/' });
  const href = 'https://gamechangerfinance.github.io/gcscript-studio/';
  const diagnostics = [];
  const { content } = transform(`[Studio](${href})`, {
    config, filename: 'README.md', documents: new Map(), artifacts: new Set(), diagnostics,
  });
  assert.ok(content.includes(href));
  assert.deepEqual(diagnostics, []);
});

test('build and generate expose hosting flags and reject invalid arguments before generation', async context => {
  const log = context.mock.method(console, 'log', () => {});
  for (const command of ['build', 'generate', 'start']) {
    await main([command, '--help']);
    assert.match(log.mock.calls.at(-1).arguments[0], /--base-url/);
    await assert.rejects(main([command, '--base-url', '/../']), /absolute path with a trailing slash/);
    await assert.rejects(main([command, '--base-url=']), /cannot be empty/);
  }
});
