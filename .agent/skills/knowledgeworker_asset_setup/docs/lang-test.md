# Language Test System

> Back to [kw-asset-skill.md](../kw-asset-skill.md)

Add a `?lang=` URL param + a side-by-side language comparison page to a project that
loads UI strings from per-module JSON labels files. Use this to visually test how
translated strings render across multiple languages.

## What this builds

1. **Translation files** — language-variant siblings of the base labels file (e.g. `labels.de.json`, `labels.zh.json`, `labels.ru.json`)
2. **`?lang=` URL param** — each module reads this at runtime and selects the right labels file; no param = default language (no production impact)
3. **`lang-test.html`** — a single-file dev-only comparison page that shows every module in every language side-by-side using iframes (template: [`resources/lang-test.html`](../resources/lang-test.html))
4. **Dev hub card** (optional) — a link card on the project's main `index.html` dev hub

---

## Step 1 — Gather project specifics

Before writing any code, confirm (ask the user or read the codebase):

| Question | Why you need it |
|---|---|
| What is the base labels filename? | e.g. `labels.json`, `strings.json`, `i18n.json` |
| Where do labels files live per module? | e.g. `src/app/game_N/`, `src/modules/NAME/` |
| Which languages to add? | e.g. DE, ZH, RU — you need both the locale code and a human-readable name |
| What are the module IDs and display names? | For the tab strip in `lang-test.html` |
| What URL does the dev server serve each module at? | e.g. `/games/game_N/` — needed for iframe `src` |
| What is the source/default language? | Usually `en` — this file keeps its current name unchanged |

---

## Step 2 — Add `?lang=` param to each module

Locate where each module fetches its labels file. Add this **before** the fetch call, at
module scope (or inside the init callback — wherever `fetch('labels.json')` currently lives):

```ts
const lang = new URLSearchParams(location.search).get('lang') ?? 'en';
const labelsPath = lang === 'en' ? './labels.json' : `./labels.${lang}.json`;
```

Replace every `fetch('labels.json')` (or whatever the base filename is) with `fetch(labelsPath)`.

**Rules:**
- Default (`?lang=` absent or `en`) must load the original file unchanged
- Unknown lang codes will 404; the module should handle this gracefully (already true if it handles any fetch failure)
- This must have **zero production impact** — the LMS / host platform never appends `?lang=`

---

## Step 3 — Create translation files

For each module × each language, create a sibling file:

```
<module-dir>/labels.<locale>.json
```

Example for a module at `src/app/game_1/` with DE, ZH, RU:
```
src/app/game_1/labels.de.json
src/app/game_1/labels.zh.json
src/app/game_1/labels.ru.json
```

**Content rules:**
- Identical key structure and key names to the English source
- Real translations (not placeholders)
- `{{placeholder}}` tokens are preserved exactly — they are runtime-substituted, not translated
- Do not translate `config.json` or any non-UI-string files
- Follow the label content & insertion convention (plain `textContent` default, `*_html` rich lane, soft hyphens) in [best-practices.md §9.1.1](./best-practices.md#911-label-content--insertion--textcontent-vs-innerhtml)

---

## Step 4 — Create `lang-test.html`

Copy [`resources/lang-test.html`](../resources/lang-test.html) to the **project root**. It is a
self-contained HTML/CSS/JS file — no build step, served natively by Vite/webpack/any dev server.

Then customise the two arrays at the top of the `<script>` block:

- **`MODULES`** — one entry per module: `{ id, label, url: (lang) => `...?lang=${lang}` }`
- **`LANGS`** — one entry per language: `{ code, label, script }`
- **`DEFAULT_LANG_URL`** — the URL of each module's default (EN) build, used for the baseline link

---

## Step 5 — Add dev hub card (optional)

If the project has an `index.html` dev hub, add a card linking to `/lang-test.html`. If the dev hub
already defines a card style, reuse its classes to match. Otherwise use this self-contained card,
which matches the neutral `lang-test.html` palette:

```html
<a class="card" href="/lang-test.html"
   style="display:flex;align-items:center;gap:.85rem;padding:1rem 1.15rem;border-radius:14px;
          border:1px solid rgba(0,0,0,.12);background:#fff;color:#1c1917;
          text-decoration:none;transition:border-color .2s"
   onmouseover="this.style.borderColor='rgba(0,0,0,.3)'"
   onmouseout="this.style.borderColor='rgba(0,0,0,.12)'">
  <span style="font-size:1.5rem">&#127760;</span>
  <div style="flex:1">
    <div style="font-weight:600">Language Test</div>
    <div style="font-size:.8125rem;color:#78716c">Compare all modules in every language side by side.</div>
  </div>
  <span style="font-size:.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
               padding:.2rem .5rem;border-radius:4px;background:rgba(0,0,0,.06);color:#78716c">dev tool</span>
</a>
```

---

## Checklist

- [ ] `?lang=` param read in every module's init path
- [ ] `./labels.json` unchanged (default language unaffected)
- [ ] Translation files created for every module × every language
- [ ] `{{placeholder}}` tokens preserved in all translation files
- [ ] `lang-test.html` copied to project root with correct `MODULES` and `LANGS` arrays
- [ ] Iframes load lazily (only on tab activation)
- [ ] Dev hub card added (if applicable)
- [ ] Verified in browser: switching tabs reloads iframes, EN baseline link correct
- [ ] No build config changes required

---

## Notes

- The `?lang=` mechanism has zero production impact — the host/LMS never appends it.
- Unknown lang codes will 404 the labels fetch; the module fails gracefully (empty labels) rather than crashing.
- `lang-test.html` is pure HTML/JS — no build step, no framework dependency. Served natively by any dev server.
- Iframe height (`700px` in the template) should be tuned to match the tallest expected module layout.
- If the project uses a different labels filename than `labels.json`, update both the `labelsPath` logic and the file naming convention in Step 3.
