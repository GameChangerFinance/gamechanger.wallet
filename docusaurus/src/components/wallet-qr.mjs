import gc from '@gamechanger-finance/gc/dist/browser.js';

/** Use GC's QR transport with the original URL pattern and no router/callback edits. */
export async function walletQR(href, settings) {
  const url = new URL(href);
  const payload = url.pathname.split('/').at(-1);
  const code = await gc.encodings.msg.decoder(payload);
  const start = href.indexOf('/api/2/run/') + '/api/2/run/'.length;
  const urlPattern = href.slice(0, start) + '{gcscript}' + href.slice(start + payload.length);
  return gc.encode.qr({ ...settings, input: JSON.stringify(code), urlPattern, disableNetworkRouter: true });
}
