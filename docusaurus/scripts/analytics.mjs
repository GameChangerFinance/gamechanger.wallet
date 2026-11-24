/** Google's standard GA4 tag; only the validated public measurement ID is embedded. */
export function analyticsTags({ measurementId }) {
  if (!measurementId) return [];
  if (!/^G-[A-Z0-9]+$/.test(measurementId)) throw Error('Invalid GA4 measurement ID');
  return [
    { tagName: 'script', attributes: { async: true, src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}` } },
    { tagName: 'script', attributes: {}, innerHTML: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');` },
  ];
}
