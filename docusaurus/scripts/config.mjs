import config from '../site.config.mjs';
import fs from 'node:fs';

export function getConfig(env = process.env) {
  const result = structuredClone(config);
  result.analytics.measurementId = env[result.analytics.environmentVariable]?.trim() || null;
  if (result.analytics.measurementId && !/^G-[A-Z0-9]+$/.test(result.analytics.measurementId)) {
    throw Error('GOOGLE_ANALYTICS_ID must be a GA4 measurement ID (G-XXXXXXXXXX), or empty to disable analytics');
  }
  result.url = env.DOCS_URL || result.url;
  result.baseUrl = env.DOCS_BASE_URL || result.baseUrl;
  if (!/^\/(?:[^?#\\]*\/)?$/.test(result.baseUrl) || result.baseUrl.includes('..') || result.baseUrl.includes('//')) {
    throw Error('DOCS_BASE_URL must be an absolute path with a trailing slash');
  }
  const url = new URL(result.url);
  if (!['https:', 'http:'].includes(url.protocol) || url.origin !== result.url) throw Error('DOCS_URL must be an HTTP(S) origin without a trailing slash');
  if (!/^[\w-]+$/.test(result.paths.rawMount)) throw Error('rawMount must be a single safe path segment');
  if (!/^[\w.-]+\.json$/.test(result.paths.deploymentManifest)) throw Error('deploymentManifest must be a JSON filename');
  const studio = new URL(result.studio.editUrl);
  if (studio.protocol !== 'https:' || !studio.pathname.endsWith('/')) throw Error('Studio must use an HTTPS edit endpoint ending in /');
  const bundle = result.studio.bundle;
  if (!/^[\w-]+$/.test(bundle.mount) || !/^[\w-]+$/.test(bundle.queryParameter) ||
      !/^[a-f\d]{40}$/.test(bundle.revision) ||
      !/^https:\/\/github\.com\/[\w-]+\/[\w.-]+\.git$/.test(bundle.repository)) {
    throw Error('Studio bundle requires a safe mount/query name, pinned Git SHA and HTTPS GitHub repository');
  }
  return result;
}

/** Preview and browser checks must use the artifact's mount, regardless of current shell settings. */
export function getBuildConfig() {
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(new URL('../build/' + config.paths.deploymentManifest, import.meta.url), 'utf8')); }
  catch { throw Error('Build deployment manifest is missing or invalid. Run pnpm build first.'); }
  if (typeof manifest.baseUrl !== 'string' || typeof manifest.url !== 'string') throw Error('Invalid build deployment manifest. Run pnpm build again.');
  return getConfig({ ...process.env, DOCS_BASE_URL: manifest.baseUrl, DOCS_URL: manifest.url });
}
