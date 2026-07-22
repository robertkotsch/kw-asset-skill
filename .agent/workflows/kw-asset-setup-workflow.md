---
description: Set up a new KnowledgeWorker HTML5 embedded learning asset from scratch
---

# KnowledgeWorker Asset Setup

This workflow scaffolds a production-ready KnowledgeWorker HTML5 embedded learning asset using Vite and the `knowledgeworker-embedded-asset-api`.

> [!IMPORTANT]
> **MANDATORY PRE-CHECK**
>
> 1. Check the latest API version at `https://github.com/chemmedia/knowledgeworker-embedded-asset-api/tags`.
> 2. Use `read_url_content` (or the browser) to find the top-most tag name.
> 3. Compare with the version in `kw-asset-skill.md` and update it if necessary.

---

## Asset Type

> [!IMPORTANT]
> **MANDATORY CLARIFICATION — Ask before proceeding**
> Before writing any code, you **MUST** ask the user:
>
> *"What are you building — a **Medium**, a **Question**, a **Question with custom question text**, or an **Advanced Question**?"*
>
> **Default to `medium` if the user does not specify.**

| Type | `assetType` value |
| :--- | :--- |
| **Medium** | `'medium'` |
| **Question** | `'question'` |
| **Question with custom question text** | `'question-with-custom-question-text'` |
| **Advanced Question** | `'advanced-question'` |

Step 5 copies the matching `main.js` template from `resources/` for the chosen type.

---

## Steps

> [!CAUTION]
> **ULTIMATE DIRECTIVE: NO HARDCODED COLORS**
> You MUST NOT use ANY hardcoded colors (Hex, RGB, HSL, or named colors like `white`/`black`) and NO fallback values in CSS variables.
>
> **RESTRICTED EXCEPTION**: Hardcoded colors are ONLY permitted if explicitly requested by the USER for a specific brand-critical element.

### 1. Initialize project

> [!WARNING]
> **Do NOT use `pnpm create vite . --overwrite`** in a non-empty directory.
> The `--overwrite` flag deletes all existing files (including reference docs).

Create `package.json` directly — no Vite scaffold needed since every generated file
is replaced in subsequent steps anyway:

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

Then install all dependencies:

```bash
pnpm add -D vite archiver
pnpm add github:chemmedia/knowledgeworker-embedded-asset-api#v.4.1.0
```

> [!IMPORTANT]
> **Pin to the verified tag** — always use `#<tag>` (e.g., `#v.4.1.0`) when installing from GitHub.
> A floating reference (no `#ref`) silently tracks `HEAD` and is vulnerable to supply chain attacks.
> After installing, **commit `pnpm-lock.yaml`** to lock the resolved SHA for all future installs.

> [!NOTE]
> **Upstream tag quirk.** 4.1.0 is tagged `v.4.1.0` (stray dot after `v`), not `v4.1.0`.
> If chemmedia later corrects the tag, pin the commit instead:
> `#2cd242908418902f4534ab3d0356df5da2a7c69f`.

// turbo

### 2. Audit dependencies

```bash
pnpm audit
```

Review any reported vulnerabilities before proceeding. For CI pipelines, use `pnpm audit --audit-level=high` to fail on high-severity issues.

// turbo

### 3. Create index.html

Copy the contents of `resources/index.html` into the project's `index.html`.

> [!NOTE]
> The template uses `lang="de"`. Change the `lang` attribute to match your asset's language (e.g., `"en"`, `"fr"`).

### 4. Create src/style.css

Copy the contents of `resources/style.css` into `src/style.css`.

> [!IMPORTANT]
> The style.css uses **only** `var(--kw-*)` design tokens. Do NOT add hardcoded color fallbacks.

### 5. Create src/main.js — copy the template for the chosen asset type

Copy the matching template from `resources/` into `src/main.js`. **Copy verbatim — do not retype or regenerate the file.**

| `assetType` | Copy this file |
| :--- | :--- |
| `'medium'` (default) | `resources/main.medium.js` |
| `'question'` | `resources/main.question.js` |
| `'question-with-custom-question-text'` | `resources/main.question.js` (identical to `'question'`) |
| `'advanced-question'` | `resources/main.advanced-question.js` |

> [!TIP]
> For local development outside the KnowledgeWorker LMS, use `resources/main-with-fallback.js` instead.
> It adds a 300ms timeout that falls back to `localStorage` when no parent LMS frame is detected.

> [!IMPORTANT]
> **Key rule for all question types:** Never show feedback, solutions, or lock the UI on your own.
> Always wait for the corresponding LMS callback. Advanced Question additionally renders its own
> Check Answer / Retry / Show Solution buttons, but the LMS still controls their visibility.

### 6. Create vite.config.js

Copy the contents of `resources/vite.config.js` into the project root.

> [!IMPORTANT]
> **Relative Base Path Required**
> `base: "./"` is set in the Vite config. KnowledgeWorker assets are served from dynamic
> subdirectories, so absolute paths (default `/`) will break asset loading.

### 7. Copy build-zip.js

Copy `resources/build-zip.js` into the project root.

### 8. Create public/media folder

Create an empty `public/media/` directory in the project root.

This is the designated location for all static media assets (images, audio, video, fonts) that will be referenced by URL in the asset. Vite copies the entire `public/` folder verbatim into `dist/` at build time, so files placed here are accessible at `./media/filename.ext` in both dev and production.

### 9. Create external configuration files

Create these JSON files in `public/` so they are deployed at the root of the built asset:

#### public/config.json

```json
{
  "_comment": "Asset-specific settings. Accessible at ./config.json in production."
}
```

#### public/labels.json

```json
{
  "_comment": "Default-language user-facing text. One file per language (labels.<locale>.json, identical keys). Insert via textContent; *_html keys for inline markup (escape placeholders). See docs/best-practices.md §9.1."
}
```

Optionally, if your asset needs to map identifiers to resources:

#### public/mapping.json (optional)

```json
{
  "_comment": "Maps logical keys to resource identifiers or content."
}
```

> [!TIP]
> Externalizing text into `labels.json` makes translation a file-swap operation — no code changes required.
> `config.json` lets content authors adjust behavior (e.g., timers, thresholds) without rebuilding.
> All three files are served from the asset root (`./config.json`, `./labels.json`, `./mapping.json`).

### 10. Create .gitignore

Create `.gitignore` with standard exclusions:

```
node_modules
dist
dist-ssr
*.local
asset.zip
```

// turbo

### 11. Verify setup

```bash
pnpm run dev
```

Dev server starts on http://localhost:8080. Confirm the page loads without errors.

### 12. Localization (optional)

> [!IMPORTANT]
> **ASK THE USER:**
>
> *"Are you going to localize this asset into other languages?"*
>
> - **No** → skip this step. The single `labels.json` is all you need.
> - **Yes** → set up the language test system so translated strings can be compared side by side.

If **yes**, follow [`docs/lang-test.md`](../skills/knowledgeworker_asset_setup/docs/lang-test.md). It adds:

- a `?lang=` URL param so the asset loads `labels.<locale>.json` variants (zero production impact — the LMS never appends it),
- per-language translation files alongside `public/labels.json`,
- a dev-only `lang-test.html` comparison page (template: `resources/lang-test.html`).

---

## Result

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

Running `pnpm run build` will produce:

- `dist/` — built files
- `asset.zip` — ready for upload to KnowledgeWorker

---

> For API reference, design tokens, common patterns, and troubleshooting, consult the Skill:
> `.agent/skills/knowledgeworker_asset_setup/kw-asset-skill.md`
