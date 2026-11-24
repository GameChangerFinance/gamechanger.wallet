import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { test } from 'node:test';
import config from '../site.config.mjs';
import { documentInfo, encodeExample, isGCScript, markdown, navigation, transform } from '../scripts/core.mjs';
import { cleanGenerated, inside } from '../scripts/paths.mjs';
import { getConfig } from '../scripts/config.mjs';
import { readPreferences, studioFrameHeight, studioURL, walletPayload, walletIDEURL } from '../src/components/studio.mjs';

function render(source, filename = 'docs/test.md') {
  const documents = new Map(['README.md', 'docs/README.md', 'examples/a (b).md'].map(file => [file, documentInfo(file, config)]));
  const diagnostics = [];
  return { ...transform(source, { filename, config, documents,
    artifacts: new Set(['docs/image.png', 'examples/a.html']), diagnostics }), diagnostics };
}

test('links, images, encoded filenames, queries and fragments retain their identity', () => {
  const result = render('[home](../README.md#intro)\n\n[x](../examples/a%20%28b%29.md?q=1#next)\n\n![image](image.png)\n\n<a href="../examples/a.html">example</a>');
  assert.match(result.content, /gamechanger.wallet\/#intro/);
  assert.match(result.content, /examples\/a-b\/\?q=1#next/);
  assert.match(result.content, /original\/docs\/image.png/);
  assert.match(result.content, /original\/examples\/a.html/);
  assert.match(result.content, /<a href=.*>example<\/a>/);
  assert.equal(result.diagnostics.length, 0);
});

test('generated Studio payloads preserve JSONC comments and original bytes', () => {
  const code = '{\n// keep comment\n"type":"script", "run":{},\n}';
  assert.ok(isGCScript(code, config));
  const result = render('```jsonc\n' + code + '\n```');
  const node = result.tree.children[0];
  assert.equal(node.value, code);
  const envelope = JSON.parse(gunzipSync(Buffer.from(node.meta.slice('studio=1-'.length), 'base64url')));
  assert.equal(envelope.file.text, code);
  assert.equal(envelope.format, 'gcscript-studio-file');
  assert.equal(isGCScript('{"type":"data"}', config), true);
  assert.equal(isGCScript('{"type":"script",broken}', config), false);
});

test('Studio accepts any root string type while rejecting nested types, arrays and malformed JSONC', () => {
  for (const type of ['data', 'buildTx', 'custom-function', '']) {
    const code = '{\n// JSONC comment\n"type":' + JSON.stringify(type) + ',\n}';
    assert.equal(isGCScript(code, config), true);
    assert.match(render('```jsonc\n' + code + '\n```').tree.children[0].meta, /^studio=/);
  }
  for (const code of ['{"nested":{"type":"script"}}', '[{"type":"script"}]', '{"type":1}', '{"type":null}', '{"type":{}}', 'null', '"script"', '{"type":"script",broken}', '{"__proto__":{"type":"script"}}']) {
    assert.equal(isGCScript(code, config), false, code);
  }
  const restricted = structuredClone(config);
  restricted.transforms.scriptTypes = ['script', 'macro'];
  assert.equal(isGCScript('{"type":"data"}', restricted), false);
});

test('the canonical Quick start guide injects its js-labelled JSONC code into Studio', async () => {
  const source = await fs.readFile(new URL('../../docs/transactions/quick-start.md', import.meta.url), 'utf8');
  const code = markdown.parse(source).children.find(node => node.type === 'code');
  assert.equal(code.lang, 'js');
  const generated = render(source, 'docs/transactions/quick-start.md').tree.children.find(node => node.type === 'code');
  assert.equal(generated.value, code.value);
  assert.match(generated.meta, /^studio=/);
});

test('Studio detection uses GCScript content across every Markdown location and fence language', () => {
  const code = '{\n// preserved JSONC comment\n"type":"script", "run":{},\n}';
  for (const filename of ['README.md', 'docs/transactions/payments.md', 'docs/workspaces/keys.md', 'examples/demo.md', 'catalyst/guide.md', 'release/README.md']) {
    for (const language of ['json', 'jsonc', 'js', 'javascript', 'gcscript', 'txt', '']) {
      const { tree } = render('```' + language + '\n' + code + '\n```', filename);
      assert.match(tree.children[0].meta, /^studio=/, `${filename} (${language || 'unlabelled'})`);
      assert.equal(tree.children[0].value, code);
    }
  }
  assert.equal(render('```js\nconst app = {type: "script"};\n```').tree.children[0].meta, null);
  assert.equal(render('```json\n{"exports":{}}\n```').tree.children[0].meta, null);
  const restricted = structuredClone(config);
  restricted.transforms.codeLanguages = ['json', 'jsonc'];
  const { tree } = transform('```js\n' + code + '\n```', {
    config: restricted, filename: 'docs/guide.md', documents: new Map(), artifacts: new Set(), diagnostics: [],
  });
  assert.equal(tree.children[0].meta, null);
});

test('markers omit only generated content and never match fenced examples', () => {
  const source = 'before\n\n<!-- docs:omit:start -->\nhidden\n<!-- docs:omit:end -->\n\nafter\n\n```md\n<!-- docs:omit:start -->\n```';
  const result = render(source);
  assert.doesNotMatch(result.content, /hidden/);
  assert.match(result.content, /after/);
  assert.match(result.content, /docs:omit:start/);
  assert.throws(() => render('<!-- docs:omit:end -->'), /unmatched/);
  assert.throws(() => render('<!-- docs:omit:start -->'), /unclosed/);
  assert.match(render('<!-- docs:studio -->\n\n```json\n{"example":1}\n```').tree.children[0].meta, /^studio=/);
  assert.equal(render('<!-- docs:no-studio -->\n\n```json\n{"type":"script"}\n```').tree.children[0].meta, null);
});

test('configured text patterns do not rewrite code or URL payloads', () => {
  const custom = structuredClone(config);
  custom.transforms.textPatterns.push({ pattern: 'Old', replacement: 'New' });
  const output = transform('Old\n\n`Old`\n\n```txt\nOld\n```', { config: custom, filename: 'README.md', documents: new Map(), artifacts: new Set(), diagnostics: [] });
  assert.match(output.content, /^New/);
  assert.match(output.content, /`Old`/);
  assert.match(output.content, /txt\nOld/);
});

test('navigation follows canonical index order and includes unlisted files', () => {
  const documents = new Map(['docs/README.md', 'docs/a.md', 'docs/b.md'].map(file => [file, documentInfo(file, config)]));
  const trees = new Map([['docs/README.md', markdown.parse('[B](b.md)\n\n[A](a.md)')]]);
  const result = navigation(config, documents, trees);
  assert.deepEqual(result[0].items, ['docs/README.md', 'docs/b.md', 'docs/a.md'].map(file => documents.get(file).id));
});

test('navigation nests linked directory indexes without duplicating documents', () => {
  const sources = ['docs/README.md', 'docs/topic/README.md', 'docs/topic/first.md', 'docs/topic/unlisted.md'];
  const documents = new Map(sources.map(file => [file, documentInfo(file, config)]));
  const trees = new Map([
    ['docs/README.md', markdown.parse('[Topic](topic/README.md)\n\n[First](topic/first.md)')],
    ['docs/topic/README.md', markdown.parse('[First](first.md)')],
  ]);
  const result = navigation(config, documents, trees)[0];
  assert.equal(result.items[1].label, 'Topic');
  assert.equal(result.items[1].link.id, documents.get('docs/topic/README.md').id);
  assert.deepEqual(result.items[1].items, sources.slice(2).map(file => documents.get(file).id));
});

test('configured canonical site URLs map into preview mounts independently of public origin', () => {
  const custom = getConfig({ DOCS_URL: 'https://preview.example', DOCS_BASE_URL: '/review/' });
  const filename = 'README.md';
  const result = transform('[try](https://gamechangerfinance.github.io/gamechanger.wallet/examples/a.html)', {
    config: custom, filename, documents: new Map(), artifacts: new Set(['examples/a.html']), diagnostics: [],
  });
  assert.match(result.content, /\/review\/original\/examples\/a.html/);
});

test('path guards reject traversal, symlinks and unowned cleanup targets using disposable fixtures', async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), 'gc-docs-paths-'));
  try {
    await assert.rejects(inside(fixture, ''), /nonempty/);
    await assert.rejects(inside(fixture, '../escape'), /escapes/);
    await assert.rejects(cleanGenerated(fixture, 'docs'), /feature-local/);
    await fs.mkdir(path.join(fixture, 'source'));
    await fs.symlink(path.join(fixture, 'source'), path.join(fixture, 'linked'));
    await assert.rejects(inside(fixture, 'linked/file'), /Symlink/);
    await fs.mkdir(path.join(fixture, '.generated'));
    await assert.rejects(cleanGenerated(fixture, '.generated'), /unowned/);
    await fs.writeFile(path.join(fixture, '.generated', '.generator-owned'), 'foreign');
    await assert.rejects(cleanGenerated(fixture, '.generated'), /unowned/);
    await fs.writeFile(path.join(fixture, '.generated', '.generator-owned'), 'gc-docs-v1\n');
    await fs.symlink(path.join(fixture, 'source'), path.join(fixture, '.generated', 'symlink'));
    await assert.rejects(cleanGenerated(fixture, '.generated'), /Symlink/);
  } finally {
    // Fixture root is created by mkdtemp above, never a host/project target.
    assert.ok(path.basename(fixture).startsWith('gc-docs-paths-'));
    await fs.rm(fixture, { recursive: true });
  }
});

