# What To Do Next

You ran the setup. The dev server works. Now what?

This guide walks you through building your first Knowledgeworker asset — step by step, without overwhelming you.

---

## The Golden Rules

Before you write a single line of code, burn these into memory:

1. **No hardcoded colors.** Ever. Use `var(--kw-*)` tokens. The LMS provides them.
2. **Plan before you code.** 10 minutes of planning saves 2 hours of rewriting.
3. **Work in small steps.** Change one thing → check the browser → repeat.
4. **Commit often.** Every time something works, commit it. You'll thank yourself later.

---

## Step 1: Decide What Your Asset Does

Before touching any code, answer these questions on paper (or in a note):

| Question                               | Example Answer                         |
| -------------------------------------- | -------------------------------------- |
| What does the learner **see**?         | A drag-and-drop sorting exercise       |
| What does the learner **do**?          | Drag items into the correct order      |
| When is it **complete**?               | When all items are placed correctly    |
| Does it need to **remember** anything? | Yes — which items were placed          |
| Is it a **medium** or a **question**?  | Question (it has a right/wrong answer) |

> [!TIP]
> If you're unsure whether it's a "medium" or "question": does the learner get a score? → **Question.** Is it just content to view/interact with? → **Medium.**

---

## Step 2: Set Up Your Configuration Files

You have three JSON files in `public/`. Use them.

### `config.json` — Settings you might want to change later

```json
{
  "timeLimit": 60,
  "maxAttempts": 3,
  "shuffleItems": true
}
```

### `labels.json` — Every piece of text the learner sees

```json
{
  "title": "Sortiere die Schritte",
  "instruction": "Ziehe die Elemente in die richtige Reihenfolge.",
  "buttonCheck": "Überprüfen",
  "buttonReset": "Zurücksetzen",
  "feedbackCorrect": "Richtig!",
  "feedbackIncorrect": "Leider falsch. Versuche es erneut."
}
```

### `mapping.json` — Your content data (optional)

```json
{
  "items": [
    { "id": "step1", "text": "Wasser erhitzen" },
    { "id": "step2", "text": "Teebeutel einlegen" },
    { "id": "step3", "text": "3 Minuten ziehen lassen" }
  ]
}
```

> [!IMPORTANT]
> **Why external files?** Because they let you change settings, translations, and content **without rebuilding your code.** Someone who doesn't know JavaScript can still translate the asset — they just edit `labels.json`.

### Loading these files in your code

```javascript
// In src/main.js — load your config files
async function loadConfig() {
  const [config, labels, mapping] = await Promise.all([
    fetch("./config.json").then((r) => r.json()),
    fetch("./labels.json").then((r) => r.json()),
    fetch("./mapping.json").then((r) => r.json()),
  ]);
  return { config, labels, mapping };
}
```

> [!NOTE]
> Use `./config.json` (with the dot), not `/config.json`. The relative path is important because Knowledgeworker serves assets from dynamic subdirectories.

---

## Step 3: Build Your HTML Structure

Edit `index.html` to sketch out the structure of your asset. Keep it simple. Use semantic HTML.

```html
<div id="app">
  <h2 class="kw-headline2" id="title"></h2>
  <p class="kw-paragraph" id="instruction"></p>

  <div id="content">
    <!-- Your interactive content goes here -->
  </div>

  <div class="button-bar">
    <button class="kw-button-primary" id="btn-check"></button>
    <button class="kw-button-secondary" id="btn-reset"></button>
  </div>
</div>
```

Notice:

- Use Knowledgeworker's CSS classes (`kw-headline2`, `kw-paragraph`, `kw-button-primary`)
- Leave text content **empty** — you'll fill it from `labels.json`
- Give interactive elements **unique IDs** for easy access in JavaScript

---

## Step 4: Style With Design Tokens

In `src/style.css`, style your layout — but **never pick colors yourself.**

```css
/* ✅ Correct — uses LMS design tokens */
.button-bar {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

#content {
  border: 2px solid var(--kw-action-color);
  border-radius: var(--kw-button-border-radius);
  padding: 1rem;
}

/* ❌ Wrong — hardcoded color */
#content {
  border: 2px solid #3498db;
}
```

**What you CAN hardcode:** spacing (`rem`, `px`), layout (`flex`, `grid`), sizes, borders _widths_.

**What you CANNOT hardcode:** colors, font families, font sizes. Use `var(--kw-*)` for all of these.

### Available design tokens (cheat sheet)

| Token                          | Use for                             |
| ------------------------------ | ----------------------------------- |
| `--kw-text-color`              | Body text                           |
| `--kw-headline-color`          | Headings                            |
| `--kw-action-color`            | Buttons, links, interactive accents |
| `--kw-action-text-color`       | Text on action-colored backgrounds  |
| `--kw-background-color`        | Page background                     |
| `--kw-feedback-positive-color` | Correct answer feedback             |
| `--kw-feedback-negative-color` | Wrong answer feedback               |
| `--kw-text-font-family`        | Body font                           |
| `--kw-headline-font-family`    | Heading font                        |
| `--kw-text-font-size`          | Base font size                      |
| `--kw-button-border-radius`    | Rounded corners on buttons          |

---

## Step 5: Write Your JavaScript

> [!NOTE]
> Setup already copied a starting `src/main.js` from the canonical template for your asset
> type (`resources/main.medium.js`, `main.question.js`, or `main.advanced-question.js`).
> The pattern below shows how to *grow* it — load config, restore state, render — not a file
> to retype from scratch.

Here's a minimal but proper pattern for `src/main.js`:

