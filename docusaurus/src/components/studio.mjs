/** Pure URL adapter. Wallet launch URLs are recognized without rewriting their query strings. */
export function walletPayload(href, config) {
  try {
    const url = new URL(href);
    if (!config.studio.walletOrigins.includes(url.origin)) return null;
    return new RegExp(config.studio.runPathPattern).exec(url.pathname)?.[1] ?? null;
  } catch { return null; }
}

export function studioURL(encoded, config, preferences, colorMode, embedded = false) {
  if (!/^[\w-]+$/.test(encoded) || encoded.length > config.studio.maxEncodedLength) return null;
  const bundled = embedded && config.studio.bundle?.enabled;
  const url = bundled
    ? new URL(`${config.baseUrl}${config.studio.bundle.mount}/index.html`, config.url)
    : new URL(encoded, config.studio.editUrl);
  if (bundled) url.searchParams.set(config.studio.bundle.queryParameter, encoded);
  url.searchParams.set('view', config.studio.views.includes(preferences.view) ? preferences.view : config.studio.defaultView);
  if (embedded) url.searchParams.set('embed', 'true');
  if (config.studio.themeParameter) url.searchParams.set(config.studio.themeParameter,
    preferences.theme === 'match' ? colorMode : preferences.theme);
  return bundled ? url.pathname + url.search : url.href;
}

/** Preserve the wallet query bytes and fragment on the corresponding Studio link. */
export function walletIDEURL(href, config, preferences, colorMode) {
  const payload = walletPayload(href, config);
  const editor = payload && studioURL(payload, config, preferences, colorMode);
  if (!editor) return null;
  const original = new URL(href);
  return editor + (original.search ? (editor.includes('?') ? '&' : '?') + original.search.slice(1) : '') + original.hash;
}

export function readPreferences(serialized, config) {
  try {
    const value = JSON.parse(serialized);
    if (value?.version === config.preferences.version && config.studio.views.includes(value.view) && config.studio.themes.includes(value.theme)) {
      return { version: config.preferences.version, view: value.view, theme: value.theme, embedMode: config.studio.embedModes.includes(value.embedMode) ? value.embedMode : config.studio.defaultEmbedMode, walletMode: config.wallet.modes.includes(value.walletMode) ? value.walletMode : config.wallet.defaultMode };
    }
  } catch { /* Unavailable, stale or malformed storage falls back to current defaults. */ }
  return { version: config.preferences.version, view: config.studio.defaultView, theme: config.studio.defaultTheme, embedMode: config.studio.defaultEmbedMode, walletMode: config.wallet.defaultMode };
}

/** Estimate wrapped code height without reading a cross-origin editor DOM.
 * The sizing policy follows Studio's Monaco line height and editor chrome. */
export function studioFrameHeight(source, view, width, config) {
  if (view !== 'code') return config.studio.frameHeight;
  const sizing = config.studio.codeSizing;
  const columns = width > sizing.horizontalInset
    ? Math.max(1, Math.floor((width - sizing.horizontalInset) / sizing.characterWidth))
    : Infinity;
  const lines = source.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n');
  const wrappedLines = lines.reduce((total, line) => total + Math.max(1,
    Math.ceil(line.replace(/\t/g, ' '.repeat(sizing.tabSize)).length / columns)), 0);
  return Math.min(sizing.maxHeight, Math.max(sizing.minHeight,
    sizing.chromeHeight + (wrappedLines + sizing.extraLines) * sizing.lineHeight));
}

/** Shorten display text only; callers retain the complete URL as the link target. */
export function truncateURL(value, limit) {
  if (value.length <= limit) return value;
  const available = Math.max(2, limit - 2);
  return value.slice(0, Math.ceil(available / 2)) + '..' + value.slice(-Math.floor(available / 2));
}
