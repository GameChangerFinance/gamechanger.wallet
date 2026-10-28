# Experimental GameChanger documentation

Read [AGENTS.md](AGENTS.md) before changing this feature. Its mission and invariants
require explicit maintainer approval to change. Development branch: `feat/docusaurus`.

This directory is an optional, replaceable presentation layer. The repository's
existing Markdown, images, dapp HTML, GCScript files and archived API documentation
remain authoritative and independently usable. No canonical file is migrated or
rewritten. Removing this directory and the experimental workflow removes the feature.

## Build and preview

Requirements: Node 24.12 or newer, Git, Corepack and the pnpm version in `package.json`.
Commands below run **inside `docusaurus/`**:

```sh
corepack enable
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
pnpm build
pnpm serve --port 4178
# http://localhost:4178/gamechanger.wallet/
```

`pnpm start` generates the sources and opens the Docusaurus development server.
After editing canonical files, run `pnpm generate` to refresh the generated copies;
Docusaurus watches those copies. `pnpm build` always regenerates everything.

The generated `build/` directory is the complete deployment artifact. It includes
directory-index HTML routes, JS/CSS, local search data, `.nojekyll`, and byte-for-byte
original files under `original/`. Source hashes and route checks run on every build.
Studio's static assets are bundled under `studio/`; native code remains readable
without JavaScript. The first generation fetches the pinned Studio revision,
installs its frozen dependencies with lifecycle scripts disabled, runs its entry
adapter tests and builds it. Later generations reuse `.studio/` at the same base
path. Network access is needed for that first preparation and dependency installs.
Keep `.studio/` local; publish only `build/`. Studio's package manager version is
defined by its own `package.json`, independently of this generator's version.

`pnpm serve` uses a small Node standard-library static preview server. Docusaurus's
preview rewrites `.html` URLs and appends slashes to long extensions such as
`.gcscript` under project mounts; that breaks original artifacts. This preview
serves actual files and directory indexes, preserves query strings, rejects
traversal/symlinks, disables directory listings, and binds to loopback by default.
It is a development tool; the deployed output does not need Node or this server.

## Primary configuration

Edit **[site.config.mjs](site.config.mjs)** for branding, titles, logos, source paths,
public URL/base path, route overrides, navigation groups, features, transformation
patterns, search settings, Studio endpoints and reader defaults. No secrets belong
in this file: its reader settings are public browser configuration.

Set the default deployment path and origin in `site.config.mjs`:

```js
baseUrl: '/gamechanger.wallet/',
url: 'https://gamechangerfinance.github.io',
```

Use package script arguments to override these values for a deployment:

```sh
# Build with the configured defaults:
pnpm build
# Serve at the domain root:
pnpm build --base-url / --url https://docs.example.org
# A site served under a subdirectory:
pnpm build --base-url /review/ --url https://preview.example.org
# Generate sources with the same settings:
pnpm generate --base-url /review/ --url https://preview.example.org
# Development server:
pnpm start --base-url / --port 3000
```

`--base-url` starts and ends in `/`; `--url` is an HTTP(S) origin without a trailing
slash. CLI flags override `DOCS_BASE_URL`/`DOCS_URL` environment variables, which
remain supported. The resolved settings apply to Markdown transformation,
Docusaurus routes/assets, search, original files, bundled Studio and verification.
`pnpm serve` and browser tests read the artifact's `documentation-build.json`, so
they use the mount selected by the last build.

There is no hosting-provider detection. Defaults come from configuration;
precedence is CLI arguments, then `DOCS_BASE_URL`/`DOCS_URL`, then configuration.
Use the same commands for Netlify, Vercel, Apache or any static host. Run them
inside `docusaurus/` and publish `build/` at the selected path.

For a root deployment, upload the **contents** of `build/` to the domain root.
For `--base-url /review/`, place those contents at the host's `/review/` path;
the flag changes URLs, not the output directory layout. Do not upload a
subdirectory build at the root and expect the host to add the missing directory.
Rebuild when the mount changes. No SPA catch-all rewrite is required.
Routes emit `route/index.html`, so direct deep links work without SPA rewrites.
Do not redirect every URL to the root HTML; real example files must stay files.

