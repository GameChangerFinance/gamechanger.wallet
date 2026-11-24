import path from 'node:path';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { parse } from 'jsonc-parser';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import { walletPayload } from '../src/components/studio.mjs';

export const markdown = unified().use(remarkParse).use(remarkGfm).use(remarkStringify);

export const hash = value => createHash('sha256').update(value).digest('hex');
export const plainText = node => node.value ?? (node.children ?? []).map(plainText).join('');
export const encodePath = value => value.split('/').map(encodeURIComponent).join('/');

export function documentInfo(source, config) {
  const segments = source.replace(/\.md$/i, '').split('/');
  if (segments.at(-1).toLowerCase() === 'readme') segments.pop();
  const slug = config.routeOverrides?.[source] ?? '/' + segments.map(segment => segment.normalize('NFKC').toLowerCase()
    .replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-|-$/g, '') || 'page').join('/');
  if (!/^\/(?:[\p{L}\p{N}_-]+(?:\/[\p{L}\p{N}_-]+)*)?$/u.test(slug)) throw Error('Route overrides must be safe absolute slugs without trailing slashes');
  return { source, id: `doc-${hash(source).slice(0, 16)}`, slug,
    url: config.baseUrl + (slug === '/' ? '' : encodePath(slug.slice(1)) + '/') };
}

/** Comments/formatting are transported losslessly in Studio's documented envelope. */
export function encodeExample(source, filename) {
  return '1-' + gzipSync(JSON.stringify({ format: 'gcscript-studio-file', version: 1,
    path: filename, file: { text: source, encoding: 'utf8' } }), { mtime: 0 }).toString('base64url');
}

export function isGCScript(source, config) {
  const errors = [];
  const value = parse(source, errors, { allowTrailingComma: true });
  return errors.length === 0 && value !== null && typeof value === 'object' && !Array.isArray(value) &&
    Object.hasOwn(value, 'type') && typeof value.type === 'string' &&
    (config.transforms.scriptTypes.includes('*') || config.transforms.scriptTypes.includes(value.type));
}