test('UDC links preserve only encoded intent and reject lookalike origins/paths', () => {
  assert.equal(walletPayload('https://wallet.gamechanger.finance/api/2/run/1-abc?networkTag=mainnet&ref=secret', config), '1-abc');
  assert.equal(walletPayload('https://wallet.gamechanger.finance.attacker.test/api/2/run/1-abc', config), null);
  assert.equal(walletPayload('javascript:alert(1)', config), null);
  assert.equal(walletPayload('https://wallet.gamechanger.finance/api/2/edit/1-abc', config), null);
  const prefs = readPreferences(null, config);
  const url = new URL(studioURL('1-abc', config, prefs, 'light', true), config.url);
  assert.equal(url.searchParams.get('embed'), 'true');
  assert.equal(url.searchParams.get('view'), 'code');
  assert.equal(url.searchParams.has('ref'), false);
  assert.equal(url.searchParams.has('theme'), false);
  assert.equal(studioURL('../malicious', config, prefs, 'dark'), null);
  const supported = structuredClone(config);
  supported.studio.themeParameter = 'theme';
  assert.equal(new URL(studioURL(encodeExample('{}', 'test.gcscript'), supported, prefs, 'light')).searchParams.get('theme'), 'light');
});

test('embedded Studio stays on the serving site at root and nested mounts, with static-entry payloads', () => {
  for (const baseUrl of ['/', '/review/docs/']) {
    const custom = getConfig({ DOCS_URL: 'https://production.example', DOCS_BASE_URL: baseUrl });
    const prefs = readPreferences(null, custom);
    const relative = studioURL('1-example', custom, prefs, 'dark', true);
    assert.ok(relative.startsWith('/') && !relative.startsWith('//'));
    const local = new URL(relative, 'http://127.0.0.1:4178');
    assert.equal(local.origin, 'http://127.0.0.1:4178');
    assert.equal(local.pathname, baseUrl + custom.studio.bundle.mount + '/index.html');
    assert.equal(local.searchParams.get(custom.studio.bundle.queryParameter), '1-example');
    assert.equal(local.searchParams.has('result'), false);
    assert.ok(studioURL('1-example', custom, prefs, 'dark').startsWith(custom.studio.editUrl));
    custom.studio.bundle.enabled = false;
    assert.ok(studioURL('1-example', custom, prefs, 'dark', true).startsWith(custom.studio.editUrl));
  }
});

