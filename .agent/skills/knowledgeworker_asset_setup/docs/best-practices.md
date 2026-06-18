# Best Practices: Knowledgeworker Embedded Asset Development

> Back to [kw-asset-skill.md](../kw-asset-skill.md)
>
> **Scope:** This document covers responsive design, dynamic height management, state persistence, completion handling, and additional advanced patterns for HTML5 assets embedded in Knowledgeworker Create.  
> **Audience:** AI agents and developers building Knowledgeworker embedded assets.
>
> Applies to **every** asset type. The canonical design-token list lives in [design-tokens.md](./design-tokens.md); §6 here repeats it in applied context.

---

## Table of Contents

1. [Responsive Design (Desktop / Tablet / Mobile)](#1-responsive-design-desktop--tablet--mobile) — incl. §1.6 KW frame sizing
2. [Dynamic Height with `setHeight`](#2-dynamic-height-with-setheight)
3. [State Persistence with `setSuspendData`](#3-state-persistence-with-setsuspenddata)
4. [Completion Handling](#4-completion-handling)
5. [Shared Data Across Assets](#5-shared-data-across-assets)
6. [Design Tokens & Theming](#6-design-tokens--theming)
7. [Loading Screen Pattern](#7-loading-screen-pattern)
8. [Local Development Fallback](#8-local-development-fallback)
9. [Externalized Configuration](#9-externalized-configuration)
10. [Performance & Accessibility](#10-performance--accessibility)
11. [Advanced Iframe Interactions](#11-advanced-iframe-interactions)
12. [Anti-Patterns to Avoid](#12-anti-patterns-to-avoid)

---

## 1. Responsive Design (Desktop / Tablet / Mobile)

Knowledgeworker assets run inside iframes. The parent page controls the viewport. Your asset must adapt fluidly to the available width, since you have **no control over the iframe width**.

### 1.1 Breakpoints

Define a shared set of SCSS breakpoints and reference them consistently:

```scss
$breakpoint-mobile: 500px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1024px;
```

| Breakpoint           | Target                | Typical Width |
| -------------------- | --------------------- | ------------- |
| `max-width: 500px`   | Small mobile          | ≤ 500px       |
| `max-width: 768px`   | Tablet / large mobile | ≤ 768px       |
| `max-width: 1024px`  | Small desktop         | ≤ 1024px      |
| `min-width: 1025px`  | Desktop               | > 1024px      |

> [!TIP]
> Always include a `500px` breakpoint for small phone screens. Many interactive assets need fundamentally different interaction models at this width (e.g., switching from horizontal to vertical drag).

### 1.2 Responsive Container

Wrap your asset's root element with a responsive container that inherits the Knowledgeworker design tokens:

```scss
.kw-responsive-container {
  max-width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  /* Use 'clip' not 'hidden': 'hidden' forces overflow-y:auto, creating an unwanted scroll container */
  overflow-x: clip;
  background: var(--kw-background-color);
  color: var(--kw-text-color);
  font-family: var(--kw-text-font-family);
  font-size: var(--kw-text-font-size);

  @media (max-width: $breakpoint-tablet) {
    font-size: calc(var(--kw-text-font-size) * 0.95);
  }
}
```

If using a shared SCSS design file, extract this into a reusable `@mixin` for consistency across assets.

### 1.3 Layout Strategy by Device

| Device       | Layout Approach                             | Key CSS                                |
| ------------ | ------------------------------------------- | -------------------------------------- |
| **Desktop**  | Horizontal flex/grid, side-by-side elements | `display: flex; gap: 1rem;`            |
| **Tablet**   | Reduced gaps, scaled-down elements/fonts    | `gap: 0.75rem; font-size: 0.95em;`    |
| **Mobile**   | Stacked vertical layout, reordered elements | `flex-direction: column; order: N;`    |

#### Example: Stacking on Mobile

```scss
@media (max-width: $breakpoint-mobile) {
  .content-area {
    flex-direction: column;
    padding: 1rem 0.5rem;
    gap: 1.5rem;
  }

  .primary-section { order: 1; width: 90vw; }
  .interactive-section { order: 2; width: 90vw; }
  .secondary-section { order: 3; width: 90vw; }
}
```

### 1.4 Responsive Interaction Patterns

Different screen sizes may require different interaction models:

```javascript
const isMobile = window.innerWidth < 500;

// Example: switch drag axis based on screen size
const dragConfig = {
  type: isMobile ? 'y' : 'x',
  onDragEnd: function () {
    if (isMobile) {
      // Evaluate vertical drag distance
    } else {
      // Evaluate horizontal drag distance
    }
  }
};
```

> [!IMPORTANT]
> If your asset uses a drag library (e.g., GSAP Draggable, SortableJS), always re-create draggable instances on `resize` events, since the interaction model may need to change between orientations.

### 1.6 KW Frame Dimensions and Container Sizing

The standard Knowledgeworker Create content frame is **1260 × 708.75 px** on desktop. This is a **16:9 aspect ratio** (1260 × 9/16 = 708.75) — the fractional height is simply 1260 forced into 16:9, not an arbitrary value. Assets that set a small `max-width` (e.g. `460px`) on `.kw-responsive-container` will render as a narrow strip in the centre of the frame, wasting the available space.

**Rules:**
- Never set `max-width` below the natural minimum for your layout
- Always pair `max-width` with `width: 100%` and `margin: 0 auto` so the container is centred and fills the frame up to its cap
- Choose a cap that suits the visual concept of the asset:

| Layout pattern | Recommended `max-width` | Rationale |
|---|---|---|
| Wide / multi-column | `1200px` | Needs horizontal room for several side-by-side regions |
| Image-led | `960px` | Imagery rarely scales well beyond this |
| Single-column card | `720px` | A card/list metaphor benefits from some constraint |
| Narrow / vertical | `520px` | A deliberately narrow frame just needs centering |
| Full-bleed / panoramic | `100%` or `1440px` | Let it breathe |

**Correct pattern:**

```scss
.kw-responsive-container {
  max-width: 1200px;   // set per asset type — see table above
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
}
```

> [!WARNING]
> A `max-width` left over from early scaffolding (e.g. `460px`) will silently constrain the game in production even though the dev server looks fine at small browser window sizes. Always test at exactly **1260px** viewport width before delivery.

### 1.5 Responsive Typography

Use `clamp()` for fluid font sizes that scale between breakpoints:

```css
.card { font-size: clamp(0.8rem, 2vw, 1rem); }
.label { font-size: clamp(0.85rem, 2.5vw, 1.2rem); }
```

Enable `word-break` and `hyphens` for long labels on narrow screens:

```scss
@media (max-width: $breakpoint-tablet) {
  .label {
    font-size: 0.8rem;
    word-break: break-word;
    hyphens: auto;
  }
}
```

---

## 2. Dynamic Height with `setHeight`

Since your asset lives in an iframe, the parent page does **not** know how tall your content is. You must tell it via the API.

### 2.1 Import

```typescript
import { setHeight } from 'knowledgeworker-embedded-asset-api';
```

### 2.2 When to Call `setHeight`

| Trigger                   | Why                                             |
| ------------------------- | ----------------------------------------------- |
| After initialization      | Set the initial iframe height                   |
| After DOM content changes | New elements rendered, sections expanded, etc.  |
| On `window.resize`        | Viewport orientation or size changed            |
| After animations complete | Layout may shift after transitions              |
| On breakpoint transitions | Mobile ↔ desktop layout may change total height |

### 2.3 Recommended Pattern (Robust)

Use a **three-layer approach** for reliable height updates:

```typescript
import { setHeight } from 'knowledgeworker-embedded-asset-api';

/**
 * Reports the current content height to the Knowledgeworker iframe host.
 * Uses the `.kw-responsive-container` element if present, otherwise
 * falls back to `<main>` or `document.body`.
 */
function updateHeight(): void {
  const container = document.querySelector(
    '.kw-responsive-container'
  ) as HTMLElement | null;
  const fallback = document.querySelector('main') || document.body;
  const height =
    container?.offsetHeight || fallback.offsetHeight || window.innerHeight;
  setHeight(height);
}

// --- Layer 1: Initial call after DOM is ready ---
updateHeight();

// --- Layer 2: ResizeObserver for dynamic content changes ---
// Observe the container, not document.body. When the container is narrower
// than the body (e.g. a centered narrow layout at 520px inside a 1260px frame),
// body-size changes don't reliably reflect container-height changes.
const resizeObserver = new ResizeObserver(() => {
  updateHeight();
});
resizeObserver.observe(
  document.querySelector('.kw-responsive-container') ?? document.body
);

// --- Layer 3: Window resize fallback ---
window.addEventListener('resize', () => {
  updateHeight();
});
```

### 2.4 Device-Specific Minimum Heights

Different breakpoints often need different minimum heights to prevent collapsed layouts:

```typescript
function updateHeight(): void {
  const isMobile = window.innerWidth < 500;
  const minHeight = isMobile ? 750 : 600;
  setHeight(Math.max(document.body.scrollHeight, minHeight));
}
```

> [!WARNING]
> **Do NOT set `overflow: hidden` on `body` and rely solely on `offsetHeight`.** If content overflows, `offsetHeight` won't reflect the actual scrollable content height. Use `scrollHeight` instead, or ensure your container truly constrains all content.

### 2.5 Debouncing (Optional Optimization)

If your asset produces rapid DOM updates (e.g., during drag operations), debounce the height call:

```typescript
let heightTimer: ReturnType<typeof setTimeout>;

function debouncedHeightUpdate(): void {
  clearTimeout(heightTimer);
  heightTimer = setTimeout(() => updateHeight(), 100);
}
```

---

## 3. State Persistence with `setSuspendData`

`setSuspendData` saves a string to the LMS (Learning Management System) so the learner's progress survives iframe reloads, page navigations, and session restarts.

### 3.1 Import

```typescript
import {
  onInitialize,
  setSuspendData,
} from 'knowledgeworker-embedded-asset-api';
```

### 3.2 State Shape

Define a typed interface for your asset state. Keep it minimal:

```typescript
interface AssetState {
  currentStep: number;
  isComplete: boolean;
  startTime: number;
  userResponses: UserResponse[];
  // Add only fields you need to restore the exact UI state
}
```

### 3.3 Save Pattern

```typescript
function saveState(state: AssetState): void {
  try {
    setSuspendData(JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save suspendData:', error);
  }
}
```

**When to save:**

| Event                         | Priority |
| ----------------------------- | -------- |
| After each significant action | Medium   |
| After each correct answer     | High     |
| On asset completion           | Critical |

> [!CAUTION]
> **SCORM size limits apply.** `suspendData` is typically limited to **4 KB** (SCORM 1.2) or **64 KB** (SCORM 2004). Store only essential state — never raw DOM, full event logs, or media data.

### 3.4 Restore Pattern

```typescript
onInitialize((configuration) => {
  if (configuration.suspendData) {
    try {
      const savedState = JSON.parse(configuration.suspendData);

      // Validate with an allowlist to prevent prototype pollution
      const allowedFields = ['currentStep', 'isComplete', 'startTime', 'userResponses'];
      const validState: Partial<AssetState> = {};
      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(savedState, field)) {
          (validState as any)[field] = (savedState as any)[field];
        }
      });

      restoreState(validState);
    } catch (error) {
      console.warn('Failed to parse suspendData:', error);
      initializeFresh();
    }
  } else {
    initializeFresh();
  }
});
```

> [!IMPORTANT]
> **Always restore state BEFORE rendering the UI** to avoid flickering or showing an incorrect initial state that immediately jumps to the restored view.

### 3.5 Handling Completed vs. In-Progress Restoration

Your restore logic should branch based on the saved state:

```typescript
function restoreState(state: Partial<AssetState>): void {
  if (state.isComplete) {
    restoreCompletedView(state);   // Show final results
  } else if ((state.currentStep ?? 0) > 0) {
    restoreInProgress(state);      // Resume from last step
  } else {
    initializeFresh();             // Start fresh
  }
}
```

---

## 4. Completion Handling

### 4.1 Disable Auto-Completion

By default, Knowledgeworker marks an asset as complete when `onInitialize` fires. For interactive assets, **disable this immediately**:

```typescript
import { configure, completed } from 'knowledgeworker-embedded-asset-api';

// Must be called BEFORE window load
configure({ autoCompletion: false });
```

### 4.2 When to Call `completed()`

Call `completed()` **once** when the learner has fulfilled all required conditions:

```typescript
import { completed } from 'knowledgeworker-embedded-asset-api';

function onAssetFinished(): void {
  saveState(finalState);
  completed(); // Tells the LMS: "This asset is done"
}
```

> [!WARNING]
> `completed()` is a **one-shot action** — calling it multiple times has no additional effect, but calling it prematurely marks the asset done before the learner finishes.

### 4.3 Completion with Success Animation

A common pattern is to show a success animation before marking the asset complete. Use lazy-loading to avoid blocking the initial render:

```typescript
function onSuccess(): void {
  state.isComplete = true;
  saveState(state);

  // Lazy-load the animation module
  import('./success-animation').then((mod) => {
    mod.playSuccessAnimation().then(() => {
      completed();
    });
  });
}
```

The animation module should:
1. Create a full-screen overlay
2. Play the animation (e.g., Lottie, CSS keyframes, confetti)
3. Fade out the overlay
4. Call `completed()` only after the animation finishes

### 4.4 Question/Assessment Assets

For quiz-type assets, use `answered()` instead of `completed()`:

```typescript
import { answered } from 'knowledgeworker-embedded-asset-api';

// answered(answer, passed, score)
answered('A', true, 1.0);      // Correct answer
answered('C', false, 0.0);     // Wrong answer
answered(undefined, false, 0); // Answer revoked
```

---

## 5. Shared Data Across Assets

If multiple assets on the same page need to communicate (e.g., an asset unlocks based on another asset's completion):

```typescript
import {
  onInitialize,
  onSharedDataChanged,
  setSharedData,
} from 'knowledgeworker-embedded-asset-api';

// Read initial shared state
onInitialize((config) => {
  if (config.sharedData) {
    const shared = JSON.parse(config.sharedData);
    applySharedState(shared);
  }
});

// React to changes from other assets
onSharedDataChanged((sharedData) => {
  const shared = JSON.parse(sharedData);
  applySharedState(shared);
});

// Broadcast state to other assets
function broadcastProgress(data: object): void {
  setSharedData(JSON.stringify(data));
}
```

---

## 6. Design Tokens & Theming

### 6.1 CSS Variables (Auto-Injected)

The API automatically injects these CSS variables at runtime. Use them directly — **never hardcode colors**:

```css
/* Text & Headings */
var(--kw-text-color)
var(--kw-headline-color)
var(--kw-text-font-size)
var(--kw-text-font-family)
var(--kw-headline-font-family)
var(--kw-headline-font-weight)

/* Interactive Elements */
var(--kw-action-color)
var(--kw-action-text-color)
var(--kw-action-hover-color)
var(--kw-action-disabled-color)
var(--kw-button-border-radius)

/* Backgrounds & Focus */
var(--kw-background-color)
var(--kw-focus-color)

/* Feedback */
var(--kw-feedback-positive-color)
var(--kw-feedback-partial-positive-color)
var(--kw-feedback-negative-color)
var(--kw-feedback-solution-color)
```

### 6.2 SCSS Variable Aliases (Recommended)

Create a shared SCSS file that maps CSS variables to SCSS variables for use in mixins and calculations:

```scss
// _kw-design-vars.scss
$kw-text-color: var(--kw-text-color);
$kw-headline-color: var(--kw-headline-color);
$kw-action-color: var(--kw-action-color);
$kw-action-text-color: var(--kw-action-text-color);
$kw-action-hover-color: var(--kw-action-hover-color);
$kw-background-color: var(--kw-background-color);
$kw-feedback-positive-color: var(--kw-feedback-positive-color);
$kw-feedback-negative-color: var(--kw-feedback-negative-color);
// ... etc.
```

Then use them in your component styles:

```scss
@use 'kw-design-vars' as *;

.my-button {
  background: $kw-action-color;
  color: $kw-action-text-color;
  border-radius: var(--kw-button-border-radius);
}
```

### 6.3 Reacting to Dynamic Design Changes

The design can change at runtime (e.g., the author changes the background color in the Knowledgeworker editor):

```typescript
import { onDesignChanged } from 'knowledgeworker-embedded-asset-api';

onDesignChanged((design) => {
  // CSS variables are updated automatically.
  // Use this callback only if you need to re-render
  // canvas elements or recalculate derived values.
  if (design.backgroundColor === '#000000') {
    // Switch to light-on-dark canvas rendering
  }
});
```

> [!IMPORTANT]
> If `--kw-background-color` is black, the API sets `--kw-text-color` to white automatically. Your CSS should work with both light and dark backgrounds without modifications.

### 6.4 HTML Utility Classes

The API provides ready-made classes for consistent button and typography styling:

```html
<button class="kw-button-primary">Start</button>
<button class="kw-button-secondary" disabled>Locked</button>
<h2 class="kw-headline2">Title</h2>
<p class="kw-paragraph">Description</p>
<a class="kw-link" href="#">More info</a>
```

Interactive elements support the `disabled` attribute for an inactive visual state.

---

## 7. Loading Screen Pattern

Assets should display a loading indicator until data and resources are ready.

### 7.1 Minimal Loading Overlay

```typescript
class Loader {
  private static overlay: HTMLElement | null = null;

  static show(parent: HTMLElement = document.body): void {
    if (this.overlay) return;

    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      background: 'var(--kw-background-color, #1a1a1a)',
      zIndex: '9999',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.3s', opacity: '1',
    });

    // Add a progress bar, spinner, or branded element here
    parent.appendChild(overlay);
    this.overlay = overlay;
  }

  static hide(): void {
    if (!this.overlay) return;
    this.overlay.style.opacity = '0';
    setTimeout(() => {
      this.overlay?.remove();
      this.overlay = null;
      document.body.classList.remove('preload-hidden');
    }, 300);
  }
}
```

### 7.2 The Preload-Hidden Pattern

To prevent a flash of unstyled content (FOUC), start with the body hidden and let the loader reveal it:

```html
<style>
  .preload-hidden {
    opacity: 0 !important;
    pointer-events: none !important;
    user-select: none !important;
  }
</style>
<body class="preload-hidden">
```

Remove `preload-hidden` once loading completes (the `Loader.hide()` example above does this automatically).

---

## 8. Local Development Fallback

When running via a local dev server (e.g., `pnpm run dev`), there is no Knowledgeworker parent frame. Use a timeout-based fallback:

```typescript
let isInitialized = false;

onInitialize((configuration) => {
  isInitialized = true;
  startAsset(configuration);
});

// Fallback: start without LMS after 300ms
setTimeout(() => {
  if (!isInitialized) {
    console.log('Local dev mode — no LMS detected');
    startAsset({
      suspendData: localStorage.getItem('kw_suspend_data') ?? '',
      sharedData: '',
      design: {} as any,
    });
  }
}, 300);
```

> [!TIP]
> The API provides fallback values for all CSS variables automatically. Your styles will render correctly even outside the LMS.

---

## 9. Externalized Configuration

### 9.1 `labels.json` — All User-Facing Text

`labels.json` holds the text for **one** language — the default/source language. To localize,
create sibling files per language (`labels.de.json`, `labels.en.json`, …) with **identical keys**
and select the right file at runtime. See [lang-test.md](./lang-test.md) for the `?lang=` selection
mechanism and the side-by-side comparison page.

```json
{
  "title": "Lernspiel",
  "startButton": "Starten",
  "feedback": {
    "correct": "Richtig!",
    "incorrect": "Leider falsch."
  }
}
```

**Rules:**
- **Never** hardcode text in HTML or TypeScript
- Fetch at runtime via `fetch(labelsPath)` (default `./labels.json`; variant selection in lang-test.md)
- **One file per language**, identical key structure — **not** inline `{ "de": …, "en": … }` maps. Inline maps ship every language to every learner, bloat the payload, and make the comparison page impossible.
- `{{placeholder}}` tokens are substituted at runtime and preserved verbatim across all translations

#### 9.1.1 Label content & insertion — `textContent` vs `innerHTML`

How you inject a label into the DOM is a **project-wide decision**: it determines whether *any*
label may contain markup or soft hyphens. Choose one convention and apply it consistently — the
comparison page makes inconsistencies glaringly visible across languages.

**Default lane — plain text via `textContent` (safe):**

```javascript
el.textContent = labels.startButton;   // entities/tags render literally; no injection risk
```

Use this for the overwhelming majority of labels. It is XSS-safe even when a `{{placeholder}}`
carries LMS- or learner-provided data.

**Rich lane — opt-in HTML via `innerHTML`, marked with an `*_html` key suffix:**

```json
{ "intro_html": "Welcome, <strong>{{name}}</strong>." }
```

```javascript
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Escape every interpolated value — the template is trusted, the values are not.
const fill = (tpl, vals) => tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => escapeHtml(vals[k] ?? ''));

el.innerHTML = fill(labels.intro_html, { name: userName });
```

The `_html` suffix makes the dangerous lane obvious in both the JSON and code review. Keep inline
markup to genuine inline content (`<strong>`, `<em>`, an occasional `<a>`); never use `<br>` for
layout (use separate keys or CSS) and never put styling in labels (use CSS classes).

**Soft hyphens (long compound words):**

- **CSS first.** Set `hyphens: auto; overflow-wrap: break-word;` on text containers. Auto-hyphenation needs the correct `lang` attribute on `<html>` (already required in workflow Step 3) — the browser then breaks German compounds like *Datenschutzgrundverordnung* using its per-language dictionary.
- **Manual only for words CSS gets wrong**, and then insert the **raw U+00AD character**, not the `&shy;` entity — under the default `textContent` lane the entity would render as the literal text `&shy;`. Add a comment in the labels file noting that invisible characters are intentional (they are unmaintainable otherwise).

### 9.2 `config.json` — Behavioral Parameters

```json
{
  "maxAttempts": 3,
  "showCorrectAfterWrong": true,
  "timeoutSeconds": 60
}
```

**Rules:**
- Timeouts, thresholds, and rules belong here, **not** in source code
- Content authors can adjust behavior without a rebuild

### 9.3 `mappings.json` — Data Mapping (Optional)

```json
{
  "item_1": "category_a",
  "item_2": "category_b"
}
```

Use this to separate content-to-logic mappings from the code, making content changes a file-swap operation.

---

## 10. Performance & Accessibility

### 10.1 Performance

- **Prefer CSS transitions over JavaScript** for simple animations
- **Use JS animation libraries (e.g., GSAP) only for complex interactions** (drag, physics, timelines)
- **Lazy-load heavy modules** (e.g., success animations, chart libraries) to avoid blocking initial render
- **Optimize images**: Use WebP/SVG, set explicit `width` and `height` attributes
- **Debounce `setHeight` and `resize`** handlers (see §2.5)

### 10.2 Accessibility

- Use **semantic HTML** (`<button>`, `<main>`, `<nav>`, `<h1>`–`<h6>`)
- All interactive elements must have a **visible focus style** via `--kw-focus-color`
- Provide `aria-label` on icons and non-text elements
- Ensure color contrast meets **WCAG 2.1 AA** (4.5:1 for text)
- Support **keyboard navigation** for all interactive elements
- Add descriptive `alt` text on all `<img>` elements

### 10.3 Z-Index Scale

To prevent stacking conflicts across overlays, modals, and layers:

| Layer                | Z-Index        |
| -------------------- | -------------- |
| Base content         | `1` – `10`     |
| Active drag element  | `100`          |
| Feedback animations  | `999` – `1000` |
| Loading overlay      | `9999`         |
| Success overlay      | `2147483647`   |

---

## 11. Advanced Iframe Interactions

Because assets run inside cross-origin iframes, the Same-Origin Policy prevents direct access to the parent window's DOM or exact pixel coordinates. However, advanced asset interactions (like pausing timers or animations when the user isn't looking) are possible using modern web APIs.

### 11.1 Checking if the Asset is Visible (`IntersectionObserver`)

Use the `IntersectionObserver` API to know exactly when your iframe enters or leaves the user's viewport (e.g., if they scrolled down far enough).

```typescript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log("Asset is currently visible on screen!");
      // Resume animations/timers
    } else {
      console.log("Asset is scrolled out of view.");
      // Pause animations/timers
    }
  });
});

// Observe the root element of your game
observer.observe(document.body); 
```

### 11.2 Checking if the Browser Tab is Active (`Page Visibility API`)

Detect if the user has switched to another browser tab or minimized the window using the Page Visibility API. This works perfectly inside cross-origin iframes.

```typescript
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    console.log("User switched to another browser tab.");
    // Pause game timer
  } else {
    console.log("User came back to this tab.");
    // Resume game timer
  }
});
```

### 11.3 Checking if the User is Interacting (`Focus`)

Determine if the iframe itself is the currently focused element (e.g., the user clicked inside the game).

```typescript
// Check current state
if (document.hasFocus()) {
  console.log("The game has user focus");
}

// Listen for changes
window.addEventListener('focus', () => {
  console.log("User clicked inside the game iframe");
});

window.addEventListener('blur', () => {
  console.log("User clicked outside the game iframe (or switched windows)");
});
```

---

## 12. Anti-Patterns to Avoid

| ❌ Anti-Pattern | ✅ Correct Approach |
| --- | --- |
| Hardcoded hex/rgb colors | Use `var(--kw-*)` or SCSS aliases |
| Hardcoded text in HTML/TS | Externalize to `labels.json` |
| Inline `{ "de": …, "en": … }` language maps in `labels.json` | One file per language (`labels.<locale>.json`), identical keys |
| `innerHTML` of a label containing an unescaped `{{placeholder}}` | Insert plain labels via `textContent`; for `*_html` labels, escape every interpolated value |
| `&shy;` entity for soft hyphens under `textContent` | CSS `hyphens: auto` first; for manual breaks use the raw U+00AD character |
| Hardcoded behavioral parameters | Externalize to `config.json` |
| Setting a fixed iframe height once | Use `setHeight` + `ResizeObserver` + `resize` listener |
| `overflow: hidden` on body with `offsetHeight` | Use `scrollHeight` or a measured container |
| Saving full DOM or large payloads to `setSuspendData` | Save minimal JSON state (≤ 4 KB for SCORM 1.2) |
| Calling `completed()` on page load | Disable `autoCompletion`, call `completed()` on win |
| CSS fallback values on `var(--kw-*)` | API provides defaults; no fallbacks needed in asset CSS |
| Importing all modules eagerly | Lazy-load heavy modules (animations, charts, etc.) |
| Ignoring `onDesignChanged` | Listen for runtime design updates, especially for canvas rendering |
| `display: flex` on an overlay that uses `[hidden]` | Author CSS overrides the UA's `[hidden] { display:none }`. Default to `display: none` and show via `:not([hidden])` or a `.visible` class (see below) |

The `[hidden]` override pattern:

```scss
// ❌ display:flex beats the browser's [hidden]{display:none}
.overlay {
  display: flex;          // always visible — [hidden] has no effect
  justify-content: center;
}

// ✅ default to hidden; show only when [hidden] is absent
.overlay {
  display: none;
  justify-content: center;

  &:not([hidden]) {
    display: flex;
  }
}
```

---

## Quick-Start Checklist for a New Asset

- [ ] Set up the project structure: `index.html`, entry script, `labels.json`, `config.json`, stylesheet
- [ ] Import and configure the API: `configure({ autoCompletion: false })`
- [ ] Set up `onInitialize` with state restoration from `suspendData`
- [ ] Implement `setHeight` with the three-layer pattern (initial + ResizeObserver on **container** + resize)
- [ ] Apply `.kw-responsive-container` on the root element
- [ ] Add responsive breakpoints at `500px`, `768px`, `1024px`
- [ ] Show a loading indicator during initialization, hide after all data is fetched
- [ ] Use the `preload-hidden` class on `<body>` to prevent FOUC
- [ ] Externalize all text → `labels.json`, all config → `config.json`
- [ ] Call `saveState()` at key interaction moments
- [ ] Call `completed()` (or `answered()`) only after the win condition is met
- [ ] Verify with a local dev server (standalone) and in Knowledgeworker Create (embedded)

---

_Last updated: 2026-05-12_
