# caveman

**why use many token when few do trick**

極致壓縮溝通模式，削減約 **75% 輸出 token** 同時保持完整技術準確性。支援文言文模式。

原作者：[Julius Brussee](https://github.com/JuliusBrussee/caveman)

## 包含技能

| 技能 | 指令 | 用途 |
|------|------|------|
| **caveman** | `/caveman [lite\|full\|ultra]` | 切換 caveman 模式與強度等級 |
| **caveman-commit** | `/caveman-commit` | 精簡 commit 訊息，Conventional Commits 格式 |
| **caveman-review** | `/caveman-review` | 精簡 PR review 評論，每條一行 |
| **caveman-compress** | `/caveman:compress <file>` | 壓縮 CLAUDE.md 等記憶檔，節省 ~45% 輸入 token |

## 強度等級

| 等級 | 觸發 | 效果 |
|------|------|------|
| **Lite** | `/caveman lite` | 去掉廢話，保留文法。專業但精簡 |
| **Full** | `/caveman full` | 預設。去掉冠詞，片段式句子 |
| **Ultra** | `/caveman ultra` | 最大壓縮。電報式。縮寫一切 |

## 文言文模式

| 等級 | 觸發 | 效果 |
|------|------|------|
| **Wenyan-Lite** | `/caveman wenyan-lite` | 半古文。去廢話保文法 |
| **Wenyan-Full** | `/caveman wenyan` | 全文言文。80-90% 字元壓縮 |
| **Wenyan-Ultra** | `/caveman wenyan-ultra` | 極限。古代書生省錢版 |

## Hooks

本插件包含兩個 hooks：
- **SessionStart**: 自動啟動 caveman 模式
- **UserPromptSubmit**: 追蹤當前 caveman 強度等級
