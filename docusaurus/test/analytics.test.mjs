import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getConfig } from '../scripts/config.mjs';
import { analyticsTags } from '../scripts/analytics.mjs';

test('analytics is optional and only accepts GA4 measurement IDs', () => {
  for (const value of [undefined, '', '  ']) {
    const config = getConfig({ GOOGLE_ANALYTICS_ID: value });
    assert.deepEqual(analyticsTags(config.analytics), []);
  }
  const config = getConfig({ GOOGLE_ANALYTICS_ID: ' G-TEST123456 ' });
  const tags = analyticsTags(config.analytics);
  assert.equal(tags.length, 2);
  assert.equal(tags[0].attributes.src, 'https://www.googletagmanager.com/gtag/js?id=G-TEST123456');
  assert.equal(tags[0].attributes.async, true);
  assert.match(tags[1].innerHTML, /gtag\('config', 'G-TEST123456'\)/);
  for (const id of ['UA-123-1', '</script>', 'G-ABC?x=1']) {
    assert.throws(() => getConfig({ GOOGLE_ANALYTICS_ID: id }), /GA4 measurement ID/);
    assert.throws(() => analyticsTags({ measurementId: id }), /Invalid GA4/);
  }
});
