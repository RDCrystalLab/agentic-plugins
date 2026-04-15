---
allowed-tools: Bash(date:*), Bash(ls:*), Read, Write, Edit, Glob, Grep
description: 跑 weekly retrospective，把本週 daily 內容聚合進 weekly report
---

## Context

- Today's date: !`date "+%Y-%m-%d (%A)"`
- Current ISO week number: !`date "+%V"`
- Current week range (Mon~Sun): !`d=$(date +%u); mon=$(date -d "-$((d-1)) days" +%Y-%m-%d 2>/dev/null || date -v-$((d-1))d +%Y-%m-%d); sun=$(date -d "-$((d-1)) days +6 days" +%Y-%m-%d 2>/dev/null || date -v-$((d-1))d -v+6d +%Y-%m-%d); echo "$mon ~ $sun"`
- Current weekly report: !`w=$(date +%V); y=$(date +%Y); f="Areas/reports/Weekly/${y}-W${w}.md"; [ -f "$f" ] && cat "$f" || echo "(not found — create from Templates/Weekly Report Template.md)"`
- This week's daily notes: !`d=$(date +%u); mon_date=$(date -d "-$((d-1)) days" +%s 2>/dev/null || date -v-$((d-1))d +%s); for i in 0 1 2 3 4 5 6; do day=$(date -d "@$((mon_date + i*86400))" +%Y-%m-%d 2>/dev/null || date -r $((mon_date + i*86400)) +%Y-%m-%d); f="0-inbox/daily/$day.md"; echo "===== $day ====="; [ -f "$f" ] && cat "$f" || echo "(none)"; echo; done`
- Current monthly report: !`f="Areas/reports/Monthly/$(date +%Y-%m).md"; [ -f "$f" ] && cat "$f" || echo "(not found)"`

## Your task

Close out the current week: aggregate daily notes into the weekly report, run retrospective, prompt user for reflections, commit results.

### Step 1: Ensure current week's weekly report exists

If `Areas/reports/Weekly/YYYY-Www.md` does not exist, create it from `Templates/Weekly Report Template.md` with:
- Title filled: `Weekly Report - YYYY Www (MM/DD ~ MM/DD)` using the Monday~Sunday of the current ISO week
- Objectives table copied from the current monthly report (file 4)

### Step 2: Aggregate Completed section

Scan each of this week's daily notes:
- Collect all `✅ 完成` / `Completed` entries from end-of-day summaries
- Collect all `[x]` items from `# Tasks` and `# 進行中的任務`
- Collect key entries from `# Logs` that represent completed work (commits, PRs merged, deployments, decisions)

Group by repo/project. Write into the weekly report's `## Completed` section, replacing the placeholder `-`.

Format:
```markdown
## Completed

### <Project / Repo>
- <bullet with date prefix when useful>
```

### Step 3: Rebuild In Progress / Carry Over section

From today's (or latest this week's) daily note:
- Collect unchecked `[ ]` items from `# 進行中的任務` and `# Tasks`
- Merge with any existing carry-overs in the weekly report
- Group by project

Replace the `## In Progress / Carry Over` section with the merged, deduplicated list.

### Step 4: Objectives status review

For each Objective row in the weekly report's `## Objectives` table:
- Read the corresponding Objectives progress log entries from the monthly report (the section `/end-day` maintains)
- Summarize this week's movement in one line
- Append to a new `## Objectives Review` section in the weekly report:

```markdown
## Objectives Review

- **<Objective name>**: <this week's movement — what was done, what's blocked, overall direction>
```

Do NOT modify the monthly Objective Status column — that is a `/end-month` decision.

### Step 5: Ask the user for retrospective input

Before writing `## Learned` and `## Notes`, ask the user:

1. 本週學到什麼？有什麼重要決策？
2. 有哪些 blocker / friction 想記下來？
3. 下週要調整什麼做法？

**IMPORTANT: Wait for the user's response before proceeding to Step 6.**

### Step 6: Write Learned & Notes

Populate `## Learned` and `## Notes` sections based on user input. Keep bullet points concise.

### Step 7: Report

Tell the user:
- Number of completed items aggregated
- Number of carry-overs for next week
- Objective movement summary
- Remind them to run `/plan-weekly` to plan next week

Keep it under 6 lines.