```javascript
import {
  onInitialize,
  onDesignChanged,
  setSuspendData,
  setHeight,
} from "knowledgeworker-embedded-asset-api";

// ── 1. Load external files ─────────────────────────
async function loadConfig() {
  const [config, labels, mapping] = await Promise.all([
    fetch("./config.json").then((r) => r.json()),
    fetch("./labels.json").then((r) => r.json()),
    fetch("./mapping.json")
      .then((r) => r.json())
      .catch(() => null),
  ]);
  return { config, labels, mapping };
}

// ── 2. Initialize when LMS is ready ────────────────
onInitialize(async (configuration) => {
  const { config, labels, mapping } = await loadConfig();

  // Restore saved state if any
  let state = {};
  if (configuration.suspendData) {
    state = JSON.parse(configuration.suspendData);
  }

  // Build your UI
  renderApp({ config, labels, mapping, state });

  // Tell LMS how tall your content is
  setHeight(document.body.scrollHeight);
});

// ── 3. React to design changes ─────────────────────
onDesignChanged(() => {
  // CSS variables update automatically —
  // only needed if you read colors in JS (e.g., for canvas)
});

// ── 4. Save progress ──────────────────────────────
function saveState(state) {
  setSuspendData(JSON.stringify(state));
}

// ── 5. Render ──────────────────────────────────────
function renderApp({ config, labels, mapping, state }) {
  document.getElementById("title").textContent = labels.title;
  document.getElementById("instruction").textContent = labels.instruction;
  document.getElementById("btn-check").textContent = labels.buttonCheck;
  document.getElementById("btn-reset").textContent = labels.buttonReset;

  // Your interactive logic goes here
}
```

---

## Step 6: Test Locally

```bash
pnpm run dev
```

Open http://localhost:8080. You'll see your asset **without** the LMS wrapper.

> [!NOTE]
> `onInitialize` won't fire locally because there's no parent LMS frame. For local testing
> with state, copy `.agent/skills/knowledgeworker_asset_setup/resources/main-with-fallback.js`
> over your `src/main.js` — it falls back to `localStorage` after 300 ms when no LMS is detected.

### Check these things:

- [ ] Does the page render without console errors?
- [ ] Are texts coming from `labels.json`?
- [ ] Does the layout look right — without you having chosen any colors?
- [ ] Do buttons respond to clicks?
- [ ] Does the page work at different widths? (resize the browser)

---

## Step 7: Build and Deploy

When you're ready:

```bash
pnpm run build
```

This creates `asset.zip` in your project root. Upload it to Knowledgeworker.

---

## Common Mistakes (and How to Avoid Them)

### 🚫 "I'll just pick a nice blue for this button"

No. Use `var(--kw-action-color)`. The LMS matches it to the course designer's theme.

### 🚫 "I'll add all the features first, then test"

Test after every small change. A 5-minute bug found now saves a 2-hour debugging session later.

### 🚫 "I'll put all my text directly in the HTML"

Don't. Put it in `labels.json`. Future-you (or a translator) will be grateful.

### 🚫 "I'll use absolute paths like `/images/photo.jpg`"

Use relative paths: `./media/photo.jpg`. Absolute paths break inside Knowledgeworker.

### 🚫 "I'll save everything in `suspendData`"

Keep it minimal. SCORM often limits you to 4KB. Save only what you need to restore the state.

### 🚫 "I changed something but nothing happened"

Did you save the file? Is the dev server running? Check the terminal and browser console.

---

## Your Development Rhythm

Once you're comfortable, follow this cycle:

```
Plan → Code a small piece → Save → Check browser → Fix → Commit → Repeat
```

**Commit messages that help:**

```
✅ "Add drag-and-drop for sorting items"
✅ "Fix: items not loading from mapping.json"
✅ "Style feedback messages with KW tokens"

❌ "stuff"
❌ "fix"
❌ "asdfg"
```

---

## When You're Stuck

1. **Check the browser console** (F12 → Console tab). Errors there are usually clear.
2. **Check the reference docs** — troubleshooting lives in `.agent/skills/knowledgeworker_asset_setup/kw-asset-skill.md`; API patterns in that skill's `docs/api-reference.md`. The rules and setup checklist are in `Playbooks/KW_ASSET_SETUP.md`.
3. **Ask your AI assistant.** Be specific: _"The `onInitialize` callback doesn't fire when I run `pnpm run dev`"_ is 100× better than _"it doesn't work."_
4. **Check the official examples:**
   - [Basic Example](https://github.com/chemmedia/knowledgeworker-embedded-asset-api-example)
   - [Question Example](https://github.com/chemmedia/knowledgeworker-embedded-asset-api-question-example)

---

## Quick Reference: File Purposes

| File                  | What goes in it                   | Who edits it                             |
| --------------------- | --------------------------------- | ---------------------------------------- |
| `src/main.js`         | Your application logic            | Developer                                |
| `src/style.css`       | Layout and styling (tokens only!) | Developer                                |
| `index.html`          | Page structure                    | Developer                                |
| `public/config.json`  | Adjustable settings               | Developer or content author              |
| `public/labels.json`  | All visible text                  | Developer, translator, or content author |
| `public/mapping.json` | Content data and mappings         | Developer or content author              |
| `public/media/`       | Images, audio, video, fonts       | Content author                           |
| `vite.config.js`      | Build configuration               | Developer (rarely changes)               |

---

> [!TIP]
> **You've got this.** The foundation is solid. You don't need to understand everything at once. Start small, test often, and build up piece by piece. Every expert started exactly where you are now.
