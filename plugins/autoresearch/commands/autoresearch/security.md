---
name: autoresearch:security
description: 自主安全審計——STRIDE 威脅模型 + OWASP Top 10 + 4 個對抗性角色的紅隊測試
argument-hint: "[--diff] [--fix] [--fail-on <severity>]"
---

載入並遵循 autoresearch 安全審計協議。

1. 讀取技能檔案：`.claude/skills/autoresearch/SKILL.md`——了解整體 autoresearch 框架
2. 讀取安全工作流程參考文件：`.claude/skills/autoresearch/references/security-workflow.md`——這是完整的執行協議
3. 從使用者參數解析 flags：$ARGUMENTS
4. 依照 `security-workflow.md` 中定義的 7 步驟安全審計執行

嚴格遵循安全工作流程協議。每個發現都需要程式碼證據（file:line + 攻擊情境）。追蹤 OWASP Top 10 + STRIDE 覆蓋率。
