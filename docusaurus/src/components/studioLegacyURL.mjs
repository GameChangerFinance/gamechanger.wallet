/** Recover only bundled Studio edit routes; retain transport bytes and reader flags. */
export default function studioLegacyURL(href, config) {
  if (!config.features.studio || !config.studio.bundle.enabled) return null;
  const url = new URL(href);
  const mount = config.baseUrl + config.studio.bundle.mount + '/';
  const prefix = mount + config.studio.bundle.legacyEditRoute;
  if (!url.pathname.startsWith(prefix)) return null;
  const encoded = url.pathname.slice(prefix.length);
  if (!/^[\w-]+$/.test(encoded) || encoded.length > config.studio.maxEncodedLength) return null;
  const entry = new URL(mount + 'index.html', url.origin);
  entry.search = '?' + encodeURIComponent(config.studio.bundle.queryParameter) + '=' + encoded
    + (url.search ? '&' + url.search.slice(1) : '');
  entry.hash = url.hash;
  return entry.href;
}
