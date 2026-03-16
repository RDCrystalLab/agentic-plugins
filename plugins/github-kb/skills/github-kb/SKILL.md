---
name: github-kb
description: >
  GitHub 本地知識庫管理員與查詢助手。
  當使用者提到 github、repo、repository、倉庫、下載 repo、clone、複製倉庫、PR、issue、pull request，
  或任何與 GitHub 專案相關的內容時，必須觸發此技能。
  此技能知道本地 repo 的位置，可以 clone 新的 repo，並使用 gh CLI 搜尋 issue、PR 與 repository 來回答問題。
  主動使用——即使使用者只是詢問「我有哪些 repo」或隨口提到某個 GitHub 帳號或專案名稱。
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
---

# GitHub KB — 本地知識庫與 GitHub 助手

## 本地倉庫根目錄

所有本地 clone 都存放於：`~/workspaces/github/`

知識庫索引維護於：

@~/workspaces/github/AGENTS.md

每次觸發時先讀取此檔案，確認哪些 repo 已在本地。若檔案不存在或目錄不存在，請參閱下方「目錄不存在」段落。

---

## 工作流程：回答 GitHub / Repo 相關問題

### 第一步 — 優先查詢本地

在連線 GitHub 之前，先確認使用者提到的 repo 是否已 clone 在本地：

```bash
ls ~/workspaces/github/
```

若本地已有，優先直接讀取檔案——速度更快、可離線使用、不消耗 API 配額。

### 第二步 — 若本地沒有，使用 gh CLI 查詢 GitHub

```bash
# 搜尋 repository
gh search repos <關鍵字> --limit 10

# 查看 repo 詳情
gh repo view <owner>/<repo>

# 列出 issues
gh issue list --repo <owner>/<repo> --state open --limit 20

# 搜尋 issues
gh search issues <關鍵字> --repo <owner>/<repo>

# 列出 PRs
gh pr list --repo <owner>/<repo> --state open --limit 20

# 查看特定 PR
gh pr view <編號> --repo <owner>/<repo>

# 搜尋程式碼
gh search code <關鍵字> --repo <owner>/<repo>
```

優先使用 `gh` 而非直接呼叫 `curl`——`gh` 會自動處理身份驗證。

---

## 工作流程：Clone 新的 Repository

當使用者說要下載或 clone 某個 repo：

1. **確認 repo 名稱** — 若 owner/repo 不明確，先向使用者確認。
2. **Clone 到本地根目錄：**
   ```bash
   git clone https://github.com/<owner>/<repo>.git ~/workspaces/github/<repo>
   ```
3. **產生一句話摘要** — 讀取 repo 的 README 或頂層檔案，寫出一句話描述（≤ 120 字元）。
4. **更新知識庫索引** — 將 repo 條目新增至 `~/workspaces/github/AGENTS.md`：
   ```
   - **<repo>** (`<owner>/<repo>`): <一句話摘要>
   ```
   條目依字母順序排列。

---

## 知識庫索引格式

`~/workspaces/github/AGENTS.md` 使用以下結構：

```markdown
# GitHub 本地知識庫

此目錄存放本地 clone 的 GitHub repositories。

## Repositories

- **repo-name** (`owner/repo-name`): 這個 repo 的一句話說明。
- **another-repo** (`owner/another-repo`): 另一個 repo 的一句話說明。
```

更新索引時：
- 每個 repo 一條記錄，依字母順序排列於 `## Repositories` 下
- 格式：`- **<名稱>** (\`<owner>/<名稱>\`): <摘要>`
- 摘要使用與使用者相同的語言撰寫

---

## 目錄不存在

若執行時 `~/workspaces/github/` 不存在：

1. 告知使用者：「找不到本地 GitHub 目錄 `~/workspaces/github`。」
2. 詢問是否要建立：`mkdir -p ~/workspaces/github`
3. 使用者同意後，建立目錄並建立空白的 `AGENTS.md` 索引。
4. 繼續執行使用者原本的請求。

---

## 注意事項

- 使用者以簡稱提到 repo 時（例如「claude-code 那個 repo」），先嘗試比對本地 `AGENTS.md` 的記錄，再詢問確認。
- 查詢使用者自己的 issue 或 PR 時，若未指定 owner，預設使用 `ricky1698`。
- 若 `gh auth status` 失敗，提醒使用者執行 `gh auth login`。
- Clone 時預設使用 HTTPS，除非使用者明確要求 SSH。
