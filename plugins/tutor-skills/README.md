# tutor-skills

將任何知識來源轉化為 **Obsidian StudyVault**，再透過互動式測驗閉環學習。

原作者：[RoundTable02](https://github.com/RoundTable02/tutor-skills)

## 包含技能

| 技能 | 指令 | 用途 |
|------|------|------|
| **tutor-setup** | `/tutor-setup` | 從文件或程式碼產生 StudyVault |
| **tutor** | `/tutor` | 互動式測驗，追蹤概念級進度 |

## 工作流程

```
文件 / 程式碼  ──/tutor-setup──▶  Obsidian StudyVault  ──/tutor──▶  測驗 + 進度追蹤
```

## tutor-setup

自動偵測模式：

| 偵測到的標記 | 模式 |
|------------|------|
| `package.json`, `Cargo.toml`, `go.mod` 等 | **Codebase Mode**（程式碼上手 Vault） |
| 無專案標記 | **Document Mode**（文件學習筆記） |

- **Document Mode**：PDF、MD、HTML、EPUB → 結構化筆記 + 練習題
- **Codebase Mode**：原始碼 → 新人上手 Vault（模組說明、架構圖、練習）

## tutor

概念級測驗輔導，追蹤每個知識點的掌握程度：

| 徽章 | 等級 | 正確率 |
|------|------|--------|
| 🟥 | 弱 | 0–39% |
| 🟨 | 普通 | 40–69% |
| 🟩 | 良好 | 70–89% |
| 🟦 | 精通 | 90–100% |
| ⬜ | 未測量 | 無資料 |

## 需求

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code)
- [Obsidian](https://obsidian.md/)（建議，用於瀏覽生成的 Vault）