/** Stage transforms only generated ASTs; code and canonical inputs stay unchanged. */
export function transform(source, context) {
  const { config, filename, documents, artifacts, diagnostics } = context;
  const tree = markdown.parse(source);
  const textPatterns = config.transforms.textPatterns.map(rule => ({
    regex: new RegExp(rule.pattern, rule.flags ?? 'g'), replacement: rule.replacement,
  }));
  const rewrite = (input, staticImage = false) => {
    if (!input || input.startsWith('#') || /^(?:mailto:|tel:|data:)/i.test(input)) return input;
    let href = input;
    if (/^https?:/i.test(href)) {
      const url = new URL(href);
      const site = config.sourceSites.find(candidate => url.origin === candidate.url && url.pathname.startsWith(candidate.baseUrl));
      if (!site) return input;
      href = '/' + url.pathname.slice(site.baseUrl.length) + url.search + url.hash;
    } else if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')) return input;
    const split = href.search(/[?#]/);
    const pathname = split < 0 ? href : href.slice(0, split);
    const suffix = split < 0 ? '' : href.slice(split);
    let decoded;
    try { decoded = decodeURIComponent(pathname); } catch { return input; }
    const target = path.posix.normalize(decoded.startsWith('/') ? decoded.slice(1) :
      path.posix.join(path.posix.dirname(filename), decoded));
    if (target.startsWith('../')) throw Error(`${filename}: link escapes source root`);
    const doc = documents.get(target) ?? documents.get(target === '.' ? 'README.md' : target.replace(/\/$/, '') + '/README.md');
    if (doc) return doc.url + suffix;
    // The generator validates these files and copies them byte-for-byte. Use
    // Docusaurus's documented pathname escape to retain public artifact paths
    // rather than rebundling/renaming images (including encoded filenames).
    if (artifacts.has(target)) return (staticImage ? 'pathname://' : '') + config.baseUrl + config.paths.rawMount + '/' + encodePath(target) + suffix;
    diagnostics.push({ source: filename, target, reason: 'Missing canonical target; retained as repository link' });
    return config.repository + '/blob/' + config.sourceBranch + '/' + encodePath(target) + suffix;
  };

  // Markers must be standalone HTML comments outside code. Mispaired markers fail.
  function filter(parent, state = { omitting: false, hint: null }) {
    const children = [];
    for (const node of parent.children ?? []) {
      const comment = node.type === 'html' ? /^<!--\s*([^]*?)\s*-->$/.exec(node.value.trim())?.[1].trim() : null;
      if (comment === config.transforms.omitStart) {
        if (state.omitting) throw Error(`${filename}: nested omit marker`);
        state.omitting = true;
        continue;
      }
      if (comment === config.transforms.omitEnd) {
        if (!state.omitting) throw Error(`${filename}: unmatched omit end marker`);
        state.omitting = false;
        continue;
      }
      if (state.omitting) continue;
      if ([config.transforms.forceStudio, config.transforms.skipStudio].includes(comment)) {
        state.hint = comment;
        continue;
      }
      if (node.type === 'code') {
        if (config.features.studio && state.hint !== config.transforms.skipStudio &&
            (state.hint === config.transforms.forceStudio ||
            ((config.transforms.codeLanguages.includes('*') || config.transforms.codeLanguages.includes(node.lang)) && isGCScript(node.value, config)))) {
          const encoded = encodeExample(node.value, path.posix.basename(filename, '.md') + '.gcscript');
          if (encoded.length <= config.studio.maxEncodedLength) node.meta = [node.meta, `studio=${encoded}`].filter(Boolean).join(' ');
          else diagnostics.push({ source: filename, reason: 'Example exceeds Studio encoded payload limit' });
        }
        state.hint = null;
      }
      if (node.children) filter(node, state);
      children.push(node);
    }
    parent.children = children;
    return state;
  }
  if (filter(tree).omitting) throw Error(`${filename}: unclosed omit marker`);
  const buttonImage = new RegExp(config.transforms.runButtonImagePattern);
  visit(tree, 'link', node => {
    if (walletPayload(node.url, config) && node.children.length === 1 && node.children[0].type === 'image' && buttonImage.test(rewrite(node.children[0].url, true))) {
      node.children = [{ type: 'text', value: config.labels.runWallet }];
    }
  });
  visit(tree, node => {
    if (['link', 'image', 'definition'].includes(node.type)) node.url = rewrite(node.url, node.type === 'image');
    if (node.type === 'text') for (const rule of textPatterns) node.value = node.value.replace(rule.regex, rule.replacement);
    if (node.type === 'html') {
      // Keep partial inline HTML tags intact. Sanitization belongs after the
      // renderer has combined them into a complete HTML tree.
      node.value = node.value.replace(/\b(href|src)=(['"])(.*?)\2/gi,
        (_, attribute, quote, url) => `${attribute}=${quote}${rewrite(url.replaceAll('&amp;', '&')).replaceAll('&', '&amp;').replaceAll(quote, quote === '"' ? '&quot;' : '&#39;')}${quote}`);
    }
  });
  return { tree, content: markdown.stringify(tree) };
}

/** Navigation retains each index's link order, then appends unlisted documents. */
export function navigation(config, documents, trees) {
  const used = new Set();
  function itemsFor(index, directory) {
    const items = [];
    const add = (doc, label) => {
      if (!doc || used.has(doc.source)) return;
      used.add(doc.source);
      const childDirectory = path.posix.dirname(doc.source);
      if (directory && childDirectory !== directory && path.posix.basename(doc.source).toLowerCase() === 'readme.md') {
        const children = itemsFor(doc.source, childDirectory);
        if (children.length) items.push({ type: 'category', label: label || childDirectory.split('/').at(-1),
          link: { type: 'doc', id: doc.id }, collapsed: true, items: children });
        else items.push(doc.id);
      } else items.push(doc.id);
    };
    add(documents.get(index));
    visit(trees.get(index) ?? { type: 'root', children: [] }, 'link', node => {
      if (/^[a-z]+:/i.test(node.url) || node.url.startsWith('#')) return;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(index), decodeURIComponent(node.url.split(/[?#]/)[0])));
      if (directory && target.startsWith(directory + '/')) add(documents.get(target), plainText(node));
    });
    if (directory) for (const doc of documents.values()) {
      if (doc.source.startsWith(directory + '/')) add(doc);
    }
    return items;
  }
  const groups = [];
  for (const section of config.navigation) {
    const items = itemsFor(section.index, section.directory);
    if (items.length) groups.push({ type: 'category', label: section.label, collapsed: false, items });
  }
  const rest = [...documents.values()].filter(doc => !used.has(doc.source)).map(doc => doc.id);
  return [...groups, ...rest];
}
