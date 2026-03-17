---
name: autoresearch:fix
description: 自主修復迴圈——迭代修復錯誤直到歸零。每次迭代修一個，原子性操作，失敗自動還原。
argument-hint: "[--target <cmd>] [--guard <cmd>] [--scope <glob>] [--category <type>] [--from-debug]"
---

載入並遵循 autoresearch 修復工作流程協議。

1. 讀取技能檔案：`.claude/skills/autoresearch/SKILL.md`——了解整體 autoresearch 框架
2. 讀取修復工作流程參考文件：`.claude/skills/autoresearch/references/fix-workflow.md`——這是完整的執行協議
3. 從使用者參數解析 flags：$ARGUMENTS
4. 依照 `fix-workflow.md` 中定義的 8 階段修復迴圈執行

嚴格遵循修復工作流程協議。每次迭代只修一個問題。禁止壓制錯誤。修正實作，而非測試。回歸時自動還原。
