---
name: knowledgeworker-asset-setup
description: Build or modify a Knowledgeworker HTML5 embedded learning asset (medium, question, question-with-custom-question-text, or advanced-question) using Vite + Vanilla JS + the knowledgeworker-embedded-asset-api. Use when scaffolding a new KW asset, wiring the LMS API (onInitialize, answered, completed, suspend data, design tokens), implementing responsive/iframe-height/state-persistence/completion best practices, building multiple games in one repo, or packaging asset.zip for upload.
---

# Knowledgeworker HTML5 Asset Setup

This skill is the **knowledge layer** for building Knowledgeworker embedded assets. To
scaffold a new asset, run the `/kw-asset-setup` command — it orchestrates the steps.

> [!IMPORTANT]
> **MANDATORY PRE-CHECK.** Before scaffolding, verify the API version:
> 1. Read the latest tag at `https://github.com/chemmedia/knowledgeworker-embedded-asset-api/tags`.
> 2. Compare with the verified version: **API v4.1.0 / UI v3.x** (last check: 2026-11-10).
> 3. If a newer major exists, update the version here and in the command before proceeding.

## Required security check

At every setup or dependency refresh, run `pnpm audit --audit-level=low` and
`pnpm outdated`, apply reviewed fixes with `pnpm update`, then rerun audit,
build, ZIP and browser checks. Follow the complete mandatory dependency review
in [operations](docs/operations.md#mandatory-dependency-review-at-every-setup-or-refresh).
Report vulnerabilities, deprecations, peer/runtime conflicts and unresolved issues.

## Stack (non-negotiable)

| Tool | Note |
| --- | --- |
| **pnpm** | NOT npm or yarn |
| **Vite** | NOT Webpack |
| **Vanilla JS** | no framework by default |
| **knowledgeworker-embedded-asset-api** | LMS layer, prebuilt registry release installed with pnpm, pinned |

## Decide the asset type first

Ask the user before writing code: *"Medium, Question, Question with custom question text,
or Advanced Question?"* **Default to `medium`.** Then copy the matching template:

| `assetType` | Template → `src/main.js` |
| --- | --- |
| `'medium'` | `resources/main.medium.js` |
| `'question'` | `resources/main.question.js` |
| `'question-with-custom-question-text'` | `resources/main.question.js` (identical) |
| `'advanced-question'` | `resources/main.advanced-question.js` |

## Hard rules (determinism anchors)

- **NO HARDCODED COLORS.** No Hex/RGB/HSL/named colors, no CSS-variable fallbacks. Use only
  `var(--kw-*)` tokens injected at runtime. Sole exception: a brand-critical element the user explicitly requests.
- **`base: "./"`** in `vite.config.js` — absolute base breaks embedded loading.
- **Pin the prebuilt npm API release** (`pnpm add -E knowledgeworker-embedded-asset-api@4.1.0`); commit `pnpm-lock.yaml`. Avoid Git installs, which run upstream build tooling with known advisories. See `docs/operations.md` for verification details.
- **Never** run `pnpm create vite . --overwrite` in a non-empty dir — it deletes files.
- **Copy templates verbatim** from `resources/`. Do not retype or regenerate them.
- **Question types:** never show feedback/solution or lock the UI yourself — wait for the LMS callback.

## Skill folder structure

```
knowledgeworker-asset-setup/
|-- SKILL.md                    ← this file (hub / entry point)
|-- resources/                  ← copyable templates (copy verbatim into the project)
|   |-- index.html
|   |-- style.css
|   |-- main.medium.js
|   |-- main.question.js
|   |-- main.advanced-question.js
|   |-- main-with-fallback.js   ← local dev fallback (no LMS)
|   |-- vite.config.js
|   |-- build-zip.js
|   |-- config.json
|   |-- labels.json
|   +-- mapping.json
+-- docs/                       ← reference (load on demand)
    |-- asset-types.md          ← type descriptions, diagrams, handler/action tables
    |-- api-reference.md        ← config, handlers, actions, patterns
    |-- design-tokens.md        ← CSS variables, official KW CSS classes
    |-- best-practices.md       ← responsive, setHeight, state, completion, anti-patterns
    |-- operations.md           ← MCP lookup, accessibility, supply-chain security
    +-- multi-game-architecture.md  ← variant: one repo → N independent game zips (TS+SCSS)
```

## Reference documents

| Need | File |
| --- | --- |
| Asset-type deep dive (diagrams, tables, capability matrix) | `docs/asset-types.md` |
| API: config, handlers, actions, config object, patterns | `docs/api-reference.md` |
| Design tokens + official KW CSS classes | `docs/design-tokens.md` |
| **Best practices** (responsive, `setHeight`, state, completion, loading, anti-patterns) | `docs/best-practices.md` |
| MCP lookup, accessibility, supply-chain security | `docs/operations.md` |
| **Multi-game variant** (one repo → N independent zips, TS + SCSS) | `docs/multi-game-architecture.md` |
| API source of truth | https://github.com/chemmedia/knowledgeworker-embedded-asset-api |
| Quick lookup | Context7: `/chemmedia/knowledgeworker-embedded-asset-api` |

> [!NOTE]
> Consult `docs/best-practices.md` whenever building real interactive content (it covers the
> non-obvious iframe/height/responsive/state pitfalls). Use `docs/multi-game-architecture.md`
> **only** when one repo must ship several independent games — it replaces the default
> single-asset, vanilla-JS flow with a TypeScript + SCSS multi-build setup.

## Commands & troubleshooting

| Command | Description |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm run dev` | Start dev server (port 8080) |
| `pnpm run build` | Build to `dist/` + `asset.zip` |
| `pnpm run preview` | Preview production build |

| Issue | Cause | Fix |
| --- | --- | --- |
| API import error | Package not installed | `pnpm add -E knowledgeworker-embedded-asset-api@4.1.0` |
| `onInitialize` never fires | Running outside KnowledgeWorker | Use `resources/main-with-fallback.js` |
| Port 8080 in use | Another process | Vite auto-selects next port |

## TypeScript (optional)

1. `pnpm create vite . --template vanilla-ts`
2. Install deps as normal
3. Rename `src/main.js` → `src/main.ts`, update `index.html` script src

The API package includes TypeScript definitions.
