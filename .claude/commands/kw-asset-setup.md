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
`base:"./"`, pinned prebuilt npm API version).

1. Copy the baseline dependency files:

   Copy `resources/package.json`, `resources/pnpm-lock.yaml` and
   `resources/pnpm-workspace.yaml` into the NEW project's root. Do not overwrite
   existing user files. The baseline pins API 4.1.0, Vite 8.3.7 and yazl 3.3.1,
   including the audited transitive graph. Use Node.js 20.19+ or 22.12+ and pnpm 10.23.0.
   The ZIP template requires yazl; replace older Archiver-based templates too.

   ```bash
   pnpm install --frozen-lockfile
   ```
2. Follow the mandatory dependency review in `docs/operations.md`: run `pnpm audit --audit-level=low` and `pnpm outdated`; apply reviewed updates with `pnpm update`, then repeat audit, build, ZIP and browser checks.
3. Resolve or report every audit, deprecation, peer or runtime issue before declaring success.
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