## Pipeline and navigation

1. `scripts/generate.mjs` reads only configured sources, records SHA-256 hashes and
   rejects symlinks/traversal and input paths inside the generator.
2. `scripts/core.mjs` parses CommonMark/GFM into an AST. Generated copies receive
   stable IDs, portable slugs and titles. The only curated collision override is
   `RELEASE.md` → `/release-notes`; no source rename is required.
3. Configured comment markers and text rules transform generated ASTs. Links and
   images resolve to generated pages or original static artifacts. Queries,
   fragments, UTF-8 filenames and relative source relationships are preserved.
4. Each configured section's canonical index links establish navigation order;
   unlisted documents append deterministically. No hand-maintained menu manifest
   is needed. Change groups/order in the primary configuration when desired.
5. JSON/JSONC blocks whose root `type` matches configured script types receive a
   lossless `gcscript-studio-file` envelope, encoded with the native Node gzip and
   base64url GC transport. Original code is never replaced or executed.
6. Docusaurus's CommonMark renderer sanitizes HTML. Scripts, event handlers,
   arbitrary iframes and unsafe links cannot execute in the docs shell. Compiler
   TOC metadata and generated heading anchors survive sanitization.
7. `scripts/verify.mjs` checks source hashes again, byte-identical original output,
   every generated route and every rendered original-artifact link/image. The
   Docusaurus build also fails on broken internal links and anchors.

Missing canonical local targets are reported in `.generated/diagnostics.json` and
linked to their source-repository location. They are never silently invented.
Review diagnostics when adding/changing source roots. `.generated/sources.json`,
`routes.json` and `sidebars.json` make generation auditable; none is maintained by hand.

Configured paths are repository-relative. `sourceRoot` locates that repository
relative to this feature directory. `.generated/` is an exact cleanup allowlist;
existing output requires the ownership marker and a symlink-free tree. A failed
generation is safe to rerun. Build outputs/cache are ignored and disposable.

## Transform extensions and optional markers

Markers are standalone comments outside code fences. They affect generated copies
only, remain ordinary comments in Markdown viewers, and are never required for
the current source tree:

````md
<!-- docs:omit:start -->
This fragment is omitted from the rendered site only.
<!-- docs:omit:end -->

<!-- docs:studio -->
```json
{"type":"data","value":"A fragment explicitly opened in Studio"}
```

<!-- docs:no-studio -->
```json
{"type":"script","run":{}}
```
````

Omit markers must be paired and cannot nest. `docs:studio` and `docs:no-studio`
apply to the next code block. Marker names are configurable. In every generated
Markdown page, valid JSON/JSONC content with a root object containing a string `type` is detected
automatically regardless of the fence label, including `js`, `javascript` and
unlabelled blocks. This broad heuristic can include non-GCScript objects; use
`docs:no-studio` to exclude a block. Ordinary JavaScript and JSON without a root
string `type` stay as native code. `transforms.scriptTypes: ['*']` accepts any
string type; an explicit list restricts matching to those values.
`transforms.codeLanguages: ['*']` enables this content-based detection; set an
explicit language list only when you want to restrict it.

`transforms.textPatterns` accepts ordered `{pattern, flags, replacement}` rules.
Rules affect text nodes only, never code, URL payloads or raw HTML. For structural
rules, extend `transform()` with another AST stage and add a fixture test. Keep
repository policy in configuration and processing generic; do not add filename
special cases to the engine. New transformations must not mutate sources.

## Studio, UDC and reader preferences

