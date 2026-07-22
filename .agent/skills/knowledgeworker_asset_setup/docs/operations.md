# Operations, Security & Accessibility

> Back to [kw-asset-skill.md](../kw-asset-skill.md)

## MCP Integration for Documentation Lookup

Use MCP servers for efficient API documentation queries during development.

### Lookup Strategy (Priority Order)

| Priority | Method            | Use Case                                  | Notes                |
| -------- | ----------------- | ----------------------------------------- | -------------------- |
| 1st      | **Context7**      | Quick syntax, implementation questions    | Low token cost, fast |
| 2nd      | **GitHub**        | Source of truth, verification, edge cases | Higher token cost    |
| 3rd      | **This Document** | Offline reference, quick local lookup     | `kw-asset-skill.md`  |

> [!IMPORTANT]
> **GitHub is the single source of truth.** Use Context7 first for efficiency and token savings. Fall back to GitHub for verification. Use this document (`kw-asset-skill.md`) when all else fails.

### Context7 Queries (Use First)

Library IDs:

- `/chemmedia/knowledgeworker-embedded-asset-api`
- `/chemmedia/knowledgeworker-embedded-asset-api-ui`

Example queries:

- "How do I use setSuspendData?"
- "What handlers are available for question assets?"
- "Show me the Design interface"

### GitHub Fallback (Source of Truth)

Use when Context7 lacks specific info or for verification:

- Fetch README: `mcp_github_get_file_contents` for `chemmedia/knowledgeworker-embedded-asset-api`
- Check examples: `chemmedia/knowledgeworker-embedded-asset-api-example`

### MCP Server Configuration

```json
{
  "mcpServers": {
    "context7": {
      "serverUrl": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": ""
      }
    },
    "github": {
      "serverUrl": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": ""
      }
    }
  }
}
```

---

## Accessibility Considerations

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- Ensure color contrast meets WCAG 2.1 AA (4.5:1 for text)
- Provide keyboard navigation for all interactive elements
- Add `aria-` attributes where semantic HTML is insufficient
- Test with screen reader (NVDA, VoiceOver)

---

## Supply Chain Security

This project installs a dependency directly from GitHub (`github:chemmedia/knowledgeworker-embedded-asset-api`), which bypasses the npm registry's integrity verification. Apply the following practices to reduce supply chain risk.

### 1. Pin the GitHub Dependency to a Specific Tag or Commit SHA

Never install from a floating reference (no `#ref` = tracks `HEAD`, which can change silently). Always pin to an **immutable tag** or **commit SHA**:

```bash
# ✅ Pin to a specific tag (preferred)
pnpm add github:chemmedia/knowledgeworker-embedded-asset-api#v.4.1.0

# ✅ Pin to a specific commit SHA (most secure — tags can be force-pushed)
# NOTE: 4.1.0's tag is mistyped upstream as `v.4.1.0`; the SHA below is the robust alternative.
pnpm add github:chemmedia/knowledgeworker-embedded-asset-api#2cd242908418902f4534ab3d0356df5da2a7c69f

# ❌ Avoid — resolves to HEAD of default branch at install time
pnpm add github:chemmedia/knowledgeworker-embedded-asset-api
```

After pinning, **commit `pnpm-lock.yaml`** to version control. This locks the resolved SHA for all future installs.

### 2. Audit npm Dependencies Regularly

```bash
# Check for known vulnerabilities
pnpm audit

# Fail the build on high-severity issues (use in CI)
pnpm audit --audit-level=high
```

### 3. Freeze Dependencies in CI (Lockfile Enforcement)

Use `--frozen-lockfile` in CI pipelines to prevent silent dependency upgrades:

```bash
pnpm install --frozen-lockfile
```

This ensures CI always installs the exact versions committed in `pnpm-lock.yaml`.

### 4. Verify the GitHub Package Before Updating

Before bumping the API version:

1. Check the tag on GitHub: `https://github.com/chemmedia/knowledgeworker-embedded-asset-api/tags`
2. Review the diff between the previous and new tag
3. Confirm the tag points to the expected commit (tags can be force-pushed)
4. Update the **Verified** note in the [MANDATORY PRE-CHECK](../kw-asset-skill.md) at the top of the skill document

### 5. Minimize Attack Surface

- **Remove unused dependencies**: `pnpm prune`
- **Keep build tools in `devDependencies`**: `archiver` and similar tools must never reach the production `dist/`
- **Review `postinstall` scripts**: Before adding any new dependency, check its `package.json` for lifecycle scripts that execute arbitrary code at install time
