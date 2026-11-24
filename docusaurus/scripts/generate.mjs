import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { visit } from 'unist-util-visit';
import { getConfig } from './config.mjs';
import { cleanGenerated, files, inside } from './paths.mjs';
import { documentInfo, hash, markdown, navigation, plainText, transform } from './core.mjs';
import { prepareStudio } from './studio-build.mjs';

export async function main() {
  const config = getConfig();
  const feature = fileURLToPath(new URL('../', import.meta.url));
  const root = path.resolve(feature, config.sourceRoot);
  const docFiles = [...new Set((await Promise.all(config.paths.documents.map(item => files(root, item)))).flat())]
    .filter(item => /\.md$/i.test(item)).sort();
  const artifactFiles = [...new Set([...docFiles, ...(await Promise.all(config.paths.artifacts.map(item => files(root, item)))).flat()])].sort();
  const inputs = [...new Set([...docFiles, ...artifactFiles])];
  for (const input of inputs) if (path.resolve(root, input).startsWith(feature)) throw Error('Sources cannot include the generator directory');
  const fingerprints = {};
  for (const input of inputs) fingerprints[input] = hash(await fs.readFile(await inside(root, input)));
  const output = await cleanGenerated(feature, config.paths.generated);
  const docsDirectory = path.join(output, 'docs');
  const staticDirectory = path.join(output, 'static');
  await fs.mkdir(docsDirectory);
  await fs.mkdir(staticDirectory);
  if (config.features.studio && config.studio.bundle.enabled) {
    const studio = await prepareStudio(config, feature);
    await fs.cp(studio, path.join(staticDirectory, config.studio.bundle.mount), { recursive: true });
  }
  for (const accent of [config.branding.accent, config.branding.lightAccent]) {
    if (!/^#[\da-f]{6}$/i.test(accent)) throw Error('Brand accents must be six-digit hex colors');
  }
  await fs.writeFile(path.join(output, 'brand.css'), `:root { --ifm-color-primary: ${config.branding.accent}; }\nhtml[data-theme='light'] { --ifm-color-primary: ${config.branding.lightAccent}; }\n`);
  const documents = new Map(docFiles.map(source => [source, documentInfo(source, config)]));
  if (new Set([...documents.values()].map(doc => doc.url)).size !== documents.size) throw Error('Document route collision; add routeOverrides in site.config.mjs');
  const trees = new Map();
  const search = [];
  const diagnostics = [];
  for (const [filename, doc] of documents) {
    const source = await fs.readFile(await inside(root, filename), 'utf8');
    trees.set(filename, markdown.parse(source));
    const { tree, content } = transform(source, { config, filename, documents, artifacts: new Set(artifactFiles), diagnostics });
    const titleNode = tree.children.find(node => node.type === 'heading');
    const filenameTitle = config.titleRules.some(rule => rule.useFilename && filename.startsWith(rule.directory + '/') && path.basename(filename).toLowerCase() !== 'readme.md');
    const title = !filenameTitle && titleNode ? plainText(titleNode) : path.basename(filename, '.md');
    const sidebarLabel = config.sidebarLabelSeparator ? title.split(config.sidebarLabelSeparator).at(-1) : title;
    const frontmatter = `---\nid: ${doc.id}\ntitle: ${JSON.stringify(title)}\nsidebar_label: ${JSON.stringify(sidebarLabel)}\nslug: ${JSON.stringify(doc.slug)}\n---\n\n`;
    await fs.writeFile(path.join(docsDirectory, doc.id + '.md'), frontmatter + content);
    const paragraphs = [];
    visit(tree, 'paragraph', node => paragraphs.push(plainText(node)));
    search.push({ title, url: doc.url, text: paragraphs.join(' ') });
  }
  for (const filename of artifactFiles) {
    const destination = path.join(staticDirectory, config.paths.rawMount, filename);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.copyFile(await inside(root, filename), destination);
  }
  await fs.writeFile(path.join(staticDirectory, config.search.indexFilename), JSON.stringify(search));
  await fs.writeFile(path.join(staticDirectory, '.nojekyll'), '');
  await fs.writeFile(path.join(staticDirectory, config.paths.deploymentManifest), JSON.stringify({ url: config.url, baseUrl: config.baseUrl }, null, 2));
  await fs.writeFile(path.join(output, 'site-config.json'), JSON.stringify(config, null, 2));
  await fs.writeFile(path.join(output, 'sidebars.json'), JSON.stringify({ docs: navigation(config, documents, trees) }, null, 2));
  await fs.writeFile(path.join(output, 'routes.json'), JSON.stringify(Object.fromEntries(documents), null, 2));
  await fs.writeFile(path.join(output, 'sources.json'), JSON.stringify(fingerprints, null, 2));
  await fs.writeFile(path.join(output, 'diagnostics.json'), JSON.stringify(diagnostics, null, 2));
  // Both build-time reads and copies must leave all canonical bytes intact.
  for (const input of inputs) if (fingerprints[input] !== hash(await fs.readFile(await inside(root, input)))) throw Error(`Canonical source changed during generation: ${input}`);
  console.log(`Generated ${documents.size} pages and copied ${artifactFiles.length} original artifacts. Source hashes verified.`);
  if (diagnostics.length) console.log(`${diagnostics.length} existing source-link diagnostics: .generated/diagnostics.json`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
