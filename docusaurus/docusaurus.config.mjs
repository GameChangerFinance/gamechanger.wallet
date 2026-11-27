import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { analyticsTags } from './scripts/analytics.mjs';
import sanitizeMarkdown from './scripts/sanitize.mjs';
import { getConfig } from './scripts/config.mjs';
import studioLegacyURL from './src/components/studioLegacyURL.mjs';

const feature = path.dirname(fileURLToPath(import.meta.url));
const generated = path.join(feature, getConfig().paths.generated);
const config = JSON.parse(fs.readFileSync(path.join(generated, 'site-config.json'), 'utf8'));
const routes = JSON.parse(fs.readFileSync(path.join(generated, 'routes.json'), 'utf8'));
const raw = config.baseUrl + config.paths.rawMount + '/';

export default {
  favicon: config.branding.favicon,
  headTags: [
    { tagName: 'script', attributes: {}, innerHTML: `(() => { const target = (${studioLegacyURL.toString()})(window.location.href, ${JSON.stringify({ features: config.features, baseUrl: config.baseUrl, studio: config.studio }).replaceAll('<', '\\u003c')}); if (target) window.location.replace(target); })();` },
    ...analyticsTags(config.analytics),
    { tagName: 'link', attributes: { rel: 'icon', type: 'image/svg+xml', href: config.baseUrl + config.branding.faviconSvg } }],
  title: config.title,
  tagline: config.tagline,
  url: config.url,
  baseUrl: config.baseUrl,
  trailingSlash: true,
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: { format: 'detect', hooks: { onBrokenMarkdownLinks: 'throw' } },
  staticDirectories: [config.paths.generated + '/static', config.paths.static],
  customFields: { reader: config },
  plugins: [['@docusaurus/plugin-content-docs', {
      path: config.paths.generated + '/docs',
      routeBasePath: '/',
      sidebarPath: './' + config.paths.generated + '/sidebars.json',
      editUrl: ({ docId }) => {
        const route = Object.values(routes).find(doc => doc.id === docId);
        return `${config.repository}/blob/${config.sourceBranch}/${route?.source ?? ''}`;
      },
      rehypePlugins: [sanitizeMarkdown],
  }]],
  themes: [['@docusaurus/theme-classic', {
    customCss: ['./' + config.paths.generated + '/brand.css', './src/css/custom.css'],
  }]],
  themeConfig: {
    image: raw + config.branding.socialImage,
    colorMode: { defaultMode: config.branding.defaultTheme, respectPrefersColorScheme: false },
    navbar: {
      title: config.title,
      logo: { alt: config.branding.logoAlt, src: raw + config.branding.logo },
      items: [
        ...config.navbar.map(item => ({ label: item.label, position: 'left',
          ...(item.source ? { to: routes[item.source].url } : { href: item.href }) })),
        { type: 'custom-reader', position: 'right' },
        { label: 'GitHub', href: config.repository, position: 'right' },
      ],
    },
    footer: { style: 'dark', copyright: `${config.title} · Open documentation. Open possibilities.` },
    prism: { additionalLanguages: ['json', 'bash'] },
  },
};
