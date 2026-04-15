---
allowed-tools: Bash(date:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(git status:*), Bash(git diff:*), Read, Edit
description: 產出今日 end-of-day summary，更新 daily note 並同步 Objectives 進度到 monthly report
---

## Context

- Today's date: !`date "+%Y-%m-%d (%A)"`
- Current month key: !`date "+%Y-%m"`
- Today's daily note: !`f="0-inbox/daily/$(date +%Y-%m-%d).md"; [ -f "$f" ] && cat "$f" || echo "(not found — run /start-day first)"`
- Current monthly report: !`f="Areas/reports/Monthly/$(date +%Y-%m).md"; [ -f "$f" ] && cat "$f" || echo "(not found)"`

## Your task

Generate an end-of-day summary, write it into today's daily note, and propagate Objectives progress into the monthly report.

### Step 1: Produce today's summary

Output a concise summary in Traditional Chinese (~250 words), structured as:

```markdown
## 今日總結 — YYYY-MM-DD

**✅ 完成**
<completed tasks and commits from today's Logs section, grouped by repo/project>

**🔄 進行中 / 明日接續**
<unfinished tasks: any unchecked [ ] items in # Tasks or # 進行中的任務>

**💡 Learned / 備忘**
<any TIL or notable decisions made today — infer from Logs and Ideas sections>

**📊 本月目標進度**
<ONE LINE per Objective from the monthly report (file 2). Format: "<Objective name>: <one-line today status>". Do NOT use the 本月目標追蹤 table in the daily note — it may be stale, read from the monthly report directly.>
```

Focus on facts, not commentary. If a section is empty, write `- 無` rather than deleting the header.

### Step 2: Reconcile `# Tasks` checkboxes

Read today's `# Tasks` section (the "今天最重要的三件事" top-3 list). For each item, judge from today's Logs and 今日總結 whether it was completed, partially done, or not touched, and update the checkbox:

- **完成** → `[x]` + append ` ✅ YYYY-MM-DD`
- **部分完成** → keep `[ ]` and append ` — 部分完成：<一句話備註>，延至 YYYY-MM-DD`
- **完全未動** → `[>]` + append ` — 延至 YYYY-MM-DD`（tomorrow's date）

Do **not** rewrite or reorder the task text — only toggle the checkbox marker and append the status suffix after the existing line.

Also lightly review `# 進行中的任務`: if any item was meaningfully advanced today (e.g. reached a milestone), you may append a short suffix like ` — <milestone> ✅ YYYY-MM-DD` to that line, but do not change its `#status/*` tag or remove it. Leave untouched items alone.

Rationale: without this step, the daily note's top-3 stays as `[ ]` forever, becoming a misleading artifact. The "🔄 進行中 / 明日接續" section in the summary lists carry-overs in narrative form, but the checkbox region is the authoritative snapshot for that day's plan-vs-actual.

### Step 3: Write summary into daily note

Append the summary to today's daily note at the bottom (after the existing content). Do not overwrite existing sections.

### Step 4: Propagate Objectives progress to monthly report

For each Objective row in the monthly report table, if today's summary produced a meaningful status update for it, append a dated progress log entry to the monthly report. Use this pattern:

- If the monthly report already has a `## Objectives Progress Log` section, append a new entry there
- If not, create the section right after the `## Objectives` table

Entry format:

```markdown
## Objectives Progress Log

### YYYY-MM-DD
- **<Objective name>**: <one-line status from today's summary>
```

**Do NOT modify the Objective Status column directly** — that is a monthly-level decision, not daily. Only append to the progress log.

Deduplicate: if there is already an entry for today, update that entry rather than appending a second one.

### Step 5: Update 本月目標追蹤 table in daily note

Fill the `今日計畫` column's corresponding `昨日進度` cell if it was empty, so tomorrow's `/start-day` has something to carry over. Keep the rest of the table as-is.

### Step 6: Commit + push

Per AGENTS.md, any vault write must auto `git add` + `commit` + `push`. Stage the modified daily note and monthly report, commit with `chore(daily): end-of-day YYYY-MM-DD + monthly objectives progress`, push to `main`. Do not ask the user first.

### Step 7: Report

Tell the user:
- Number of completed items
- Number of carry-over tasks for tomorrow
- Whether monthly objectives progress log was updated
- Any notable Learned items

Keep it under 5 lines.
