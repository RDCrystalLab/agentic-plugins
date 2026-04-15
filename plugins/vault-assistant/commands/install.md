---
allowed-tools: Bash(mkdir:*), Bash(cp:*), Bash(test:*), Bash(ls:*), Bash(pwd:*), Bash(cat:*), Read, Write
description: 在當前目錄初始化 PARA vault 骨架，並從 plugin templates/ 複製 AGENTS.md 與 Daily / Weekly / Monthly 範本
---

## Context

- Current directory: !`pwd`
- Existing layout hint: !`ls -1 2>/dev/null | head -40`

## Your task

Bootstrap the current working directory as a **PARA-structured Obsidian vault** compatible with the `vault-assistant` subagent and its slash commands. The user has just installed this plugin and runs this command from an empty (or partially set up) vault root.

### Step 1: Safety check

1. Confirm the user intends this directory to become a vault. If the directory already contains unrelated files (e.g. source code), ask before proceeding.
2. If `AGENTS.md`, `Templates/`, or any PARA dir already exists, **do not overwrite** — report what exists and skip those items.

### Step 2: Create PARA skeleton

Create these directories if missing (use `mkdir -p`):

```
0-inbox/daily/
Projects/
Areas/infrastructure/
Areas/development/
Areas/security/
Areas/reports/Weekly/
Areas/reports/Monthly/
Areas/reports/Annual/
Resources/learning/
Resources/tools/
Resources/self-hosted/
Resources/llm-wiki/raw/
Resources/llm-wiki/wiki/
Archives/projects/
Templates/
attachments/
.github/ISSUE_TEMPLATE/
```

### Step 3: Copy templates from plugin

The plugin ships three templates and an `AGENTS.md` seed under `${CLAUDE_PLUGIN_ROOT}/templates/`. Copy them into place **only if the destination does not already exist**:

- `${CLAUDE_PLUGIN_ROOT}/templates/Daily note Template.md` → `Templates/Daily note Template.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/Weekly Report Template.md` → `Templates/Weekly Report Template.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/Monthly Report Template.md` → `Templates/Monthly Report Template.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/tag-guide.md` → `Templates/tag-guide.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/AGENTS.md.template` → `AGENTS.md`

Also copy the issue templates (for the Hub issue workflow):

- `${CLAUDE_PLUGIN_ROOT}/templates/issue-templates/decision.md` → `.github/ISSUE_TEMPLATE/decision.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/issue-templates/task.md`     → `.github/ISSUE_TEMPLATE/task.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/issue-templates/research.md` → `.github/ISSUE_TEMPLATE/research.md`
- `${CLAUDE_PLUGIN_ROOT}/templates/issue-templates/labels.md`   → `Templates/issue-templates/labels.md`  (reference doc for `gh label create` commands — not a GitHub issue template)

### Step 4: Seed `CLAUDE.md`

If `CLAUDE.md` does not exist, create it with a single line:

```
@AGENTS.md
```

This makes `AGENTS.md` load automatically as project context.

### Step 5: Placeholder replacement

In the copied `AGENTS.md`, if the user has a preferred git remote or owner name, offer to replace any `<owner>` / `<remote>` placeholders. Otherwise leave them for manual edit.

### Step 6: Report

Tell the user (≤6 lines):

- Directories created vs. already present
- Template files copied vs. skipped (with reason)
- Next steps:
  1. `git init` + first commit if this is a new repo
  2. Run `/start-day` to create today's daily note
  3. (Optional) Enable issues on the hub repo and bulk-create labels from `Templates/issue-templates/labels.md` — needed if you want the Hub issue workflow
  4. Invoke the `vault-assistant` subagent for project status, ceremony, or knowledge extraction

Do **not** auto-commit here — the user should review the skeleton first.
