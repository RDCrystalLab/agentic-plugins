---
name: skill-scout
description: >
  Discover, evaluate, and port skills from external repos into a plugin marketplace.
  Use when the user says "read this repo", "browse these skills", "port this over",
  "add this skill", mentions a ~/workspaces/ path, a GitHub skills repo URL,
  or wants to evaluate whether external skills are worth importing.
---

# Skill Scout — Discover, Evaluate, and Port Skills

Turn external skill repos into well-structured plugins for a marketplace. This is an interactive,
conversational workflow — not a mechanical copy. The goal is to understand what's in the source,
discuss with the user what's worth keeping, and produce polished plugins that fit the target repo's
conventions.

## When to use

- User points you at a local path or GitHub URL containing skills
- User says "read ~/workspaces/something" or "check out this repo"
- User wants to evaluate whether skills from another repo are useful
- User wants to port/migrate/import skills into their plugin marketplace

## Phase 1: Discover

Explore the source repo to understand what's available.

1. **Resolve the source** — local path (use directly) or GitHub URL (clone to `/tmp/skill-scout-import/`).
2. **Scan for skills** — find all `SKILL.md` files recursively. Also look for `plugin.json`, `hooks/`, `commands/`, `agents/`, `scripts/`, `references/` to understand the full scope.
3. **Present an overview** — show the user a summary table:

| Skill | Description | Components |
|-------|-------------|------------|
| name  | from frontmatter | skills, hooks, scripts, references |

Include a brief assessment: how many skills, what categories they cover, how complex they are (single SKILL.md vs. full plugin with hooks/scripts).

**Do NOT proceed to porting yet.** Wait for the user to tell you which skills interest them.

## Phase 2: Evaluate

Once the user indicates interest in specific skills, read them thoroughly.

1. **Read the full SKILL.md** and all references/scripts for each selected skill.
2. **Present a detailed summary** for each — what it does, how it works, dependencies, any concerns.
3. **Flag issues proactively:**
   - Personal/hardcoded references (e.g., `~/.max/.env`, "when Burke asks") that need generalizing
   - Platform-specific assumptions (e.g., Codex-only features) that need adapting
   - Overlaps with existing plugins in the target repo
   - Heavy dependencies or large file counts
4. **Suggest grouping** — if multiple skills from the same source are related, recommend merging them into one plugin. Explain the trade-off (single install vs. granularity).

**Wait for the user's decision** on what to port and how to structure it.

## Phase 3: Adapt and Port

Execute the porting based on the user's decisions.

### 3a. Structural conventions

Every plugin MUST have this structure:

```
plugins/<plugin-name>/
  plugin.json                    ← VS Code Copilot format (root)
  .claude-plugin/
    plugin.json                  ← Claude Code format
  README.md                      ← 繁體中文
  skills/
    <skill-name>/
      SKILL.md
      references/                ← optional
      scripts/                   ← optional
  hooks/                         ← optional
  commands/                      ← optional
  agents/                        ← optional
```

### 3b. Dual-format plugin.json

**Claude Code** (`.claude-plugin/plugin.json`) — metadata + hooks config if applicable:

```json
{
  "name": "<plugin-name>",
  "version": "1.0.0",
  "description": "<繁體中文 description>",
  "author": { "name": "<original author>", "url": "<original repo>" },
  "repository": "<original repo URL>",
  "license": "MIT",
  "keywords": [...]
}
```

**VS Code Copilot** (`plugin.json` at root) — same fields plus component pointers:

```json
{
  ...same as above...,
  "skills": "./skills/",
  "hooks": "./hooks/"
}
```

### 3c. Adaptations to apply

- **Generalize personal references** — replace hardcoded user names, paths, env file locations with standard patterns
- **Platform-neutral language** — replace "Codex" with "agent", keep the skill usable across Claude Code, Cursor, Windsurf, etc.
- **Python preference** — if the source uses `python3` or `pip install`, prefer `uv run` / `uv single-file` patterns where appropriate
- **README in 繁體中文** — write the README in Traditional Chinese, noting the original author and source
- **Preserve original author attribution** — always credit the original author in plugin.json and README

### 3d. Register

Update these files in the target repo:

1. **`.claude-plugin/marketplace.json`** — add plugin entry to `plugins` array
2. **`AGENTS.md`** — add row to plugins table
3. **`README.md`** — add row to plugin list table

### 3e. Verify

- List the final directory structure
- Confirm all required files exist
- Confirm marketplace.json is valid JSON
- If the plugin has scripts, test they can execute (`--help` or basic import)

## Phase 4: Report

Summarize what was done:

- Plugin(s) created with structure overview
- Source attribution
- Adaptations made (generalized references, merged skills, etc.)
- How to use (slash commands)
- Any manual steps needed (API keys, tool installation)

## Guidelines

- **Always read before porting** — never copy blindly. Understand the skill's purpose and quality.
- **Discussion first, action second** — present findings, wait for user input, then execute.
- **Merge related skills** — if 3 skills from the same author form a pipeline, suggest combining into one plugin with multiple skills.
- **Don't port everything** — it's OK to recommend against porting if a skill is low quality, too niche, or already covered by existing plugins.
- **Check for overlap** — before porting, check if the target repo already has a plugin covering the same functionality.
- **Minimal diff** — don't rewrite skill content unnecessarily. Keep the original author's voice and structure; only change what needs adapting.
