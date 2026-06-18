# Knowledgeworker HTML5 Asset Playbook

**Version**: 1.0.0
**Stack**: `Vite` + `Vanilla JS` + `Knowledgeworker API`

## 🚀 Getting Started

This repository is your starting point for building production-ready Knowledgeworker HTML5 embedded assets.

### 1. Initialize Your Project

Create a new folder for your asset and pull the playbook files:

```bash
# 1. Create directory
mkdir my-new-asset
cd my-new-asset

# 2. Pull the playbook (clone this repo)
git clone https://code.chemmedia.de/scm/ea/kw-asset-playbook.git .

# 3. Clean up (remove .git history to start fresh)
rm -rf .git
git init
```

### 2. Implementation

Pick the path for your tool. Each tool carries its own self-contained copy of the templates
and reference docs (so the Claude skill stays portable) — only the entry point differs.

#### Option A: Claude Code (Recommended)

**A1. Use it inside this repo**

1. Open this repo in Claude Code (the `.claude/` folder is auto-detected).
2. Type `/kw-asset-setup` — optionally with a type, e.g. `/kw-asset-setup advanced-question`.
3. Claude scaffolds the project, copying templates verbatim from the skill's `resources/`.

**A2. Install it globally** (so `/kw-asset-setup` works in *every* project — no clone needed)

The Claude skill is self-contained, so just copy it into your user config:

```powershell
# Windows (PowerShell)
Copy-Item -Recurse -Force ".\.claude\skills\knowledgeworker-asset-setup" "$env:USERPROFILE\.claude\skills\"
Copy-Item -Force ".\.claude\commands\kw-asset-setup.md" "$env:USERPROFILE\.claude\commands\"
```

```bash
# macOS / Linux
cp -r ./.claude/skills/knowledgeworker-asset-setup ~/.claude/skills/
cp    ./.claude/commands/kw-asset-setup.md          ~/.claude/commands/
```

Restart Claude Code (or run `/reload-skills`) to pick it up. The global copy is a **fork** —
re-run the copy after you update the skill in this repo to keep it in sync.

> The **command** (`/kw-asset-setup`) orchestrates the steps; the **skill**
> (`knowledgeworker-asset-setup`) supplies the rules and references and auto-loads when relevant.

#### Option B: Antigravity (Automated)

If you are using the Antigravity agent:

1. Ensure the `.agent` folder is present in your workspace.
2. Type `/kw-asset-setup-workflow` in the chat.
3. The agent will scaffold the project, install dependencies, and configure the foundation automatically.

> **Note on Agent Automation**: The automation is driven by an interconnected **Workflow** and **Skill**.
>
> - The **Workflow** (`/kw-asset-setup-workflow`) acts as the high-level step-by-step orchestrator.
> - The **Skill** (`knowledgeworker_asset_setup`) provides the deep technical knowledge, code templates, and configuration rules that the workflow applies during execution.

#### Option C: Manual (The Playbook)

Follow the step-by-step expert guide to set up the foundation manually:
👉 **[Playbooks/KW_ASSET_SETUP.md](./Playbooks/KW_ASSET_SETUP.md)**

### 3. Next Steps

Once the foundation is set up (server running at `http://localhost:8080`), proceed with:
👉 **[NEXT_STEPS.md](./NEXT_STEPS.md)** — A beginner-friendly guide to building your first asset.

## 📂 Repository Structure

**Tool packages — each is self-contained (its own templates + docs):**

- **`.claude/`** — Claude Code. `/kw-asset-setup` command + `knowledgeworker-asset-setup` skill
  (`resources/` templates + `docs/`). Self-contained → globally installable (see Option A2).
- **`.agent/`** — Antigravity. `/kw-asset-setup-workflow` + `knowledgeworker_asset_setup` skill
  with its own `resources/` + `docs/`.
- **`Playbooks/`** — manual path. `KW_ASSET_SETUP.md` (rules + copy-checklist) and
  `KW_ASSET_TYPES.md` (asset-type deep dive: diagrams, handler/action tables, capability matrix).

**Shared templates & docs (carried inside each skill's `resources/` and `docs/`):**

- Templates: `index.html`, `style.css`, `main.{medium,question,advanced-question}.js`,
  `main-with-fallback.js`, `vite.config.js`, `build-zip.js`, `config/labels/mapping.json`.
- Docs: `api-reference`, `design-tokens`, `best-practices`, `operations`, `multi-game-architecture`.

**Guides:**

- **`NEXT_STEPS.md`** — beginner guide for building your first asset after setup.

> [!IMPORTANT]
> **Keeping copies in sync.** The `.claude/` and `.agent/` skills carry **parallel copies** of
> the templates and docs (intentional — it keeps the Claude skill portable). When you change a
> template or doc in one, mirror the change to the other so the tools don't drift.

---

> **Note**: Always check `Playbooks/KW_ASSET_SETUP.md` for the latest API version and security practices before starting.
