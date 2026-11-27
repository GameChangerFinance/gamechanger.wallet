import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { pipeline } from 'node:stream/promises';
import { getBuildConfig } from './config.mjs';
import { inside } from './paths.mjs';

/** Resolve actual static files without clean-URL rewrites or extension guesses. */
export async function resolveRequest(root, baseUrl, requestURL) {
  if (!requestURL.startsWith('/')) return { status: 400 };
  const url = new URL(requestURL, 'http://preview.invalid');
  let pathname;
  try { pathname = decodeURIComponent(requestURL.split(/[?#]/)[0]); }
  catch { return { status: 400 }; }
  if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').includes('..')) return { status: 400 };
  const mount = decodeURIComponent(baseUrl);
  if (mount !== '/' && pathname === mount.slice(0, -1)) return { status: 308, location: baseUrl + url.search };
  if (!pathname.startsWith(mount)) return { status: 404 };
  const relative = pathname.slice(mount.length);
  let filename = await inside(root, relative || 'index.html');
  let stat = await fs.stat(filename);
  if (stat.isDirectory()) {
    if (!pathname.endsWith('/')) return { status: 308, location: url.pathname + '/' + url.search };
    filename = await inside(root, relative + 'index.html');
    stat = await fs.stat(filename);
  }
  return stat.isFile() ? { status: 200, filename, size: stat.size } : { status: 404 };
}

/** Share literal static serving between the preview CLI and browser regressions. */
export function createPreviewServer(root, config) {
  return http.createServer(async (req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
    }
    try {
      const result = await resolveRequest(root, config.baseUrl, req.url);
      if (result.status !== 200) {
        res.writeHead(result.status, result.location ? { Location: result.location } : {}); res.end(); return;
      }
      res.writeHead(200, {
        'Content-Type': config.preview.mimeTypes[path.extname(result.filename)] ?? 'application/octet-stream',
        'Content-Length': result.size,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      if (req.method === 'HEAD') res.end();
      else await pipeline(createReadStream(result.filename), res);
    } catch (error) {
      if (res.headersSent) res.destroy();
      else if (error.code === 'ENOENT') {
        // Mirror static hosts that serve the site's custom 404 document at the requested URL.
        try {
          const fallback = await fs.readFile(await inside(root, '404.html'));
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
          res.end(req.method === 'HEAD' ? undefined : fallback);
        } catch { res.writeHead(404); res.end(); }
      } else { res.writeHead(400); res.end(); }
    }
  });
}

export async function main(args = process.argv.slice(2)) {
  const { values } = parseArgs({ args, options: { port: { type: 'string' }, host: { type: 'string' }, help: { type: 'boolean' } } });
  const usage = 'Usage: pnpm serve [--port 4178] [--host 127.0.0.1]';
  if (values.help) { console.log(usage); return; }
  const config = getBuildConfig();
  const port = Number(values.port ?? config.preview.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error(`Port must be between 1 and 65535. ${usage}`);
  const host = values.host ?? config.preview.host;
  const feature = fileURLToPath(new URL('../', import.meta.url));
  const root = await inside(feature, 'build');
  try { await fs.access(path.join(root, 'index.html')); }
  catch { throw Error('Build output is missing. Run pnpm build first.'); }
  const server = createPreviewServer(root, config);
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, resolve); });
  process.once('SIGINT', () => server.close());
  console.log(`Static documentation preview: http://${host}:${port}${config.baseUrl}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.code === 'EADDRINUSE' ? 'Preview port is in use. Choose another --port.' : error.message); process.exitCode = 1; });
}
