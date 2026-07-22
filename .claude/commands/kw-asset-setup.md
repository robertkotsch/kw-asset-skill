---
description: Scaffold a production-ready Knowledgeworker HTML5 embedded asset
argument-hint: [medium | question | question-with-custom-question-text | advanced-question]
---

Scaffold a Knowledgeworker HTML5 embedded learning asset. Follow the
`knowledgeworker-asset-setup` skill for all rules and references.

Requested asset type: **$1** (if empty, ask the user; default to `medium`).

## Step 0 — Pre-check (do this first)
Read the latest tag at https://github.com/chemmedia/knowledgeworker-embedded-asset-api/tags.
If it is a newer major than the verified `v4.x`, tell the user and update the version
references in the skill before continuing.

## Step 1 — Confirm asset type
If `$1` is empty, ask: "Medium, Question, Question with custom question text, or Advanced
Question?" Default to `medium`. This selects which `main.js` template to copy in Step 6.

## Steps — copy from resources/, do not regenerate

Templates live in `.claude/skills/knowledgeworker-asset-setup/resources/`. **Copy each file
verbatim** into the target path. Obey the skill's hard rules (no hardcoded colors,
`base:"./"`, pinned API tag).

1. Create `package.json`:
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
2. Install deps, then commit the lockfile:
   ```bash
   pnpm add -D vite archiver
   pnpm add github:chemmedia/knowledgeworker-embedded-asset-api#v.4.1.0
   ```
3. `pnpm audit` — review before proceeding.
4. Copy `resources/index.html` → `index.html` (set `lang` to the asset's language).
5. Copy `resources/style.css` → `src/style.css` (tokens only, no color fallbacks).
6. Copy the template for the chosen type → `src/main.js`:
   - `medium` → `resources/main.medium.js`
   - `question` / `question-with-custom-question-text` → `resources/main.question.js`
   - `advanced-question` → `resources/main.advanced-question.js`
   - For local dev outside the LMS, use `resources/main-with-fallback.js`.
7. Copy `resources/vite.config.js` → project root (`base:"./"` already set).
8. Copy `resources/build-zip.js` → project root.
9. Create empty `public/media/`.
10. Copy `resources/config.json`, `resources/labels.json`, and (optional) `resources/mapping.json` → `public/`.
11. Create `.gitignore`: `node_modules`, `dist`, `dist-ssr`, `*.local`, `asset.zip`.
12. Run `pnpm run dev` and confirm http://localhost:8080 loads without errors.

When done, report the resulting file tree and how to build for upload
(`pnpm run build` → `dist/` + `asset.zip`).
