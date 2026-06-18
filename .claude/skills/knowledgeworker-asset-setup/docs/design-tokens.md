# Design Tokens & CSS Classes

> Back to [SKILL.md](../SKILL.md)

## Design Tokens

Design tokens are **automatically applied as CSS variables** by the API. You do NOT need to manually apply them.

Available CSS variables (use in your CSS):

```css
--kw-text-color
--kw-headline-color
--kw-action-color
--kw-action-text-color
--kw-action-hover-color
--kw-action-disabled-color
--kw-background-color
--kw-feedback-positive-color
--kw-feedback-partial-positive-color
--kw-feedback-negative-color
--kw-feedback-solution-color
--kw-focus-color
--kw-text-font-size
--kw-text-font-family
--kw-headline-font-family
--kw-headline-font-weight
--kw-button-border-radius
```

For development/preview outside KnowledgeWorker, fallback values are provided automatically.

---

## Official KnowledgeWorker CSS Classes

Use these classes for consistent styling within the KnowledgeWorker environment.

### Buttons

- `kw-button-primary` — `<button class="kw-button-primary">...</button>`
- `kw-button-secondary` — `<button class="kw-button-secondary">...</button>`

Interactive elements support the `disabled` attribute:

```html
<button class="kw-button-primary" disabled>Disabled</button>
```

### Typography

- `kw-headline2` through `kw-headline6` — `<h2 class="kw-headline2">...</h2>`
- `kw-paragraph` — `<p class="kw-paragraph">...</p>`
- `kw-link` — `<a class="kw-link">...</a>` (also supports `disabled` attribute)
