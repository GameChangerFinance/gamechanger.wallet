import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { gzipSync } from 'node:zlib';
import { execFile } from 'node:child_process';
import { promisify, parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { getBuildConfig } from '../scripts/config.mjs';
import { prepareStudio } from '../scripts/studio-build.mjs';
import { createPreviewServer } from '../scripts/serve.mjs';

/** Simulated wallet boundary: no accounts, real wallet exports or signing are used. */
export async function main(args = process.argv.slice(2)) {
  const { values } = parseArgs({ args, options: { 'install-browser': { type: 'boolean' }, smoke: { type: 'boolean' }, help: { type: 'boolean' } } });
  if (values.help) { console.log('Usage: pnpm test:browser [--smoke] [--install-browser] (optional DOCS_BROWSER_EXECUTABLE, DOCS_PREVIEW_ORIGIN)'); return; }
  const config = getBuildConfig();
  if (!config.features.studio || !config.studio.bundle.enabled) { console.log('Skipped: bundled Studio is disabled.'); return; }
  const feature = fileURLToPath(new URL('../', import.meta.url));
  const distribution = await prepareStudio(config, feature);
  const source = path.dirname(distribution);
  const require = createRequire(path.join(source, 'package.json'));
  const { chromium } = require('@playwright/test');
  if (values['install-browser']) {
    await promisify(execFile)(process.execPath, [path.join(path.dirname(require.resolve('@playwright/test')), 'cli.js'), 'install', '--with-deps', 'chromium'], { maxBuffer: 16 * 1024 * 1024 });
  }
  const options = { headless: true, args: ['--enable-automation'], ...(process.env.DOCS_BROWSER_EXECUTABLE ? { executablePath: process.env.DOCS_BROWSER_EXECUTABLE } : {}) };
  // Retain disposable profiles, but restore Chrome's normal feature settings:
  // Playwright's default disabled features otherwise hide storage-partition bugs.
  const probe = await chromium.launch(options);
  let disabledFeatures;
  try {
    const session = await probe.newBrowserCDPSession();
    disabledFeatures = (await session.send('Browser.getBrowserCommandLine')).arguments.filter(arg => arg.startsWith('--disable-features='));
  } finally { await probe.close(); }
  const browser = await chromium.launch({ ...options, ignoreDefaultArgs: disabledFeatures });
  let server;
  try {
    let origin = process.env.DOCS_PREVIEW_ORIGIN;
    if (!origin) {
      server = createPreviewServer(path.join(feature, 'build'), config);
      await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
      origin = `http://127.0.0.1:${server.address().port}`;
    }
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    if (values.smoke) {
      // Smoke tests exercise the static artifact, not external analytics or services.
      // The schema fixture registered below takes precedence over this route.
      await context.route('**/*', route => new URL(route.request().url()).origin === origin
        ? route.continue() : route.abort());
    }
    const failures = [];
    context.on('response', response => {
      if (response.status() >= 400 && new URL(response.url()).origin === origin) failures.push(`${response.status()} ${new URL(response.url()).pathname}`);
    });
    const schema = await fs.readFile(path.join(source, 'tests/fixtures/runtime-schema.json'), 'utf8');
    await context.route('https://wallet.gamechanger.finance/schema/**', route => route.fulfill({ body: schema, contentType: 'application/json' }));
    for (const origin of config.studio.walletOrigins) {
      await context.route(origin + '/api/2/run/**', route => route.fulfill({ body: 'Synthetic wallet endpoint', contentType: 'text/html' }));
    }
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const address = new URL(config.baseUrl, origin);
    await page.goto(address.href);
    await page.locator('.navbar').getByRole('link', { name: 'Quick start', exact: true }).click();
    await page.waitForURL(new URL('docs/transactions/quick-start/', address).href);
    await page.reload();
    await page.locator('h1').first().waitFor();
    await page.locator('.studio-example iframe').first().waitFor();
    // Resizing the same page must mount/unmount embeds without a reload.
    const embeds = page.locator('.studio-example iframe');
    const setEmbedMode = async mode => {
      await page.getByRole('button', { name: config.labels.options, exact: true }).click();
      await page.locator('dialog[open]').getByLabel('Embedded IDE', { exact: true }).selectOption(mode);
      await page.getByRole('button', { name: 'Done', exact: true }).click();
    };
    await page.setViewportSize({ width: config.studio.mobileMaxWidth, height: 800 });
    await embeds.first().waitFor({ state: 'detached' });
    assert.ok(await page.locator('pre').count() > 0);
    await setEmbedMode('always');
    await embeds.first().waitFor();
    await page.reload();
    await embeds.first().waitFor();
    await setEmbedMode('never');
    await embeds.first().waitFor({ state: 'detached' });
    await page.setViewportSize({ width: config.studio.mobileMaxWidth + 1, height: 800 });
    assert.equal(await embeds.count(), 0);
    await setEmbedMode('not on mobile');
    await embeds.first().waitFor();
    await page.setViewportSize({ width: 1280, height: 800 });
    console.log('Passed embedded IDE modes, live breakpoint resizing and saved preference reload.');
    await page.getByRole('button', { name: config.labels.search, exact: true }).click();
    await page.getByLabel('Search guides and examples').fill('wallet');
    const searchResult = page.locator('.search-results a').first();
    await searchResult.waitFor();
    assert.ok(new URL(await searchResult.getAttribute('href'), address).pathname.startsWith(config.baseUrl));
    await page.getByRole('button', { name: 'Close search', exact: true }).click();
    const original = await context.request.get(new URL(config.paths.rawMount + '/LICENSE', address).href);
    assert.equal(original.status(), 200);
    await page.goto(new URL('docs/gcscript/syntax/#blocks-of-code', address).href);
    const iframe = page.locator('.studio-example iframe').first();
    await iframe.scrollIntoViewIfNeeded();
    assert.equal(new URL(await iframe.getAttribute('src'), address).origin, address.origin);
    const frame = await (await iframe.elementHandle()).contentFrame();
    await frame.locator('.monaco-editor').waitFor();
    if (!values.smoke) {
      const runtime = await fs.readFile(path.join(source, 'src/config.ts'), 'utf8');
      const projectKey = /project: '([^']+)'/.exec(runtime)[1];
      const runKey = /run: '([^']+)'/.exec(runtime)[1];
      const prefix = /embeddedStoragePrefix: '([^']+)'/.exec(runtime)[1];
      const keys = { project: prefix + projectKey, run: prefix + runKey + ':' };
      const launched = page.waitForEvent('popup');
      await frame.getByRole('button', { name: 'Run', exact: true }).click();
      const popup = await launched;
      await popup.waitForLoadState('domcontentloaded');
      const pending = await frame.evaluate(key => {
        const match = Object.keys(localStorage).find(item => item.startsWith(key));
        if (!match) throw Error('Missing synthetic pending run');
        return JSON.parse(localStorage.getItem(match));
      }, keys.run);
      await popup.evaluate(() => { window.opener = null; });
      const callback = new URL(config.studio.bundle.mount + '/index.html', address);
      callback.searchParams.set('result', '1-' + gzipSync(JSON.stringify({ exports: { syntheticAnswer: 42 } })).toString('base64url'));
      callback.hash = 'studioRun=' + encodeURIComponent('embed:' + pending.token);
      const closed = popup.waitForEvent('close', { timeout: 20000 });
      await popup.goto(callback.href).catch(error => {
        if (!popup.isClosed() && !String(error).includes('ERR_ABORTED')) throw error;
      });
      await closed;
      await frame.getByRole('status').filter({ hasText: 'Wallet exports captured' }).waitFor();
      const saved = await frame.evaluate(({ keys, pending }) => {
        const project = JSON.parse(localStorage.getItem(keys.project)).project;
        return { projectId: project.id, text: project.files[pending.resultsPath]?.text, pending: localStorage.getItem(keys.run + pending.token) };
      }, { keys, pending });
      assert.equal(saved.projectId, pending.projectId);
      assert.equal(JSON.parse(saved.text).exports.syntheticAnswer, 42);
      assert.equal(saved.pending, null);
    }
    assert.equal(await page.locator('.studio-toolbar').count(), 0);
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await fs.mkdir(path.join(feature, 'test-results'), { recursive: true });
      await page.screenshot({ path: path.join(feature, 'test-results', `studio-${values.smoke ? 'smoke' : 'wallet-return'}-${width}.png`) });
    }
    assert.deepEqual(failures, []);
    console.log(`Passed at ${config.baseUrl}: navigation, deep-link reload, search, original files, local assets, embedded editor and desktop/mobile layout.${values.smoke ? ' Wallet popup/return integration is localhost-only and was not run.' : ' Studio exports, pending cleanup and popup close passed.'}`);
    await context.close();
  } finally {
    await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
