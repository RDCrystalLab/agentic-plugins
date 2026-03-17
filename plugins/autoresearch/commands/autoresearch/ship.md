---
name: autoresearch:ship
description: 通用發布工作流——透過結構化 8 階段工作流發布程式碼、內容、行銷、銷售、研究或任何事物
argument-hint: "[--dry-run] [--auto] [--force] [--rollback] [--monitor N] [--type <type>] [--checklist-only]"
---

載入並遵循 autoresearch 發布工作流程協議。

1. 讀取技能檔案：`.claude/skills/autoresearch/SKILL.md`——了解整體 autoresearch 框架
2. 讀取發布工作流程參考文件：`.claude/skills/autoresearch/references/ship-workflow.md`——這是完整的執行協議
3. 從使用者參數解析 flags：$ARGUMENTS
4. 依照 `ship-workflow.md` 中定義的 8 階段發布工作流程執行

嚴格遵循發布工作流程協議。所有階段、清單項目與驗證步驟都必須依文件執行。
