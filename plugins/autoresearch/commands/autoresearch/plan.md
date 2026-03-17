---
name: autoresearch:plan
description: 互動式設定嚮導——從目標（Goal）產生範圍（Scope）、指標（Metric）、方向（Direction）與驗證指令（Verify）
argument-hint: "[goal description]"
---

載入並遵循 autoresearch 規劃工作流程協議。

1. 讀取技能檔案：`.claude/skills/autoresearch/SKILL.md`——了解整體 autoresearch 框架
2. 讀取規劃工作流程參考文件：`.claude/skills/autoresearch/references/plan-workflow.md`——這是完整的執行協議
3. 從參數接受使用者目標：$ARGUMENTS
4. 依照 `plan-workflow.md` 中定義的 7 步驟規劃嚮導執行

嚴格遵循規劃工作流程協議。所有關卡（機械化指標、試執行驗證、範圍解析）都必須通過才能接受設定。
