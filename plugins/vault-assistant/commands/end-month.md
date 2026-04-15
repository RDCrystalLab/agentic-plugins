---
allowed-tools: Bash(date:*), Bash(ls:*), Read, Write, Edit, Glob, Grep
description: Monthly rollup — 彙整 weekly 進月報、評估 Objectives 完成狀態、建立下月 skeleton
---

## Context

- Today's date: !`date "+%Y-%m-%d"`
- Current month key: !`date "+%Y-%m"`
- Next month key: !`date -d "+1 month" "+%Y-%m" 2>/dev/null || date -v+1m "+%Y-%m"`
- Current monthly report: !`f="Areas/reports/Monthly/$(date +%Y-%m).md"; [ -f "$f" ] && cat "$f" || echo "(not found)"`
- Current month's weekly reports: !`ym=$(date +%Y-%m); for f in $(ls -1 Areas/reports/Weekly/${ym:0:4}-W*.md 2>/dev/null); do echo "===== $(basename $f) ====="; cat "$f"; echo; done`
- Monthly report template: !`cat "Templates/Monthly Report Template.md" 2>/dev/null`
- Next month skeleton exists: !`nm=$(date -d "+1 month" "+%Y-%m" 2>/dev/null || date -v+1m "+%Y-%m"); f="Areas/reports/Monthly/$nm.md"; [ -f "$f" ] && echo "yes" || echo "no"`

## Your task

Close out the current month: aggregate weeklies into the monthly report, evaluate Objectives completion, then create next month's skeleton.

### Step 1: Aggregate Key Achievements

Scan each weekly report in the current month:
- Collect items from `## Completed` sections
- Collect notable Objective movements from `## Objectives Review` (if present)
- Group by theme/project, not by week

Write into the monthly report's `## Key Achievements` section, replacing the placeholder. Format:

```markdown
## Key Achievements

### <Theme / Project>
- <achievement — concrete outcome, not a task description>
```

### Step 2: Aggregate Issues / Blockers

Collect from weekly reports' `## In Progress / Carry Over` items that persisted across multiple weeks, and any `## Notes` entries flagging friction. Write to `## Issues / Blockers`.

### Step 3: Aggregate Learned

Merge `## Learned` sections from all weekly reports. Deduplicate similar insights. Write to monthly `## Learned`.

### Step 4: Update Weekly Reports link section

Ensure `## Weekly Reports` lists all weeklies from the current month, with dates:

```markdown
## Weekly Reports

- [[2026-W14|W14 (03/30 ~ 04/05)]]
- [[2026-W15|W15 (04/06 ~ 04/12)]]
```

Use shortest wikilink format (no path prefix) per Quartz compatibility rule from AGENTS.md.

### Step 5: Present Objectives status review to user

For each Objective row in the monthly report, present the user with:
- Original goal
- This month's actual movement (summarized from weekly Objectives reviews + Objectives progress log)
- Suggested final status: ✅ Complete / 🔄 Carry to next month / ⏸️ Paused / ❌ Dropped

**IMPORTANT: Ask the user to confirm or adjust each Objectives status before continuing.** Also ask:

1. 本月有什麼新的 Objectives 項目要加進下月？
2. 有哪些 Objectives 要正式結案或擱置？
3. 下月主軸是什麼（給下月 Key Focus 做參考）？

**Wait for the user's response before proceeding to Step 6.**

### Step 6: Finalize current monthly report

Update each Objective row's Status column based on user decision. Add a `## Month Close` section at the bottom:

```markdown
## Month Close

- **結案日期**: YYYY-MM-DD
- **完成目標**: <count>
- **延續目標**: <count>
- **下月主軸**: <one-line focus>
```

### Step 7: Create next month's skeleton

Create `Areas/reports/Monthly/YYYY-MM.md` (next month) from `Templates/Monthly Report Template.md` with:

1. Title: `Monthly Report - YYYY-MM (Iteration YYMM)`
2. Objectives table pre-filled with:
   - All 🔄 Carry items from current month (status reset to `🔄 In Progress`)
   - New Objectives the user specified
3. Empty Weekly Reports, Key Achievements, Issues, Learned, Notes

### Step 8: Report

Tell the user:
- Number of Key Achievements rolled up
- Final Objectives status breakdown (✅ / 🔄 / ⏸️ / ❌)
- Next month's skeleton location
- Remind them to also run `/sync-projects` to update `Projects/index.md`

Keep it under 6 lines.
