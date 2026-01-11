# Agentic Plugins

Claude Code 插件市集，提供各種擴展功能。

## 插件列表

| 名稱 | 說明 | 類別 |
|------|------|------|
| [hello-world](./plugins/hello-world/) | 簡單的範例技能，展示基本插件結構 | example |
| [damage-control](./plugins/damage-control/) | 損害控制安全系統，封鎖危險指令並保護敏感檔案 | security |

## 安裝

### 從市集安裝

```bash
# 加入市集
claude /plugin marketplace add owner/agentic-plugins

# 安裝特定插件
claude /plugin install hello-world@agentic-plugins
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
│   ├── hello-world/              # 範例插件
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   ├── skills/
│   │   └── README.md
│   └── damage-control/           # 安全插件
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── skills/
│       └── README.md
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
