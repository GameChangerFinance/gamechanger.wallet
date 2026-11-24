import assert from 'node:assert/strict';
import { test } from 'node:test';
import sanitizeMarkdown from '../scripts/sanitize.mjs';

test('sanitization removes executable HTML while preserving generated TOC and code metadata', () => {
  const element = (tagName, properties = {}, children = []) => ({ type: 'element', tagName, properties, children });
  const metadata = { type: 'mdxjsEsm', value: 'export const toc = []' };
  const tree = { type: 'root', children: [
    element('script', {}, [{ type: 'text', value: 'alert(1)' }]),
    element('img', { src: 'https://example.test/a.png', onError: 'alert(1)' }),
    element('a', { href: 'javascript:alert(1)' }, [{ type: 'text', value: 'test' }]),
    element('iframe', { src: 'https://attacker.test' }),
    element('h2', { id: 'overview' }, [{ type: 'text', value: 'Overview' }]),
    element('code', { metastring: 'studio=1-test', className: ['language-json'] }),
    element('div', { id: 'clobber', name: 'clobber' }), metadata,
    { type: 'mdxJsxFlowElement', name: 'header', attributes: [], children: [element('h1', { id: 'title' }, [{ type: 'text', value: 'Visible title' }])] },
  ] };
  const result = sanitizeMarkdown()(tree);
  assert.equal(result.children.some(node => ['script', 'iframe'].includes(node.tagName)), false);
  assert.equal(result.children.find(node => node.tagName === 'img').properties.onError, undefined);
  assert.equal(result.children.find(node => node.tagName === 'a').properties.href, undefined);
  assert.equal(result.children.find(node => node.tagName === 'h2').properties.id, 'overview');
  assert.equal(result.children.find(node => node.tagName === 'code').properties.metastring, 'studio=1-test');
  assert.equal(result.children.find(node => node.tagName === 'div').properties.id, 'user-content-clobber');
  assert.equal(result.children.at(-1), metadata);
  assert.equal(result.children.find(node => node.tagName === 'header').children[0].tagName, 'h1');
});

test('HTML run image normalization preserves the entire wallet href', () => {
  const href = 'https://wallet.gamechanger.finance/api/2/run/1-abc?networkTag=preprod&x=a%2Bb&x=2#keep';
  const tree = { type: 'root', children: [{ type: 'element', tagName: 'a', properties: { href }, children: [{ type: 'element', tagName: 'img', properties: { src: '/original/docs/img/btn/run-preprod.png' }, children: [] }] }] };
  const link = sanitizeMarkdown()(tree).children[0];
  assert.equal(link.properties.href, href);
  assert.deepEqual(link.children, [{ type: 'text', value: 'Run in Wallet…' }]);
});