test('preferences and deployment URL options validate untrusted values', () => {
  const defaults = readPreferences(null, config);
  assert.deepEqual(readPreferences('{"version":999,"view":"block","theme":"light"}', config), defaults);
  assert.deepEqual(readPreferences('{"version":1,"view":"evil","theme":"light"}', config), defaults);
  assert.equal(readPreferences('{"version":1,"view":"block","theme":"light"}', config).view, 'block');
  assert.equal(getConfig({ DOCS_URL: 'https://docs.example', DOCS_BASE_URL: '/preview/' }).baseUrl, '/preview/');
  assert.throws(() => getConfig({ DOCS_BASE_URL: '/../../' }), /BASE_URL/);
  assert.throws(() => getConfig({ DOCS_URL: 'javascript:alert(1)' }), /HTTP/);
});

test('Studio code height grows with lines and wrapping while graphical views stay bounded', () => {
  const short = '{\n  "type": "script",\n  "run": {}\n}';
  const long = Array.from({ length: 50 }, () => 'x'.repeat(100)).join('\n');
  const wide = studioFrameHeight(long, 'code', 1000, config);
  const narrow = studioFrameHeight(long, 'code', 390, config);
  assert.ok(wide > studioFrameHeight(short, 'code', 1000, config));
  assert.ok(narrow > wide);
  assert.equal(studioFrameHeight(short + '\n', 'code', 1000, config), studioFrameHeight(short.replaceAll('\n', '\r\n'), 'code', 1000, config));
  assert.equal(studioFrameHeight(long, 'node', 390, config), config.studio.frameHeight);
  assert.equal(studioFrameHeight(long, 'block', 390, config), config.studio.frameHeight);
  assert.equal(studioFrameHeight(long.repeat(1000), 'code', 390, config), config.studio.codeSizing.maxHeight);
});

