# Operations, Security & Accessibility

> Back to [SKILL.md](../SKILL.md)

## MCP Integration for Documentation Lookup

### Lookup Strategy (Priority Order)

| Priority | Method       | Use Case                               | Notes                |
| -------- | ------------ | -------------------------------------- | -------------------- |
| 1st      | **Context7** | Quick syntax, implementation questions | Low token cost, fast |
| 2nd      | **GitHub**   | Source of truth, verification          | Higher token cost    |

Library IDs for Context7:

- `/chemmedia/knowledgeworker-embedded-asset-api`
- `/chemmedia/knowledgeworker-embedded-asset-api-ui`

---

## Accessibility Considerations

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Ensure color contrast meets WCAG 2.1 AA (4.5:1 for text)
- Provide keyboard navigation for all interactive elements
- Add `aria-` attributes where semantic HTML is insufficient
- Test with screen reader (NVDA, VoiceOver)

---

## Supply Chain Security

### Pin the GitHub Dependency

Always install with a specific tag — never a floating reference:

```bash
# ✅ Pinned (safe)
pnpm add github:chemmedia/knowledgeworker-embedded-asset-api#v4.0.0

# ❌ Floating (tracks HEAD silently)
pnpm add github:chemmedia/knowledgeworker-embedded-asset-api
```

Commit `pnpm-lock.yaml` after installing to lock the resolved SHA.

### Audit Regularly

```bash
pnpm audit
pnpm audit --audit-level=high  # CI: fail on high-severity issues
```

### Freeze in CI

```bash
pnpm install --frozen-lockfile
```

### Before Updating the API Version

1. Check tags at `https://github.com/chemmedia/knowledgeworker-embedded-asset-api/tags`
2. Review the diff between old and new tag
3. Update the **Verified** note in `SKILL.md`

### Minimize Attack Surface

- Remove unused deps: `pnpm prune`
- Keep build tools in `devDependencies` — they must never reach `dist/`
- Review `postinstall` scripts before adding any new dependency
