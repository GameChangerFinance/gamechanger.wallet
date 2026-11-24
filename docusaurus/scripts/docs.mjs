import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { parseArgs, parseEnv } from 'node:util';
import { getConfig } from './config.mjs';

/** Apply hosting overrides once to generation, Docusaurus, Studio and verification. */
export async function main(args = process.argv.slice(2)) {
  const [command, ...options] = args;
  const usage = 'Usage: pnpm <build|generate|start> [--base-url /|/subdirectory/] [--url https://host] [--port 3000 (start)]';
  if (!['build', 'generate', 'start'].includes(command)) throw Error(usage);
  const { values } = parseArgs({ args: options, options: {
    'base-url': { type: 'string' }, url: { type: 'string' }, port: { type: 'string' }, help: { type: 'boolean' },
  } });
  if (values.help) { console.log(usage); return; }
  if (values['base-url'] === '' || values.url === '') throw Error('Hosting overrides cannot be empty. ' + usage);
  if (values.port && command !== 'start') throw Error('--port is only available for start. ' + usage);
  const feature = fileURLToPath(new URL('../', import.meta.url));
  let localEnv = {};
  try { localEnv = parseEnv(fs.readFileSync(path.join(feature, '.env'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const analyticsVariable = getConfig({}).analytics.environmentVariable;
  const env = { ...process.env,
    [analyticsVariable]: process.env[analyticsVariable] ?? localEnv[analyticsVariable] ?? '',
    ...(values['base-url'] ? { DOCS_BASE_URL: values['base-url'] } : {}),
    ...(values.url ? { DOCS_URL: values.url } : {}),
  };
  const config = getConfig(env);
  Object.assign(env, { DOCS_BASE_URL: config.baseUrl, DOCS_URL: config.url });
  const run = scriptArgs => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, scriptArgs, { cwd: feature, env, stdio: 'inherit' });
    const interrupt = signal => child.kill(signal);
    const onInterrupt = () => interrupt('SIGINT');
    const onTerminate = () => interrupt('SIGTERM');
    process.once('SIGINT', onInterrupt);
    process.once('SIGTERM', onTerminate);
    child.once('exit', () => { process.removeListener('SIGINT', onInterrupt); process.removeListener('SIGTERM', onTerminate); });
    child.once('error', reject);
    child.once('exit', (code, signal) => code === 0 ? resolve() : reject(Error(signal ? `Documentation ${command} interrupted (${signal})` : `Documentation ${command} failed (exit ${code})`)));
  });
  console.log(`Documentation target: ${config.url}${config.baseUrl}`);
  await run(['scripts/generate.mjs']);
  if (command === 'generate') return;
  const docusaurus = 'node_modules/@docusaurus/core/bin/docusaurus.mjs';
  await run([docusaurus, command, ...(command === 'start' ? ['--host', '127.0.0.1', ...(values.port ? ['--port', values.port] : [])] : [])]);
  if (command === 'build') await run(['scripts/verify.mjs']);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
