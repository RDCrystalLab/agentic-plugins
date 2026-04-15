---
allowed-tools: Bash(date:*), Bash(ls:*), Bash(gh:*), Read, Write, Edit
description: 建立今日 daily note（若不存在）並產出 morning briefing
---

## Context

- Today's date: !`date "+%Y-%m-%d (%A)"`
- Today's ISO week: !`date "+%Y-W%V"`
- Current month key: !`date "+%Y-%m"`
- Is today weekend: !`date "+%u"` (6=Sat, 7=Sun)
- Today's daily note exists: !`f="0-inbox/daily/$(date +%Y-%m-%d).md"; [ -f "$f" ] && echo "yes ($f)" || echo "no — need to create"`
- Yesterday's daily note: !`f="0-inbox/daily/$(date -d yesterday +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d).md"; [ -f "$f" ] && cat "$f" || echo "(none)"`
- Current monthly report: !`f="Areas/reports/Monthly/$(date +%Y-%m).md"; [ -f "$f" ] && cat "$f" || echo "(not found — might need end-month first)"`
- Current weekly report: !`w=$(date +%V); y=$(date +%Y); f="Areas/reports/Weekly/${y}-W${w}.md"; [ -f "$f" ] && cat "$f" || echo "(not found)"`
- Daily note template: !`cat "Templates/Daily note Template.md" 2>/dev/null`
- Open `now` issues (across all owned repos): !`gh search issues --owner "@me" "label:now" "state:open" --json repository,number,title,labels --limit 30 2>/dev/null || echo "(gh unavailable or no hub issues configured)"`
- Open `next` issues count: !`gh search issues --owner "@me" "label:next" "state:open" --json number 2>/dev/null | grep -c '"number"' || echo 0`

## Your task

Start the user's work day: ensure today's daily note exists with proper context, then produce a morning briefing.

### Step 1: Create today's daily note if missing

If the daily note does not exist, create `0-inbox/daily/YYYY-MM-DD.md` by:

1. Starting from `Templates/Daily note Template.md`
2. **Pre-filling `# 進行中的任務`** with unchecked `[ ]` items from yesterday's daily note's `# 進行中的任務` section (carry-over). Dedupe against anything already completed in yesterday's Logs.
3. **Pre-filling `## 📋 本月目標追蹤`** — copy the Objective rows from the current monthly report (file 2 above), use its Status values, leave 昨日進度 / 今日計畫 columns blank for now. Remove the `> [!tip]` instructional callout after filling.
4. Leave `# Tasks` and `# Logs` empty for the briefing step to populate.

If the daily note already exists, skip creation but still check that `本月目標追蹤` is in sync with the current monthly objectives — if out of sync, note it in the briefing but do not auto-rewrite (user may have intentionally edited).

### Step 2: Infer today's top 3 tasks

Determine the top 3 tasks for today. Sources in priority order:

1. **Open `label:now` GitHub issues** (see context — Hub issue workflow). An open `now` issue is the strongest signal that the user has already committed to doing it this week.
2. Yesterday's unfinished `[ ]` items tagged as carry-over or marked urgent
3. Current weekly report's `## In Progress / Carry Over` items
4. Current monthly Objectives in 🔄 In Progress / ⚠️ Blocked status

When a task maps to a `now` issue, format it as `1. [ ] <title> (#<number> @<repo>)` so the user can click through. Prefer `now` issues over generic carry-over when both point at the same work.

**Weekend logic**: if today is Saturday/Sunday (`date +%u` is 6 or 7), prefer Side Projects section over AML/work items. User mostly does side projects on weekends.

Write the 3 tasks into the daily note's `# Tasks` section as `1. [ ] …`, `2. [ ] …`, `3. [ ] …`.

### Step 3: Produce morning briefing

Append this to the top of `# Ideas` section (or write directly above it) in the daily note:

```markdown
## 今日簡報 — YYYY-MM-DD

**🎯 今日重點**
- <task 1>
- <task 2>
- <task 3>

**📌 Issue 狀態** （只在 hub issue workflow 啟用時才放這段）
- `now` open: <N>  `next` queued: <M>
- <若有 ≤ 2 條特別值得提醒的 `now` issue，在這裡列 title + `#N @repo`>

**⚠️ 待注意**
- <blockers or carry-over from yesterday's logs or weekly report>
```

如果 `gh` 不可用或 `now`/`next` context 回傳 0 或錯誤訊息，整段「📌 Issue 狀態」省略。

Keep the briefing under 200 words total. Be direct, no filler. Traditional Chinese.

### Step 4: Report

Tell the user:
- Whether the daily note was created or already existed
- The 3 top tasks for today
- Any notable blockers or carry-overs

Keep it brief — 3~5 lines max.
