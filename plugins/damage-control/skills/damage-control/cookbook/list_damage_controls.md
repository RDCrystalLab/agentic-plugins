---
model: opus
description: 列出全域、專案和個人等級的所有損害控制 (Damage Control) 權限
---

# 目的

顯示所有設定等級（全域、專案、專案個人）的損害控制 (Damage Control) 安全設定摘要。

## 變數

GLOBAL_SETTINGS: ~/.claude/settings.json
GLOBAL_PATTERNS: ~/.claude/hooks/damage-control/patterns.yaml
PROJECT_SETTINGS: .claude/settings.json
PROJECT_PATTERNS: .claude/hooks/damage-control/patterns.yaml
LOCAL_SETTINGS: .claude/settings.local.json

## 指示

- 檢查每個設定等級是否存在
- 如果存在，讀取每個等級的 patterns.yaml
- 呈現所有保護的整合檢視
- 清楚標示哪些等級已啟用與未設定

## 工作流程

1. 檢查哪些等級已安裝損害控制 (Damage Control)：
   - 全域：檢查 `~/.claude/hooks/damage-control/patterns.yaml` 是否存在
   - 專案：檢查 `.claude/hooks/damage-control/patterns.yaml` 是否存在
   - 個人：檢查 `.claude/settings.local.json` 是否存在並參照 damage-control 鉤子

2. 對於每個已安裝的等級，讀取 patterns.yaml 並擷取：
   - `bashToolPatterns` - 被封鎖的指令模式
   - `zeroAccessPaths` - 零存取路徑
   - `readOnlyPaths` - 唯讀路徑
   - `noDeletePaths` - 禁止刪除路徑

3. 呈現整合報告

## 報告

以此格式呈現設定：

---

## 損害控制 (Damage Control) 設定摘要

### 全域等級 (`~/.claude/`)

**狀態**：[已安裝 / 未設定]

[如果已安裝：]
**零存取路徑 (Zero Access Paths)**（禁止所有操作）：
- [列出路徑或「未設定」]

**唯讀路徑 (Read Only Paths)**（允許讀取，禁止修改）：
- [列出路徑或「未設定」]

**禁止刪除路徑 (No Delete Paths)**（允許除刪除外的所有操作）：
- [列出路徑或「未設定」]

**被封鎖的指令模式 (Blocked Command Patterns)**：[數量] 個模式
- [列出前 5 個模式及原因，或「未設定」]
- [如果超過 5 個：「... 以及 [N] 個更多」]

---

### 專案等級 (`.claude/`)

**狀態**：[已安裝 / 未設定]

[與全域格式相同]

---

### 專案個人等級 (`.claude/settings.local.json`)

**狀態**：[已安裝 / 未設定]

[與全域格式相同]

---

### 保護摘要

| 等級 | 零存取 | 唯讀 | 禁止刪除 | 指令模式 |
|------|--------|------|----------|----------|
| 全域 | [數量] | [數量] | [數量] | [數量] |
| 專案 | [數量] | [數量] | [數量] | [數量] |
| 個人 | [數量] | [數量] | [數量] | [數量] |

---

**注意**：所有等級的鉤子 (hooks) 會平行執行。如果任何等級封鎖一個操作，該操作就會被封鎖。
