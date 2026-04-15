# vault-assistant

在任何 PARA 結構的 Obsidian vault 上跑完整 ceremony 的 Claude Code plugin。內建 `vault-assistant` subagent、13 個 slash command、3 個 skill，涵蓋日 / 週 / 月報、專案狀態、research-repo 巡檢、wiki 知識萃取與歸檔，並且每次寫入都自動 `git add` + `commit` + `push`（對齊 AGENTS.md 規則）。

## 目標使用者

用 Obsidian + Quartz 發佈的個人 vault 作者，採用 **PARA**（Projects / Areas / Resources / Archives）組織、每天寫 daily note、每週 weekly、每月 monthly，想讓 Claude Code 接手儀式性操作。

## 功能總覽

### Subagent

- **`vault-assistant`** — 知道 PARA 放置規則、Quartz-shortest wikilink 格式、每次寫入要 auto commit+push，會把多步 ceremony（morning briefing、end-of-day、weekly retrospective、monthly rollup）串起來跑。任何涉及 vault 的指令都建議改委派給它。

### Slash commands（13）

| Command | 作用 |
|---|---|
| `/vault-assistant:install` | 初始化當前目錄為 PARA vault（建骨架、複製 templates、寫 `AGENTS.md`） |
| `/vault-assistant:start-day` | 建立今日 daily note，產出 morning briefing |
| `/vault-assistant:end-day` | 收尾 daily note、reconcile checkbox、同步 Objectives 進度、auto commit+push |
| `/vault-assistant:end-week` | Weekly retrospective — 彙整本週 daily 進 weekly 報 |
| `/vault-assistant:end-month` | Monthly rollup、評估 Objectives、建立下月 skeleton |
| `/vault-assistant:plan-weekly` | 規劃下週 weekly report（訪談式） |
| `/vault-assistant:sync-projects` | 從最新 weekly / monthly 反推同步 `Projects/index.md` |
| `/vault-assistant:update-project-status` | 更新指定專案的狀態表與最後更新日 |
| `/vault-assistant:add-project-note` | 在專案下新增研究筆記 |
| `/vault-assistant:extract-pattern` | 從當前工作萃取 wiki article（跳過 raw/ 流程） |
| `/vault-assistant:archive-project-doc` | 搬檔案到 Archives（處理 assets + wikilink 重寫） |
| `/vault-assistant:gh-daily-log` | 抓 GitHub 活動寫入 daily note 的 Logs |
| `/vault-assistant:repo-patrol` | 巡檢 `Areas/development/research-repos/` 的 upstream 變化 |
| `/vault-assistant:watch-repo` | 加 GitHub repo 進 research-repos monitoring list |

### Skills（4）

- **`new-project`** — 在 vault 新增專案、更新 `Projects/index.md`
- **`gh-contribution-report`** — 從 GitHub org 抓 commits / PRs 生成月報與年報
- **`gh-issues-to-doc`** — 把 GitHub Issues 轉成結構化 Obsidian 筆記
- **`github-query`** — vault-first 的 GitHub repo / issue / PR 查詢層，優先讀 research-repos note，未命中才 fallback 到本地 clone 與 `gh` CLI，並在值得追蹤時建議 `/watch-repo` 沉澱

## 安裝

透過 marketplace：

```
/plugin install vault-assistant@agentic-plugins
```

或本地測試：

```bash
claude --plugin-dir ~/workspaces/agentic-plugins/plugins/vault-assistant
```

## 初始化 vault

在你想當作 vault root 的目錄執行：

```
/vault-assistant:install
```

這會：

1. 建立 PARA 骨架（`0-inbox/daily/`、`Projects/`、`Areas/`、`Resources/`、`Archives/`、`Templates/` 等）
2. 從 plugin 內建 templates 複製 `Daily / Weekly / Monthly Report Template.md` 到 `Templates/`
3. 複製 `AGENTS.md`（vault 操作規範 — PARA placement、wikilink 格式、git workflow）
4. 建立 `CLAUDE.md`（`@AGENTS.md` import）

既有檔案一律不覆蓋，只補缺。

## 使用範例

```
> 手上有哪些專案
> 今日還有哪些項目
> /vault-assistant:start-day
> /vault-assistant:end-day
> 幫我把今天完成的 CSI 除錯經驗萃取成 wiki article
```

前三種會自動委派給 `vault-assistant` subagent。

## 依賴

- **Obsidian vault** 使用 PARA 結構（plugin 的 `install` command 會幫你建）
- **Git** — 每次 vault 寫入會 auto commit + push，remote 需預先設好
- **`gh` CLI** — `gh-daily-log`、`gh-contribution-report`、`gh-issues-to-doc` 用到
- **Quartz**（可選）— 若要發佈成靜態網站，plugin 的 wikilink 規則就是為此校對的

## Ceremony 與 PARA 規則

完整規則見 `templates/AGENTS.md.template`，install 後會複製到 vault root 的 `AGENTS.md`：

- **PARA 放置**：Projects（執行）/ Areas（持續責任）/ Resources（參考）/ Archives（完成）
- **Wikilink**：Quartz `shortest` 模式，一律用 `[[檔名]]`，不加路徑前綴
- **Git workflow**：任何 vault 寫入 → auto `git add` + `commit` + `push`，conventional commits
- **Daily note**：`0-inbox/daily/YYYY-MM-DD.md`，由 `/start-day` 建立
- **Reports**：Weekly `Areas/reports/Weekly/YYYY-Wnn.md`、Monthly `Areas/reports/Monthly/YYYY-MM.md`

## License

MIT
