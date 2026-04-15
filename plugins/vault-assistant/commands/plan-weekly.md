---
allowed-tools: Bash(ls:*), Bash(date:*), Bash(gh:*), Read, Write, Glob, Grep
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
- Open `now` issues: !`gh search issues --owner "@me" "label:now" "state:open" --json repository,number,title,labels --limit 50 2>/dev/null || echo "(none)"`
- Open `next` issues: !`gh search issues --owner "@me" "label:next" "state:open" --json repository,number,title,labels --limit 50 2>/dev/null || echo "(none)"`
- Open `later` issues (oldest 10): !`gh search issues --owner "@me" "label:later" "state:open" --sort updated --order asc --json repository,number,title --limit 10 2>/dev/null || echo "(none)"`

## Your task

Help the user plan next week's weekly report. Follow these steps IN ORDER:

### Step 1: Review & Summarize

Analyze all the context above and present a structured summary:

1. **本週完成事項** — Extract completed items from daily notes and the latest weekly report
2. **本週未完成 / Carry Over** — Items still in progress that should carry over
3. **本月目標 進度** — Current status of each Objective from the monthly report
4. **所有進行中的專案** — List ALL projects under `Projects/`, with a brief status for each (based on recent daily notes and weekly report mentions). Highlight projects that have NOT been mentioned this week.
5. **Issue backlog 概觀**（若有 hub issue workflow）— Summarize from context:
   - `now` open issues grouped by `project:*` label（這些是本週承諾要完成的）
   - `next` queue count（下週候補）
   - `later` 最老的 3–5 條（可能該被 re-evaluate 或 close 掉）

### Step 2: Ask the User

After presenting the summary, ask the user:

1. 下週各專案的優先級和重點是什麼？
2. 有沒有新的工作項目要加入？
3. 有沒有專案要暫停或調整方向？
4. Learned / Notes 有什麼想補充的？
5. **Issue re-label**：（只在 hub workflow 啟用時問）
   - 有哪些 `next` issue 要升級成 `now`？
   - 有哪些 `later` issue 要升成 `next`，或直接 close？
   - 本週新產生的工作要不要現在 capture 成 issue？（可以跑 `/vault-assistant:capture-issue`）

**IMPORTANT: Wait for the user's response before proceeding to Step 3.**

### Step 3: Apply issue re-labels

Based on user's answers to Q5, run the relevant `gh issue edit` commands:

```bash
# 升級：next → now
gh issue edit <N> --repo <owner>/<repo> --add-label now --remove-label next
# 升級：later → next
gh issue edit <N> --repo <owner>/<repo> --add-label next --remove-label later
# 退場
gh issue close <N> --repo <owner>/<repo> --comment "Closed during weekly planning: no longer relevant"
```

執行後回報用戶：哪幾個 issue 被 re-label、哪幾個被 close。若用戶沒提到 issue 調整，跳過這一步。

### Step 4: Create the Weekly Report

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
