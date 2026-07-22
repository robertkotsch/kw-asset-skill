---
name: knowledgeworker_asset_setup
description: Create a production-ready KnowledgeWorker HTML5 embedded learning asset.
---

# KnowledgeWorker HTML5 Asset Setup

> [!IMPORTANT]
> **MANDATORY PRE-CHECK FOR AGENTS**
> Before starting instantiation, you **MUST** check the latest release version of the API on GitHub:
>
> 1. Check the latest tag at `https://github.com/chemmedia/knowledgeworker-embedded-asset-api/tags` using `read_url_content` or a browser tool.
> 2. Compare the latest tag with the "Verified" version below.
> 3. If a newer version exists (e.g., `v5.0.0`), you **MUST** automatically update this `SKILL.md` file to reflect the new version in the "Verified" note below. Do this BEFORE proceeding with any other steps.
> 4. **Verified for API v4.1.0 and UI v3.x** (Last check: 2026-07-22)

Reference document for KnowledgeWorker HTML5 embedded learning assets.

## Skill Folder Structure

```
knowledgeworker_asset_setup/
|-- kw-asset-skill.md                 <-- This file (hub / entry point)
+-- docs/
|   |-- api-reference.md              <-- API config, handlers, actions, patterns
|   |-- design-tokens.md              <-- CSS variables, KW classes
|   |-- best-practices.md             <-- responsive, setHeight, state, completion, anti-patterns
|   |-- operations.md                 <-- MCP, accessibility, supply chain
|   |-- lang-test.md                  <-- ?lang= param + side-by-side language test page
|   +-- multi-game-architecture.md    <-- variant: one repo -> N independent game zips (TS+SCSS)
+-- resources/
    |-- index.html                    <-- HTML boilerplate
    |-- main.medium.js                <-- main.js template for assetType 'medium'
    |-- main.question.js              <-- main.js template for 'question' / 'question-with-custom-question-text'
    |-- main.advanced-question.js     <-- main.js template for 'advanced-question'
    |-- main-with-fallback.js         <-- main.js with local dev fallback
    |-- style.css                     <-- Base stylesheet (design tokens only)
    |-- vite.config.js                <-- Vite config (relative base path)
    |-- build-zip.js                  <-- ZIP build script for deployment
    |-- config.json                   <-- Template: asset-specific settings
    |-- labels.json                   <-- Template: translatable text strings
    |-- mapping.json                  <-- Template: key-to-resource map (optional)
    +-- lang-test.html                <-- Template: dev-only language comparison page
```

**Resulting project structure after setup:**

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

## Stack

| Tool                                   | Purpose                                 |
| -------------------------------------- | --------------------------------------- |
| **pnpm**                               | Package manager (NOT npm or yarn)       |
| **Vite**                               | Build tool and dev server (NOT Webpack) |
| **Vanilla JS**                         | No framework by default                 |
| **knowledgeworker-embedded-asset-api** | LMS communication layer                 |

> [!NOTE]
> **To scaffold a new asset**, run the `/kw-asset-setup-workflow`.
> This skill is a **reference document** — API patterns, design tokens, and troubleshooting only.

---

> [!CAUTION]
> **ULTIMATE DIRECTIVE: NO HARDCODED COLORS**
> You MUST NOT use ANY hardcoded colors (Hex, RGB, HSL, or named colors like `white`/`black`) and NO fallback values in CSS variables.
>
> **RESTRICTED EXCEPTION**: Hardcoded colors are ONLY permitted if explicitly requested by the USER for a specific brand-critical element.
>
> In all other cases, you must rely 100% on the design tokens provided by KnowledgeWorker at runtime. Failure to follow this is a critical violation of architectural principles.

---

## Reference Documents

| Document                                  | Contents                                                         |
| ----------------------------------------- | ---------------------------------------------------------------- |
| [api-reference.md](docs/api-reference.md) | Configuration, handlers, actions, config object, common patterns |
| [design-tokens.md](docs/design-tokens.md) | CSS variables, official KW CSS classes                           |
| [best-practices.md](docs/best-practices.md) | Responsive, `setHeight`, state persistence, completion, loading, anti-patterns (all asset types) |
| [operations.md](docs/operations.md)       | MCP integration, accessibility, supply chain security            |
| [lang-test.md](docs/lang-test.md)         | `?lang=` URL param + side-by-side multi-language comparison page  |
| [multi-game-architecture.md](docs/multi-game-architecture.md) | **Variant**: one repo → N independent game zips (TS + SCSS). Not the default flow |

---

## API Reference Links

### Context7 Documentation (Quick Lookup)

- [API Reference](https://context7.com/chemmedia/knowledgeworker-embedded-asset-api)
- [UI Library Reference](https://context7.com/chemmedia/knowledgeworker-embedded-asset-api-ui)

### Package & Documentation (Source of Truth)

- [GitHub Repository](https://github.com/chemmedia/knowledgeworker-embedded-asset-api)
- [Configuration](https://github.com/chemmedia/knowledgeworker-embedded-asset-api#configuration)
- [Actions](https://github.com/chemmedia/knowledgeworker-embedded-asset-api#actions)
- [Handlers](https://github.com/chemmedia/knowledgeworker-embedded-asset-api#handlers)
- [Design](https://github.com/chemmedia/knowledgeworker-embedded-asset-api#design)

### Examples

- [Basic Example](https://github.com/chemmedia/knowledgeworker-embedded-asset-api-example)
- [Question/Quiz Example](https://github.com/chemmedia/knowledgeworker-embedded-asset-api-question-example)

### UI Components

- [UI Component Library](https://github.com/chemmedia/knowledgeworker-embedded-asset-api-ui)

---

## Commands

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `pnpm install`     | Install dependencies         |
| `pnpm run dev`     | Start dev server (port 8080) |
| `pnpm run build`   | Build to dist/ + asset.zip   |
| `pnpm run preview` | Preview production build     |

---

## TypeScript Setup (Optional)

To use TypeScript instead of vanilla JS:

1. Initialize with `pnpm create vite . --template vanilla-ts`
2. Install dependencies per the `/kw-asset-setup-workflow`
3. Rename `src/main.js` → `src/main.ts` and update `index.html` script src to `/src/main.ts`

The API package includes TypeScript definitions.

---

## Troubleshooting

| Issue                    | Cause                           | Fix                                                                   |
| ------------------------ | ------------------------------- | --------------------------------------------------------------------- |
| API import error         | Package not installed           | `pnpm add github:chemmedia/knowledgeworker-embedded-asset-api#v.4.1.0` |
| onInitialize never fires | Running outside KnowledgeWorker | Use `resources/main-with-fallback.js` pattern                         |
| Port 8080 in use         | Another process using port      | Vite auto-selects next port                                           |
