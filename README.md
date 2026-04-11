# Agentic Plugins

跨平台 AI Agent 插件市集，提供各種擴展功能。支援 Claude Code、Cursor、Windsurf、Copilot、Cline 等 agent。

## 插件列表

| 名稱 | 說明 | 類別 |
|------|------|------|
| [damage-control](./plugins/damage-control/) | 損害控制安全系統，封鎖危險指令並保護敏感檔案 | security |
| [drawio](./plugins/drawio/) | 建立和編輯 draw.io 圖表，支援流程圖、架構圖、序列圖等 | visualization |
| [excalidraw](./plugins/excalidraw/) | 建立手繪風格 Excalidraw 圖表，支援 PNG 匯出 | visualization |
| [github-kb](./plugins/github-kb/) | GitHub 本地知識庫管理員，維護本地 repo 索引，支援 clone、查詢與 gh CLI 搜尋 | productivity |
| [playwright-cli](./plugins/playwright-cli/) | 瀏覽器自動化，支援網頁測試、表單填寫、截圖與資料擷取 | automation |
| [tmux-fork](./plugins/tmux-fork/) | 開啟新的 tmux 視窗以並行執行 AI agents 或 CLI 指令 | automation |
| [gh-tools](./plugins/gh-tools/) | GitHub 工作流程指令，管理 issues、PR 與專案 | development |
| [anvil](./plugins/anvil/) | 以證據為優先的程式碼代理人，使用對抗性多模型審查與 SQL 追蹤驗證 | development |
| [autoresearch](./plugins/autoresearch/) | 自主改進引擎，執行無限循環的修改驗證流程，包含規劃精靈、安全審查與自動除錯 | productivity |
| [tutor-skills](./plugins/tutor-skills/) | 將知識來源轉化為 Obsidian StudyVault，並透過互動式測驗追蹤學習進度 | productivity |
| [openrouter-image-gen](./plugins/openrouter-image-gen/) | 透過 OpenRouter API 生成圖片，支援 Flux、Gemini、GPT-5 Image 等模型 | visualization |
| [caveman](./plugins/caveman/) | 極致壓縮溝通模式，削減約 75% 輸出 token，支援文言文模式 | productivity |
| [cli-creator](./plugins/cli-creator/) | 從 API 文件或現有腳本建立可組合的 CLI 工具，偏好 uv single-file | development |
| [marimo](./plugins/marimo/) | marimo reactive notebook 全方位技能包（11 個技能：撰寫、配對、轉換、論文實作等） | development |

## 安裝

### 方式一：npx skills（適用所有 Agent）

支援 Claude Code、Cursor、Windsurf、Copilot、Cline 等 18+ 個 AI agent。

```bash
# 安裝全部 skills
npx skills add RDCrystalLab/agentic-plugins

# 安裝特定 skill
npx skills add RDCrystalLab/agentic-plugins --skill caveman
npx skills add RDCrystalLab/agentic-plugins --skill tutor --skill tutor-setup

# 指定 agent（預設自動偵測）
npx skills add RDCrystalLab/agentic-plugins -a cursor
npx skills add RDCrystalLab/agentic-plugins -a windsurf

# 列出可用 skills
npx skills add RDCrystalLab/agentic-plugins --list
```

> `npx skills` 會自動遞迴搜尋 repo 中所有 `SKILL.md` 檔案並安裝。

### 方式二：Claude Code Plugin Marketplace（僅 Claude Code）

完整插件體驗，包含 skills + hooks + commands + agents。

```bash
# 加入市集
claude plugin marketplace add RDCrystalLab/agentic-plugins

# 安裝特定插件
claude plugin install caveman@agentic-plugins
claude plugin install damage-control@agentic-plugins

# 重新載入
/reload-plugins
```

### 方式三：從本地目錄安裝

```bash
# 安裝單一插件
claude plugin add /path/to/agentic-plugins/plugins/caveman
```

## 兩種安裝方式差異

| | npx skills | Claude Code Plugin |
|---|---|---|
| 適用 Agent | 所有（18+ 種） | 僅 Claude Code |
| 安裝內容 | skills（SKILL.md）| skills + hooks + commands + agents |
| Hooks 支援 | ✗ | ✓ |
| 自動更新 | 手動重裝 | `claude plugin update` |
| 安裝位置 | 專案級或全域 `~/.agents/skills/` | `~/.claude/plugins/cache/` |

> **建議**：Claude Code 用戶用 Plugin Marketplace 安裝以獲得完整功能（含 hooks）；其他 agent 用 `npx skills`。

## 結構

```
agentic-plugins/
├── .claude-plugin/
│   └── marketplace.json          # 市集註冊
├── plugins/
│   ├── plugin-name/
│   │   ├── plugin.json           # VS Code Copilot 格式
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json       # Claude Code 格式
│   │   ├── skills/               # Skill 定義（SKILL.md）
│   │   ├── agents/               # Agent 定義（選用）
│   │   ├── commands/             # Slash 指令（選用）
│   │   ├── hooks/                # 事件鉤子（選用）
│   │   └── README.md
│   └── ...
└── README.md
```

每個插件包含雙格式 `plugin.json`：
- `plugin.json`（根目錄）— VS Code Copilot Agent Plugin 格式
- `.claude-plugin/plugin.json` — Claude Code Plugin 格式

## 貢獻

新增插件時請遵循：

1. 在 `plugins/` 下建立插件目錄
2. 包含 `.claude-plugin/plugin.json` 和根目錄 `plugin.json`（雙格式）
3. 包含完整的 `README.md`
4. 在根目錄 `.claude-plugin/marketplace.json` 中註冊
5. 更新 `AGENTS.md` 插件表格

## License

MIT
