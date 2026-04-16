---
allowed-tools: Bash(gh:*), Bash(ls:*), Read, Glob, Grep
description: 從 vault 工作流裡開一個 GitHub issue — 自動套 project/type/horizon 三軸 label，code repo 或 hub(sb) 自動路由
---

## Context

- Active projects: !`ls -d Projects/*/ 2>/dev/null | sed 's|Projects/||;s|/||'`
- Project routing table: `Projects/project-repos.md`（authoritative for issue routing; vault-local and user-maintained）
- Hub repo（從 git remote 推論）: !`git remote get-url origin 2>/dev/null | sed -E 's|.*[/:]([^/]+/[^/.]+)(\.git)?$|\1|' || echo "(not in a git repo)"`

## Your task

開一個新的 GitHub issue，套好 Hub issue workflow 的三軸 label，必要時引導用戶填 template。Input 是 `$ARGUMENTS` — 可以是完整的 issue title 或半成品訊息；若為空，走互動訪談模式。

### Step 1: 蒐集必要資訊

需要湊齊這些欄位。能從 `$ARGUMENTS` 推論的就直接推論，不夠再問用戶（一次問完，不要一題一題拷問）：

1. **Title**（required）— 一行可執行的標題。Bug 用「Fix X」而非「X broken」，research 用「Investigate whether…」，decision 用「Decide: …」
2. **Type**（required）— `epic` / `story` / `task` / `bug` / `research` / `decision` / `idea`。推論規則（由粗到細，先試粒度軸再試工作性質）：
   - 含「epic」「大工程」「跨多週」「多階段」→ `epic`
   - 含「story」「user story」「feature」「功能（作為交付成果）」→ `story`
   - 含「修」「壞」「broken」「crash」「bug」→ `bug`
   - 含「查」「研究」「比較」「investigate」「survey」→ `research`
   - 含「決定」「選」「要不要」「decide」「choose」→ `decision`
   - 含「想法」「也許」「未來」「maybe」→ `idea`
   - 其他可執行任務 → `task`

   **粒度階層**：`epic` ⊃ `story` ⊃ `task`。若用戶在 `$ARGUMENTS` 明確提到 parent epic/story（例如「這是 #42 的子任務」），建議使用者開完 issue 後到 GitHub UI 把它設成 sub-issue。
3. **Project**（required）— 優先對照 `Projects/project-repos.md` 的 `project_slug` / `aliases`；只有 routing table 沒列到時，才 fallback 到 `Projects/<slug>/`。從 `$ARGUMENTS` 或最近 daily note 的 context 推論；歧義就列 routing table + Active projects 問用戶
4. **Horizon**（required）— `now` / `next` / `later`。預設 `next`（除非用戶明講今天/這週要做）
5. **Target repo**（required）— 決定 issue 開在哪：
   - **先讀 `Projects/project-repos.md`**：若該 project 在表內有 `default_repo`，預設用它；若 title/body 命中該列的 `override_keywords`，改用 `override_repo`
   - 若 Title 或 description 明確指定另一個 code repo（e.g. "in agentic-plugins"、"CA-expl"）且和 routing table 衝突，先跟用戶確認，不要自行覆蓋
   - 若 routing table 沒列到這個 project，再用 heuristic：Title/description 提到具體 code repo → 用該 repo；project 本身就是 code repo 名稱 → 用該 repo
   - 上述都沒有時，fallback 到 **hub repo**（`$hub_repo` — 從 `git remote get-url origin` 推論；若當前目錄是 sb vault 本身，hub 就是它）
   - Edge case：若當前不在任何 git repo，要求用戶明確指定 `--repo <owner>/<repo>`
   - 若 routing table 缺這個 project，但這看起來是 recurring code repo work，提醒用戶事後把 mapping 補進 `Projects/project-repos.md`
6. **Body**（optional）— 若是 `decision` 或 `research`，套用對應 template 骨架；其他 type 用用戶給的文字或留空

### Step 2: 確認

把解析出來的欄位 echo 回去給用戶看，格式：

```
Will create issue:
  Repo:    <owner>/<repo>
  Title:   <title>
  Labels:  project:<slug>, type:<type>, <horizon>
  Body:    (template skeleton | inline text | empty)

Confirm? (y/n/edit)
```

用戶回 `y` 才執行，`edit` 讓用戶改哪個欄位，`n` 中止。

### Step 3: 確認 label 存在

執行前先 quick check target repo 上有沒有這幾個 label：

```bash
gh label list --repo <owner>/<repo> --json name --jq '.[].name' | grep -E '^(project:<slug>|type:<type>|now|next|later)$'
```

**任何一個缺**：告訴用戶缺哪幾個，提示他跑 `Templates/issue-templates/labels.md` 裡的 bulk create 指令補齊後再重跑 `/capture-issue`。不要自動幫他建 label（label schema 是全域的，不該一條一條偷偷長）。

### Step 4: Create issue

```bash
gh issue create \
  --repo <owner>/<repo> \
  --title "<title>" \
  --label "project:<slug>,type:<type>,<horizon>" \
  --body "<body>"
```

Body 套 template 時：

- `type:decision` → 讀 `.github/ISSUE_TEMPLATE/decision.md`（vault 本身的）或 `${CLAUDE_PLUGIN_ROOT}/templates/issue-templates/decision.md`（fallback），去掉 frontmatter 後當 body
- `type:research` → 同上，用 `research.md`
- `type:task` → 用 `task.md`
- 其他：用用戶輸入的 body，或留空

### Step 5: 配對 vault note（type:decision / type:research 才做）

如果 type 是 `decision` 或 `research`，**不要**自動建 note——這是 work 階段才做的事，capture 階段只建 issue。但在回報時**提醒**用戶：

> 📝 這是 `type:<type>` issue。等到真的開工時，跑 `/vault-assistant:add-project-note <project-slug> <note-slug>` 建 vault note，並在 note frontmatter 加 `issue: <url>`。

### Step 6: 回報

Tell the user（≤ 5 lines）:

- Issue URL
- Labels applied
- 若當前在 vault 工作流程中，建議的下一步（例：把 issue URL 記到現在的 daily note Logs 區 / 等開工時 add-project-note）

**不要** commit 任何 vault 檔案——這個 command 是 GitHub-side only，vault 沒動到。

---

## Examples

```
/vault-assistant:capture-issue agentic-plugins: 決定要不要引入 gh Projects v2
```
→ Parsed: type=decision, project=agentic-plugins, horizon=next (default), repo=agentic-plugins (from project name match)

```
/vault-assistant:capture-issue deploy-box: 最後驗證 PowerFlex CSI 場景與收斂 pre-execution checklist
```
→ Parsed: type=task, project=deploy-box, horizon=next (default), repo=`ricky1698/deploy-box` (from vault routing table)

```
/vault-assistant:capture-issue 修 start-day 沒抓到 `now` issue 的 bug
```
→ Parsed: type=bug, project=vault-assistant (if `$ARGUMENTS` mentions command name), horizon=now (bug default), repo=<hub>

```
/vault-assistant:capture-issue
```
→ 互動模式：逐項問用戶
