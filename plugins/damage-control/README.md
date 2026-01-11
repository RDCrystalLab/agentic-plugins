# Damage Control Plugin

損害控制 (Damage Control) - Claude Code 的深度防禦 (defense-in-depth) 安全系統。透過 PreToolUse 鉤子封鎖危險指令並保護敏感檔案。

## 功能

- **指令模式封鎖 (Command Pattern Blocking)**：封鎖危險的 bash 指令（如 `rm -rf`、`git reset --hard` 等）
- **詢問模式 (Ask Patterns)**：對於有風險但合理的操作觸發確認對話框
- **路徑保護等級 (Path Protection Levels)**：
  - `zeroAccessPaths` - 零存取路徑：完全禁止存取
  - `readOnlyPaths` - 唯讀路徑：允許讀取，封鎖修改
  - `noDeletePaths` - 禁止刪除路徑：允許所有操作，但禁止刪除

## 安裝

```bash
claude /plugin add /path/to/damage-control
```

安裝後執行技能：
```
install damage control
```

## 結構

```
damage-control/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── damage-control/
│       ├── SKILL.md
│       ├── patterns.yaml
│       ├── cookbook/
│       ├── hooks/
│       └── test-prompts/
└── README.md
```

## 使用方式

| 指令 | 說明 |
|------|------|
| `install damage control` | 安裝安全鉤子系統 |
| `modify damage control` | 修改保護設定 |
| `test damage control` | 測試鉤子是否正常運作 |
| `list damage controls` | 列出所有設定 |

## 執行環境需求

| 實作 | 執行環境 | 安裝指令 |
|------|----------|----------|
| Python | UV (Astral) | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| TypeScript | Bun | `curl -fsSL https://bun.sh/install \| bash` |

## License

MIT
