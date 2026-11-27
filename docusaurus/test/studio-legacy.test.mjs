import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getConfig } from '../scripts/config.mjs';
import studioLegacyURL from '../src/components/studioLegacyURL.mjs';

test('legacy Studio file/project routes preserve payloads, query bytes and fragments at every mount', () => {
  for (const baseUrl of ['/', '/gamechanger.wallet/', '/nested/docs/']) {
    const config = getConfig({ DOCS_BASE_URL: baseUrl });
    const mount = 'https://preview.test' + baseUrl + 'studio/';
    for (const query of ['', '?view=code', '?embed=true&view=node&extra=a%20b&extra=c%2Bd', '?source=untrusted&view=block']) {
      const url = studioLegacyURL(mount + 'api/2/edit/1-valid_payload' + query + '#section', config);
      assert.equal(url, mount + 'index.html?source=1-valid_payload' + (query ? '&' + query.slice(1) : '') + '#section');
      assert.equal(new URL(url).searchParams.get('source'), '1-valid_payload');
    }
    for (const route of ['api/2/run/1-test', 'api/2/edit/', 'api/2/edit/1-test/extra', 'api/2/edit/%3Cscript%3E', 'index.html']) {
      assert.equal(studioLegacyURL(mount + route, config), null);
    }
    config.studio.bundle.enabled = false;
    assert.equal(studioLegacyURL(mount + 'api/2/edit/1-test', config), null);
  }
});