Every enhanced example opens directly in Studio after hydration, replacing the
native Markdown code block. The editor sits flush without an external toolbar,
buttons or wrapper spacing. Static HTML and readers without JavaScript retain
the native block, which also serves as the editor error fallback. Code-view height is
estimated from source lines, wrapping width, Studio's 22px Monaco line height and
editor chrome; tune `studio.codeSizing` to adjust the estimate and safety cap.
Studio currently publishes no resize-message API, so edits made inside its iframe
cannot automatically adjust the parent height. Nodes/Blocks use `studio.frameHeight`.
Settings select Code, Nodes
or Blocks globally and persist in versioned localStorage. Changing the view (or
theme on compatible deployments) reloads open editors: copy edits first.
The parent never builds/signs/submits or receives wallet data.

Recognized wallet `/api/2/run/<payload>` links get an adjacent **Open in IDE…**.
Only explicitly allowlisted wallet origins/path patterns qualify. The encoded
payload is retained; router, referral and callback query parameters are not copied
into the Studio URL. Existing wallet links remain intact.

Studio contracts were checked against the [reference embed page](https://gamechangerfinance.github.io/gcscript-studio/examples/gcscript-studio-three-ides.html)
and [Studio source](https://github.com/GameChangerFinance/gcscript-studio) on
2026-10-28, revision `2b7896556f892f1f99a6ae5ce843bbe6d5e28fc3`.

### Wallet popup returns and same-site hosting

Embedded Studio uses a pinned build served from the documentation site itself.
This is essential on localhost and hosts on a different site from hosted Studio:
Chrome partitions the cross-site iframe's localStorage from its return popup,
and can also sever its opener. The popup then cannot find its pending run and
shows **Unrecognized or expired wallet run**, without capturing exports or closing.
The hosted reference works because its page and Studio share a site. Removing the
iframe sandbox or adding popup permissions does not join storage partitions.

`studio.bundle` configures the upstream repository, pinned revision, static mount
and source query parameter. `scripts/studio-build.mjs` prepares a disposable,
content-addressed checkout under `.studio/`. The small
[static-entry adapter](deployment/studio-static-entry.patch) adds source loading
at `studio/index.html?source=…`; it uses Studio's existing payload decoder and
validation. This avoids dynamic edit routes or platform-specific SPA rewrites.
The adapter is applied automatically only to the generated checkout. Canonical
documentation and the upstream repository/deployment stay unchanged.

Studio's native callback returns to the bundled `studio/index.html`, sharing its
run/result storage with the initiating iframe. The docs application never receives
or persists exports. External **Open in IDE…** links still open the hosted full IDE.
Setting `studio.bundle.enabled: false` restores remote embedding, with the above
cross-site limitation; only use it when the page and Studio share a site.

After `pnpm build`, run `pnpm test:browser --install-browser` to install Chromium
and exercise the complete synthetic return on an automatically started localhost
server. For an existing Chrome installation, use
`DOCS_BROWSER_EXECUTABLE=/usr/bin/google-chrome pnpm test:browser` instead.
`DOCS_PREVIEW_ORIGIN` optionally targets an already running preview. The test uses
Playwright from the pinned Studio checkout; screenshots go to `test-results/`.
It sends compressed synthetic exports, deliberately removes the popup opener,
and checks project identity, result persistence, pending cleanup, popup close and
desktop/mobile overflow. The experimental workflow runs this after every build.

When updating Studio, pin and review a new revision, verify the adapter still
applies, and run the build plus a browser regression with normal Chrome storage
settings. Playwright's default feature flags disable storage partitioning and
can hide this bug. Verify a synthetic wallet return reaches only its originating
project, clears the pending record and closes the popup. A synthetic return does
not verify wallet signing or transaction submission.

**Hosted Studio currently has no theme query/message contract.** Its theme remains
controlled by Studio; the docs theme selector works independently. Theme matching
is disabled honestly in the reader modal until a compatible Studio is deployed.
The reviewable [studio-theme.patch](deployment/studio-theme.patch) adds a validated,
configurable `theme=dark|light` launch option, applies it over restored preferences
and on reset, and includes parsing/controller regressions. It was typechecked and
tested in a temporary Studio checkout; no upstream branch or deployment was changed.

To enable synchronization after reviewing and releasing that change in Studio:

```sh
# From a sibling gcscript-studio checkout at the documented revision:
git apply --check ../gamechanger.wallet/docusaurus/deployment/studio-theme.patch
git apply ../gamechanger.wallet/docusaurus/deployment/studio-theme.patch
pnpm typecheck
pnpm test tests/integration/edit-links.test.ts tests/integration/controller.test.ts
```

Point `studio.editUrl` at the compatible deployment and set `themeParameter: 'theme'`.
These external-deployment instructions also require `studio.bundle.enabled: false`
and same-site hosting for wallet returns. The bundled revision retains Studio's
own theme; its static-entry adapter does not include the optional theme patch.
The modal then enables Match documentation / Dark / Light. Do not enable the flag
against the current unpatched hosted deployment or claim that theme matching works.

The iframe uses scripts/storage/popups so Studio can edit and capture its own wallet
returns. `allow-scripts` plus `allow-same-origin` is intentional for this explicitly
trusted bundled Studio application, **not an isolation boundary**. Treat bundled
Studio assets as trusted application code. A separate same-site origin can be
configured for isolation, but a cross-site origin needs a different return transport.
The docs parent has no executable message/DOM
bridge. Untrusted code examples remain inert strings; running requires user action.

## Hosting and production safety

The active `.github/workflows/documentation-experiment.yml` builds on pushes to
`feat/docusaurus`, pull requests and manual runs. It has only `contents: read`, no
deployment job, no Pages/OIDC write permissions, and uploads a standard static
artifact. Even a manual execution on another branch cannot publish Pages.

**Do not change the existing Pages publishing source or activate a replacement.**
The inactive [Pages template](deployment/github-pages.yml.example) is
outside `.github/workflows` and cannot execute. After explicit maintainer approval
of a production cutover, review/copy it into workflows, set `DOCS_PAGES_APPROVED=true`
as a repository variable, and protect the `github-pages` environment to allow only
`main` (with required reviewers if appropriate). Both jobs enforce this branch,
including manual runs. Only the guarded deploy job grants `pages: write`
and `id-token: write`. Do not relax these guards for previews.

For external previews, build with the required `--base-url` and optional `--url`,
then publish `build/` contents at that path. The host must serve directory indexes
(`DirectoryIndex index.html` on Apache). No application rewrites are required.

No platform needs runtime credentials, paid search or a server API. Original dapp
examples and the optional editor can themselves use their existing external tools.
Test destination URL/base path, deep links and original artifacts before publishing.
Real remote publishing and wallet execution are deliberately outside local checks.

The design follows Docusaurus's [CommonMark support](https://docusaurus.io/docs/markdown-features#mdx-vs-commonmark),
[static deployment guidance](https://docusaurus.io/docs/deployment) and GitHub's
[Pages workflow permission model](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Reuse and maintenance

Copy this directory to another Markdown repository, install its lockfile, and edit
the primary configuration: sources, assets, repository URL, navigation, logo,
titles, source-site mappings and public path. Studio/search/options are individually
optional. No root package manifest or canonical authoring convention is required.

Keep Docusaurus packages on the same pinned version. Inspect dependency updates
before installing; lifecycle scripts stay disabled. This docs-only install uses
the content-docs plugin and classic theme directly, avoiding unused preset plugins.
Scoped pnpm overrides fix upstream tinypool, serialize-javascript, js-yaml and
sockjs/uuid advisories that remain in the latest Docusaurus package constraints.
Remove an override only after the parent dependency fixes it and tests/build/dev
preview plus `pnpm audit --prod` pass. CI blocks high/critical production-tree
advisories (these dependencies run at build time, not as a deployed server).
After changes run tests/build,
check generated diagnostics and inspect desktop/mobile, both themes, options,
search, examples, original file links and direct subpath routes. Verify that
canonical files and existing deployment settings remain unchanged. Never work
around a renderer problem by rewriting the canonical docs or disabling validation.
