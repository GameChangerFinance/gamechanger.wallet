import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { visit } from 'unist-util-visit';
import { getConfig } from './config.mjs';
import { walletPayload } from '../src/components/studio.mjs';

/** CommonMark cannot supply MDX ESM: these nodes are compiler-generated TOC
 * exports/imports. Sanitize rendered HTML without discarding that metadata. */
export default function sanitizeMarkdown() {
  const sanitize = rehypeSanitize({
    ...defaultSchema,
    tagNames: [...defaultSchema.tagNames, 'header', 'details', 'summary'],
    attributes: { ...defaultSchema.attributes,
      code: [...(defaultSchema.attributes.code ?? []), 'metastring'],
    },
  });
  const config = getConfig();
  return tree => {
    visit(tree, 'element', node => {
      if (node.tagName === 'a' && walletPayload(node.properties.href, config)) {
        const children = node.children.filter(child => child.type !== 'text' || child.value.trim());
        if (children.length === 1 && children[0].tagName === 'img' && new RegExp(config.transforms.runButtonImagePattern).test(children[0].properties.src)) node.children = [{ type: 'text', value: config.labels.runWallet }];
      }
    });
    // Docusaurus wraps the first Markdown h1 in an attribute-free MDX header,
    // even in CommonMark mode. Convert that generated wrapper back to inert
    // HTML so the sanitizer retains the document's visible title.
    visit(tree, 'mdxJsxFlowElement', node => {
      if (node.name !== 'header' || node.attributes.length !== 0) return;
      node.type = 'element';
      node.tagName = 'header';
      node.properties = {};
      delete node.name;
      delete node.attributes;
    });
    const metadata = tree.children.filter(node => node.type === 'mdxjsEsm');
    const headingIDs = new Set();
    visit(tree, 'element', node => {
      if (/^h[1-6]$/.test(node.tagName) && node.properties.id) headingIDs.add(node.properties.id);
    });
    const result = sanitize({ ...tree, children: tree.children.filter(node => node.type !== 'mdxjsEsm') });
    // Hash navigation must keep Docusaurus's generated heading IDs. All other
    // clobberable IDs/names retain the sanitizer's user-content prefix.
    visit(result, 'element', node => {
      const id = node.properties.id;
      if (/^h[1-6]$/.test(node.tagName) && typeof id === 'string' && headingIDs.has(id.slice('user-content-'.length))) {
        node.properties.id = id.slice('user-content-'.length);
      }
    });
    return { ...result, children: [...result.children, ...metadata] };
  };
}
