---
allowed-tools: Bash(date:*), Bash(ls:*), Read, Edit, Glob, Grep
description: 從最新 weekly / monthly 反推同步 Projects/index.md 的「當前重點」與時間戳
---

## Context

- Today's date: !`date "+%Y-%m-%d"`
- Projects index: !`cat Projects/index.md 2>/dev/null`
- Latest weekly report: !`ls -1t Areas/reports/Weekly/*.md 2>/dev/null | head -1 | xargs cat 2>/dev/null`
- Current monthly report: !`f="Areas/reports/Monthly/$(date +%Y-%m).md"; [ -f "$f" ] && cat "$f" || echo "(not found)"`
- Active project directories: !`ls -1d Projects/*/ 2>/dev/null | sed 's|Projects/||;s|/||'`

## Your task

Reconcile `Projects/index.md` with the actual current state inferred from weekly / monthly reports. Typical symptom: project "當前重點" listed in index is stale (e.g. still listing items that have been ✅ complete for weeks).

### Step 1: Detect stale entries

For each project under `🔥 主要工作項目` and `🧪 Side Projects` in `Projects/index.md`:

1. Read the project's entry — specifically `當前重點` and `狀態`
2. Cross-reference against:
   - Latest weekly's `## Objectives` and `## In Progress / Carry Over`
   - Current monthly's `## Objectives` rows and status
   - Any `Objectives Progress Log` entries in the monthly report
3. Flag entries where:
   - `當前重點` lists items that are ✅ complete per monthly Objective Status
   - `當前重點` is missing new items that are 🔄 In Progress or 🆕 New in monthly objectives
   - `狀態` disagrees with recent weekly activity (e.g. index says 🟢 進行中 but weekly shows no mention for 3+ weeks)

### Step 2: Present diff

Show the user a diff-style table per flagged project:

```
### <project name>

當前重點（現在）:
- <stale item>

當前重點（建議）:
- <new item from monthly objectives>
- <new item from weekly carry-over>

來源:
- 2026-04 月報 Objectives: <quote>
- 2026-W15 weekly: <quote>
```

Also check 最後更新 timestamp at top of `Projects/index.md`. If older than 2 weeks, flag it.

Also check `最近更新` log section and propose a new entry summarizing the sync.

### Step 3: Ask for confirmation

**IMPORTANT: Wait for user confirmation before writing.** Ask:

1. 以上建議哪些要採納？
2. 有沒有要補充的專案狀態變化？

### Step 4: Write updates

For each confirmed change, edit `Projects/index.md`:
- Replace 當前重點 bullets
- Adjust 狀態 emoji if needed
- Prepend a new line to `## 🔄 最近更新`:
  `- **YYYY-MM-DD**: <project> — <one-line summary of what changed>`
- Update `> 最後更新：YYYY-MM-DD` at the top
- Recalculate `## 📊 專案統計` counts if status changed

### Step 5: Report

Tell the user:
- Number of projects synced
- Number of stale entries removed
- New last-updated date

Keep it under 5 lines.
