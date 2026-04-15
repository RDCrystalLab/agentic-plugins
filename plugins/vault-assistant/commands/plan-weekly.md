---
allowed-tools: Bash(ls:*), Bash(date:*), Read, Write, Glob, Grep
description: 規劃下週 weekly report — 回顧本週、盤點專案、詢問想法後產出週報
---

## Context

- Today's date: !`date "+%Y-%m-%d (%A)"`
- Current ISO week number: !`date "+%V"`
- Weekly report template: !`cat "./Templates/Weekly Report Template.md" 2>/dev/null`
- Latest monthly report (Objectives): !`ls -t Areas/reports/Monthly/*.md 2>/dev/null | head -1 | xargs cat 2>/dev/null`
- Latest weekly report: !`ls -t Areas/reports/Weekly/*.md 2>/dev/null | head -1 | xargs cat 2>/dev/null`
- This week's daily notes: !`for f in $(ls -t 0-inbox/daily/*.md 2>/dev/null | head -7); do echo "===== $(basename $f) ====="; cat "$f"; echo; done`
- Active projects: !`ls -d Projects/*/ 2>/dev/null | sed 's|Projects/||;s|/||'`

## Your task

Help the user plan next week's weekly report. Follow these steps IN ORDER:

### Step 1: Review & Summarize

Analyze all the context above and present a structured summary:

1. **本週完成事項** — Extract completed items from daily notes and the latest weekly report
2. **本週未完成 / Carry Over** — Items still in progress that should carry over
3. **本月目標 進度** — Current status of each Objective from the monthly report
4. **所有進行中的專案** — List ALL projects under `Projects/`, with a brief status for each (based on recent daily notes and weekly report mentions). Highlight projects that have NOT been mentioned this week.

### Step 2: Ask the User

After presenting the summary, ask the user:

1. 下週各專案的優先級和重點是什麼？
2. 有沒有新的工作項目要加入？
3. 有沒有專案要暫停或調整方向？
4. Learned / Notes 有什麼想補充的？

**IMPORTANT: Wait for the user's response before proceeding to Step 3.**

### Step 3: Create the Weekly Report

After the user confirms, create the weekly report file:

- **File path**: `Areas/reports/Weekly/YYYY-Www.md` (next week's ISO week number)
- **Date range**: Calculate the Monday ~ Sunday of next week
- **Content**: Use the weekly report template format, populated with:
  - Objectives table copied from the current monthly report
  - In Progress / Carry Over items (from this week + user input)
  - Any planned items the user mentioned
  - Leave Completed section with placeholder items based on planned work
- **Also update the monthly report** (`Areas/reports/Monthly/YYYY-MM.md`):
  - Add the new weekly report link to the `## Weekly Reports` section