test('Markdown run image links normalize without changing query strings', () => {
  const href = 'https://wallet.gamechanger.finance/api/2/run/1-abc?networkTag=preprod&ref=a%2Bb&x=1&x=2#keep';
  for (const filename of ['docs/gcscript/guide.md', 'examples/demo.md']) {
    for (const source of [`[![Run](/docs/img/btn/run-preprod.png)](${href})`]) {
      const result = render(source, filename);
      assert.doesNotMatch(result.content, /run-(?:preprod|mainnet)\.png/);
      assert.match(result.content, /Run in Wallet/);
      assert.ok(result.content.replaceAll('&amp;', '&').replaceAll('&#x26;', '&').replaceAll('\\&', '&').includes(href));
    }
  }
});


test('wallet IDE links retain duplicate queries, encoded characters, callback parameters and fragments', () => {
  const href = 'https://wallet.gamechanger.finance/api/2/run/1-abc?networkTag=preprod&x=a%2Bb&x=2&returnURLPattern=https%3A%2F%2Fdapp.test%2F%3Fresult%3D%7Bresult%7D#keep';
  const result = walletIDEURL(href, config, readPreferences(null, config), 'dark');
  assert.ok(new URL(result).search.endsWith(new URL(href).search.slice(1)));
  assert.equal(new URL(result).hash, '#keep');
  assert.equal(new URL(result).pathname.split('/').at(-1), '1-abc');
  assert.equal(readPreferences(JSON.stringify({version:1,view:'code',theme:'match',walletMode:'unknown'}), config).walletMode, 'popup');
});

test('QR footer truncation changes only display text and retains both URL ends', async () => {
  const { truncateURL } = await import('../src/components/studio.mjs');
  assert.equal(truncateURL('abcde', 10), 'abcde');
  const href = 'https://wallet.gamechanger.finance/api/2/run/' + 'x'.repeat(200) + '?networkTag=preprod';
  const display = truncateURL(href, 88);
  assert.equal(display.length, 88);
  assert.ok(display.startsWith('https://wallet.gamechanger.finance/'));
  assert.ok(display.endsWith('?networkTag=preprod'));
  assert.ok(display.includes('..'));
});

test('embedded IDE preferences migrate existing settings and reject unknown modes', () => {
  const saved = { version: 1, view: 'block', theme: 'light', walletMode: 'tab' };
  assert.equal(readPreferences(null, config).embedMode, 'not on mobile');
  assert.deepEqual(readPreferences(JSON.stringify(saved), config), { ...saved, embedMode: 'not on mobile' });
  for (const embedMode of config.studio.embedModes) {
    assert.equal(readPreferences(JSON.stringify({ ...saved, embedMode }), config).embedMode, embedMode);
  }
  assert.equal(readPreferences(JSON.stringify({ ...saved, embedMode: 'invalid' }), config).embedMode, 'not on mobile');
});
