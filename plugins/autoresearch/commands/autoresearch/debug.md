---
name: autoresearch:debug
description: 自主除錯迴圈——科學方法 + 自動研究迭代。找出所有 bug，而非只找一個。
argument-hint: "[--fix] [--scope <glob>] [--symptom <text>] [--severity <level>]"
---

載入並遵循 autoresearch 除錯工作流程協議。

1. 讀取技能檔案：`.claude/skills/autoresearch/SKILL.md`——了解整體 autoresearch 框架
2. 讀取除錯工作流程參考文件：`.claude/skills/autoresearch/references/debug-workflow.md`——這是完整的執行協議
3. 從使用者參數解析 flags：$ARGUMENTS
4. 依照 `debug-workflow.md` 中定義的 7 階段除錯迴圈執行

嚴格遵循除錯工作流程協議。每個發現都需要程式碼證據（file:line + 重現步驟）。每個被推翻的假設同樣需要記錄——它們同等重要。
