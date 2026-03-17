# Agentic Plugins

Claude Code 插件市集，提供各種擴展功能。

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

## 安裝

### 從市集安裝

```bash
# 加入市集
claude /plugin marketplace add owner/agentic-plugins

# 安裝特定插件
claude /plugin install damage-control@agentic-plugins
```

### 從本地目錄安裝

```bash
# 加入整個市集
claude /plugin add /path/to/agentic-plugins

# 或安裝單一插件
claude /plugin add /path/to/agentic-plugins/plugins/damage-control
```

## 結構

```
agentic-plugins/
├── .claude-plugin/
│   └── marketplace.json          # 市集註冊
├── plugins/
│   ├── damage-control/           # 安全插件
│   ├── drawio/                   # draw.io 圖表
│   ├── excalidraw/               # Excalidraw 圖表
│   ├── github-kb/                # GitHub 知識庫
│   ├── playwright-cli/           # 瀏覽器自動化
│   ├── tmux-fork/                # tmux 並行執行
│   ├── gh-tools/                 # GitHub 工具
│   ├── anvil/                    # 程式碼驗證代理人
│   └── autoresearch/             # 自主改進引擎
└── README.md
```

每個插件目錄包含：
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json               # 插件元數據
├── agents/                       # Agent 定義（選用）
├── skills/                       # Skill 定義（選用）
├── commands/                     # Slash 指令（選用）
├── hooks/                        # 事件鉤子（選用）
└── README.md
```

## 貢獻

新增插件時請遵循：

1. 在 `plugins/` 下建立插件目錄
2. 包含 `.claude-plugin/plugin.json` 元數據
3. 包含完整的 `README.md`
4. 在根目錄 `.claude-plugin/marketplace.json` 中註冊

## License

MIT
