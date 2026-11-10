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

### Install the verified prebuilt API release

```bash
pnpm add -E knowledgeworker-embedded-asset-api@4.1.0
```

Use the official npm release rather than a Git dependency. Its JavaScript and
all type declarations were verified byte-for-byte identical to a build of
GitHub commit `2cd242908418902f4534ab3d0356df5da2a7c69f` (tag `v.4.1.0`).
The npm tarball's SHA-512 integrity was verified. It contains compiled `dist/`
files and no install/prepare lifecycle scripts, so consumers do not install
or execute the upstream build toolchain with its 42 audit findings.
Commit `pnpm-lock.yaml` and use frozen installs to preserve package integrity.
A future release must be checked again; these findings are not an upstream fix.

### 2. Audit npm Dependencies Regularly

```bash
# Check for known vulnerabilities
pnpm audit

# Fail the build on all reported vulnerability severities (use in CI)
pnpm audit --audit-level=low
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
- **Keep build tools in `devDependencies`**: `yazl` and similar tools must never reach the production `dist/`
- **Review `postinstall` scripts**: Before adding any new dependency, check its `package.json` for lifecycle scripts that execute arbitrary code at install time

## Mandatory dependency review at every setup or refresh

The agent MUST run these checks for every new asset setup and dependency refresh,
including existing projects and the optional multi-game workflow:

```bash
pnpm install --frozen-lockfile
pnpm audit --audit-level=low
pnpm outdated
```

Check production, development, optional and transitive dependencies; do not use
`--prod` to hide build-tool findings. `pnpm outdated` can return nonzero when
updates are available; inspect its output separately from actual command errors.
Also inspect install output for deprecated packages, unsupported Node versions,
peer conflicts and newly requested lifecycle scripts.

When updates are available or audit reports a vulnerable package, review the
release notes and compatibility, then apply a suitable update with `pnpm update`.
The baseline uses exact pins: `pnpm update` alone will not move those pins;
use `pnpm update <package>@<reviewed-version> --save-exact` for a selected upgrade,
or update the direct parent of a vulnerable transitive dependency. Do not use
blanket `--latest`, `--force`, ignored advisories or weakened security checks.
Validate major upgrades and replacement packages deliberately.

After EACH dependency update, rerun `pnpm audit --audit-level=low`,
`pnpm run build`, verify ZIP contents/integrity, and exercise the asset in a browser
(or existing meaningful tests). Check API compatibility and asset-type behavior.
Review and retain both package.json and pnpm-lock.yaml changes. Refresh the
shared baseline templates only after equivalent validation and mirror both
`.claude/` and `.agent/` copies.

Report the commands run, old/new versions, findings and resolution. For any
unresolved vulnerability or compatibility/deprecation issue, state the package,
dependency path, severity/reason, impact and next action. A failed or unavailable
audit is not a clean audit. Do not declare the setup security-clean while known
findings remain. No passing audit guarantees absence of undiscovered flaws.
