---
allowed-tools: Bash(date:*), Bash(ls:*), Bash(git:*), Bash(cat:*), Read, Edit
description: 更新某專案 index.md 的狀態表、最後更新日，並 commit + push
---

## Context

- Today's date: !`date "+%Y-%m-%d"`
- Arguments: $ARGUMENTS
- Project slug guess: !`echo "$ARGUMENTS" | awk '{print $1}'`
- Target index: !`p=$(echo "$ARGUMENTS" | awk '{print $1}'); f="Projects/$p/index.md"; [ -f "$f" ] && echo "found: $f" || echo "MISSING: $f"`
- Current index content: !`p=$(echo "$ARGUMENTS" | awk '{print $1}'); cat "Projects/$p/index.md" 2>/dev/null || echo "(file not found)"`
- Git status: !`git status --short`

## Your task

Update a project's `index.md` status table and "last updated" metadata based on the change the user describes in the prompt body.

**Argument shape**: `$ARGUMENTS` is `<project-slug> [optional free-text describing the change]`. The project slug is the directory name under `Projects/` (e.g. `aml`, `agentic-plugins`).

### Step 1: Locate and parse
1. Verify `Projects/<slug>/index.md` exists. If not, tell the user and stop.
2. Read the file and identify the status table (usually under a `## 📌 當前狀態` / `## Current State` / `## Status` heading with a markdown table). If there is no such table, tell the user and stop — do not invent one.

### Step 2: Apply the change
1. Parse what the user wants updated from the rest of `$ARGUMENTS` and any follow-up context in the conversation. Examples:
   - "Phase 3 done" → find the Phase 3 row, mark ✅
   - "Blocker added: PowerFlex capacity confirmation" → add a new row with ⚠️ status
   - "Migration plan 10% → 30%" → update a progress percentage
2. Make the minimal Edit to the relevant row(s). Do not rewrite unrelated content.
3. Update the "最後更新" / "Last updated" date field at the top or bottom of the file to `$(date +%Y-%m-%d)`.

### Step 3: Commit ceremony
Run in parallel (per AGENTS.md git workflow):
- `git add Projects/<slug>/index.md`
- `git commit -m "docs(<slug>): update index status — <one-line summary of the change>"` with the Co-Authored-By trailer
- `git push origin main`

Then `git status` to confirm clean.

### Step 4: Report
One or two sentences: which row changed, what it's now set to, commit SHA.

## Rules

- Never touch sections other than the status table and the last-updated field unless the user explicitly asks.
- If ambiguous which row matches the user's request, ask before editing.
- If the user's change implies the project is done or archiving, **stop and recommend** `/archive-project-doc` instead of marking everything ✅.
- Use conventional commit format `docs(<slug>): ...`; never `chore` or `update`.
