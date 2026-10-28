# Experimental documentation generator

Read this file before changing anything in this feature. These feature-local
invariants remain authoritative across sessions, agents, refactoring and
maintenance. Changes require explicit maintainer approval. Repository-wide
instructions still apply; never modify a parent or root AGENTS.md for this feature.

## Primary mission and non-negotiable principles

Build a modern GameChanger Wallet / GCScript documentation presentation using
Docusaurus, GitHub Actions and static hosting. Canonical Markdown and associated
files remain the independent single source of truth. Docusaurus is replaceable.

1. Preservation: never edit canonical Markdown or existing artifacts to suit the
   renderer; preserve production functionality.
2. Automation: transform source documentation during builds, without migrations.
3. Extensibility: use configurable, extensible pattern-based transformations.
4. Portability: original Markdown stays readable and navigable without this tool.
5. Reusability: keep the generator self-contained and reusable in other repos.
6. Centralization: keep branding, titles, logos, paths, features, navigation,
   transformation patterns and defaults in `site.config.mjs`.
7. Simplicity: minimize dependencies; prefer standard, maintainable technology.
8. Independence: open source, GitHub Pages compatible, zero subscription costs.
9. Isolation: development belongs on `feat/docusaurus`, away from production.
10. Persistence: retain this mission, preferences and architectural intent here;
    changes to these invariants require explicit maintainer approval.

## Architecture and priorities

- Inspect current sources and existing conventions first. Use the gcscript-dsl
  and web-app skills for their respective domains.
- Read sources only. Generate disposable copies, navigation, search data and
  assets inside the feature's generated directory; never write back to sources.
- Derive navigation from existing index links; configure optional menu order in
  this feature only. Do not require authors to migrate documentation.
- Keep transformation policy separate from generic processing. Support optional
  comment markers to omit fragments or explicitly identify code examples.
- Preserve links, images, HTML examples and downloadable artifacts. Sanitize
  rendered rich content; never execute canonical HTML in the documentation shell.
- Enhance recognized JSON/JSONC GCScript examples with Studio code view by
  default in every generated Markdown file, independent of directory, page type
  or fence language label. Match valid JSON/JSONC root objects with an own string
  `type` of any value, including `js`/`javascript` or unlabelled blocks. This broad
  heuristic intentionally accepts false positives; retain explicit skip markers.
  Nested types, arrays, malformed JSONC and non-string types do not qualify.
  Replace the native code block after hydration. Render the editor
  flush, with no external toolbar/buttons or wrapper margin/padding. Keep native
  code in static HTML for no-JS access and as the editor error fallback.
  Estimate code-view height from line count, wrapping width and Studio chrome;
  keep sizing policy configurable, without a cross-origin executable bridge.
- Add Open in IDE beside wallet UDC run links, preserving the encoded payload.
  Never run wallet intents automatically or handle wallet secrets/returns here.
- Centralize persistent, versioned reader preferences: editor view and theme
  policy in a keyboard-accessible, viewport-centered options modal.
- Verify Studio integration against its source/reference example. Do not invent
  supported query parameters. Document required upstream compatibility patches.
- Bundle the pinned Studio distribution for same-site embeds and wallet callbacks.
  Cross-site iframe storage is partitioned and browsers can sever popup openers;
  iframe sandbox flags cannot restore that storage. Keep wallet return handling
  entirely in Studio. Preserve the native Run/return flow and test popup close,
  captured exports, project identity and cleared pending records using synthetic
  data in a normal browser. Playwright disables storage partitioning by default;
  tests for this boundary must use Chrome without those feature overrides.
  Keep the static-entry adapter confined to the disposable Studio checkout. Its
  query URL must work without SPA rewrites, at root and nested hosting mounts.
- Provide modern responsive navigation, local search, light/dark themes and
  restrained GameChanger branding. Use Docusaurus primitives rather than adding
  a second CSS framework.
- Make canonical/source preservation, safe paths, navigation/link mapping,
  transformation behavior and CI deployment restrictions executable checks.
- Document configuration, reuse, build, preview, extension and maintenance.

## Deployment portability and production safety

- Produce a standard self-contained static `build/` directory. It must work on
  GitHub Pages, Netlify, Vercel and Apache, without server-side app code or external
  runtime services. Interactive hosted Studio is optional; original code and
  local search must remain usable without it.
- Support localhost development/preview and configurable public URL/base path.
  Use directory index routes with trailing slashes for portable deep links.
- Resolve the hosting mount from `baseUrl` in the primary configuration, with
  explicit `--base-url` and `--url` overrides on package scripts. Keep deployment
  behavior generic: do not detect providers, infer mounts or add host-specific
  presets. Do not claim one compiled Docusaurus artifact can infer an arbitrary
  future mount after upload.
  Record resolved settings with generated sources and the build artifact; preview
  and browser tests must use the artifact's settings, independently of the shell.
  Verify root and nested builds, local asset/link targets, direct deep links,
  search, original downloads and Studio wallet callbacks before declaring hosting
  portability. Build output belongs at the configured URL path on the host.
- Preview must serve original `.html`, `.gcscript` and extensionless files
  literally. Docusaurus's clean-URL/short-extension heuristics break these files
  at project mounts; retain the tested standard-library static preview server.
- Pushes to `feat/docusaurus`, pull requests and manual runs may build, validate
  and upload deployable artifacts, but MUST NOT publish production Pages.
- Never change the existing production publishing workflow, publishing source,
  DNS or Pages settings or activate a replacement without maintainer approval.
- Keep the active experimental workflow read-only with no Pages/OIDC write
  permissions and no deploy job. Keep future Pages deployment as an inactive
  template under `deployment/` until explicitly approved.
- Any future activated Pages workflow MUST enforce source branch `main`
  in job conditions AND restrict Pages/OIDC write permissions to that
  guarded deployment job. Manual runs from every other branch must be unable to
  deploy. Require a protected Pages environment restricted to main.
- External preview hosts are optional, explicitly configured integrations;
  do not add credentials, subscriptions or publish without authorization.

## Maintenance

Run `pnpm test` before `pnpm build`, then `pnpm test:browser` for Studio/return
changes (install its browser or set `DOCS_BROWSER_EXECUTABLE`). Inspect desktop/mobile rendering after UI
changes. Verify source hashes and generated artifact hashes during builds. Add
regressions for shared transform and path behavior. Never weaken link/security
checks to get a build through. Keep dependency versions and the lockfile pinned.
Generated files are disposable; edit generators/templates, not generated output.
