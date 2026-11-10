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

### Audit Regularly

```bash
pnpm audit
pnpm audit --audit-level=low  # CI: fail on all reported vulnerability severities
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
