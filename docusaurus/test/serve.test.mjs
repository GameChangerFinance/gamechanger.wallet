import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { resolveRequest } from '../scripts/serve.mjs';

test('preview preserves HTML, long extensions, encoded filenames and directory routes', async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), 'gc-docs-preview-'));
  try {
    await fs.mkdir(path.join(fixture, 'original'));
    await fs.mkdir(path.join(fixture, 'guide'));
    for (const filename of ['index.html', 'guide/index.html', 'original/a b.gcscript', 'original/a b.html', 'original/LICENSE']) {
      await fs.writeFile(path.join(fixture, filename), 'fixture');
    }
    for (const url of ['/docs/', '/docs/guide/?q=1', '/docs/original/a%20b.gcscript', '/docs/original/a%20b.html', '/docs/original/LICENSE']) {
      const result = await resolveRequest(fixture, '/docs/', url);
      assert.equal(result.status, 200);
      assert.equal(result.size, 7);
    }
    assert.deepEqual(await resolveRequest(fixture, '/docs/', '/docs/guide?q=1'), { status: 308, location: '/docs/guide/?q=1' });
    assert.deepEqual(await resolveRequest(fixture, '/docs/', '/docs?q=1'), { status: 308, location: '/docs/?q=1' });
    assert.equal((await resolveRequest(fixture, '/docs/', '/wrong/')).status, 404);
    assert.equal((await resolveRequest(fixture, '/docs/', '/docs/%2e%2e/secret')).status, 400);
    assert.equal((await resolveRequest(fixture, '/docs/', '/docs/%zz')).status, 400);
    await fs.symlink(path.join(fixture, 'index.html'), path.join(fixture, 'linked'));
    await assert.rejects(resolveRequest(fixture, '/docs/', '/docs/linked'), /Symlink/);
  } finally {
    assert.ok(path.basename(fixture).startsWith('gc-docs-preview-'));
    await fs.rm(fixture, { recursive: true });
  }
});
