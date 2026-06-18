# Knowledgeworker HTML5 Asset Setup

> [!IMPORTANT]
> **MANDATORY PRE-CHECK FOR AGENTS**
> Before starting instantiation, you **MUST** check the latest release version of the API on GitHub:
>
> 1. Check the latest tag at `https://github.com/chemmedia/knowledgeworker-embedded-asset-api/tags` using `read_url_content` or a browser tool.
> 2. Compare the latest tag with the "Verified" version below.
> 3. If a newer version exists (e.g., `v5.0.0`), you **MUST** update this document and the `Verified` note before proceeding.
> 4. **Verified for API v4.x and UI v3.x** (Last check: 2026-02-08)

Lean playbook for the **manual setup path** (README "Option B"). It carries only the
decisions and rules that make a build correct; all code lives in copyable template
files, and all deep reference lives in the skill docs (see [Canonical sources](#canonical-sources)).

> [!NOTE]
> **One source of truth.** The numbered steps below mirror the automated workflow
> `.agent/workflows/kw-asset-setup-workflow.md`. Templates are **copied verbatim** from
> `.agent/skills/knowledgeworker_asset_setup/resources/` — never retyped or regenerated.
> Copying a file is deterministic; regenerating code is not.

## Stack

| Tool                                   | Purpose                                 |
| -------------------------------------- | --------------------------------------- |
| **pnpm**                               | Package manager (NOT npm or yarn)       |
| **Vite**                               | Build tool and dev server (NOT Webpack) |
| **Vanilla JS**                         | No framework by default                 |
| **knowledgeworker-embedded-asset-api** | LMS communication layer                 |

---

## Asset Type — decide first

> [!IMPORTANT]
> **MANDATORY CLARIFICATION — Ask before proceeding**
> Before writing any code, you **MUST** ask the user:
>
> *"What are you building — a **Medium**, a **Question**, a **Question with custom question text**, or an **Advanced Question**?"*
>
> **Default to `medium` if the user does not specify.**

| Type | `assetType` value | Copy this template → `src/main.js` |
| :--- | :--- | :--- |
| **Medium** | `'medium'` | `resources/main.medium.js` |
| **Question** | `'question'` | `resources/main.question.js` |
| **Question with custom question text** | `'question-with-custom-question-text'` | `resources/main.question.js` (identical) |
| **Advanced Question** | `'advanced-question'` | `resources/main.advanced-question.js` |

For full descriptions (EN/DE), who-renders-what diagrams, handler/action tables, and the
capability matrix, see **[KW_ASSET_TYPES.md](./KW_ASSET_TYPES.md)**.

---

## Hard rules

> [!CAUTION]
> **NO HARDCODED COLORS.** You MUST NOT use any hardcoded color (Hex, RGB, HSL, or named
> colors like `white`/`black`) and NO fallback values in CSS variables. Rely 100% on the
> `var(--kw-*)` design tokens injected by Knowledgeworker at runtime.
> **Only exception:** a specific brand-critical element the USER explicitly requests.

> [!IMPORTANT]
> **Relative base path.** `vite.config.js` MUST set `base: "./"`. KW assets are served from
> dynamic subdirectories, so the default absolute base (`/`) breaks asset loading.

> [!IMPORTANT]
> **Pin the API version.** Always install with `#<tag>` (e.g. `#v4.0.0`). A floating
> reference silently tracks `HEAD` (supply-chain risk). Commit `pnpm-lock.yaml` afterward.

> [!WARNING]
> **Never run `pnpm create vite . --overwrite`** in a non-empty directory — it deletes
> existing files, including this playbook.

---

## Setup checklist

Each step copies a file from `resources/` or runs a command. No code is reproduced here.

1. **`package.json`** — create directly (no Vite scaffold; every generated file is replaced anyway):
   ```json
   {
     "name": "my-kw-asset",
     "version": "0.0.0",
     "private": true,
     "type": "module",
     "scripts": {
       "dev": "vite",
       "build": "vite build && node build-zip.js",
       "preview": "vite preview"
     }
   }
   ```
2. **Install deps** — then commit `pnpm-lock.yaml`:
   ```bash
   pnpm add -D vite archiver
   pnpm add github:chemmedia/knowledgeworker-embedded-asset-api#v4.0.0
   ```
3. **Audit** — `pnpm audit` (CI: `pnpm audit --audit-level=high`).
4. **`index.html`** — copy `resources/index.html` (set `lang` to your asset's language).
5. **`src/style.css`** — copy `resources/style.css` (tokens only — see Hard rules).
6. **`src/main.js`** — copy the template for your asset type (see [table above](#asset-type--decide-first)). For local dev outside the LMS, use `resources/main-with-fallback.js`.
7. **`vite.config.js`** — copy `resources/vite.config.js` (`base: "./"` already set).
8. **`build-zip.js`** — copy `resources/build-zip.js` into the project root.
9. **`public/media/`** — create the empty folder for images/audio/video/fonts.
10. **`public/*.json`** — copy `resources/config.json`, `resources/labels.json`, and (optional) `resources/mapping.json` into `public/`.
11. **`.gitignore`** — `node_modules`, `dist`, `dist-ssr`, `*.local`, `asset.zip`.
12. **Verify** — `pnpm run dev` (serves on http://localhost:8080).
13. **Localization (optional)** — **ask the user:** *"Are you going to localize this asset into other languages?"* If **yes**, follow `.agent/skills/knowledgeworker_asset_setup/docs/lang-test.md` to add the `?lang=` param, per-language `labels.<locale>.json` files, and the side-by-side comparison page. If **no**, the single `labels.json` is enough.

Build for upload: `pnpm run build` → produces `dist/` and `asset.zip` (upload the zip to Knowledgeworker).

### Resulting project structure

```
./  (project root)
|-- public/
|   |-- media/          <-- place images, audio, video here
|   |-- config.json     <-- asset-specific settings
|   |-- labels.json     <-- translatable text strings
|   +-- mapping.json    <-- (optional) key-to-resource map
|-- src/
|   |-- main.js
|   +-- style.css
|-- .gitignore
|-- build-zip.js
|-- index.html
|-- package.json
|-- pnpm-lock.yaml
+-- vite.config.js
```

---

## Canonical sources

Don't duplicate these here — link to them. They are the single source of truth.

| Topic | Source |
| :--- | :--- |
| Asset types: descriptions, diagrams, handler/action tables, capability matrix | [KW_ASSET_TYPES.md](./KW_ASSET_TYPES.md) |
| Automated scaffold (same steps, agent-executed) | `.agent/workflows/kw-asset-setup-workflow.md` |
| Copyable templates (`index.html`, `style.css`, `main.*.js`, `vite.config.js`, `build-zip.js`, JSON) | `.agent/skills/knowledgeworker_asset_setup/resources/` |
| API: configuration, handlers, actions, config object, common patterns | `.agent/skills/knowledgeworker_asset_setup/docs/api-reference.md` |
| Design tokens (`--kw-*`) and official KW CSS classes | `.agent/skills/knowledgeworker_asset_setup/docs/design-tokens.md` |
| MCP lookup, accessibility, supply-chain security | `.agent/skills/knowledgeworker_asset_setup/docs/operations.md` |
| Responsive design, `setHeight`, state, completion, **`labels.json` conventions** (text/HTML insertion, soft hyphens), anti-patterns | `.agent/skills/knowledgeworker_asset_setup/docs/best-practices.md` |
| Localization: `?lang=` param + side-by-side language comparison page | `.agent/skills/knowledgeworker_asset_setup/docs/lang-test.md` |
| **Variant** — one repo → N independent game zips (TS + SCSS); not the default flow | `.agent/skills/knowledgeworker_asset_setup/docs/multi-game-architecture.md` |
| Commands, TypeScript setup, troubleshooting | `.agent/skills/knowledgeworker_asset_setup/kw-asset-skill.md` |
| API source of truth (signatures, types) | https://github.com/chemmedia/knowledgeworker-embedded-asset-api |
| Quick lookup | Context7: `/chemmedia/knowledgeworker-embedded-asset-api` |
