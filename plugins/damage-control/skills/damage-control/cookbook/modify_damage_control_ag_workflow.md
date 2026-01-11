---
model: opus
description: 修改現有損害控制 (Damage Control) 安全設定的互動式工作流程
---

# 目的

引導使用者修改其損害控制 (Damage Control) 安全設定。允許新增/移除受保護路徑、封鎖新指令，以及調整保護等級。

## 變數

SKILL_DIR: .claude/skills/damage-control
GLOBAL_SETTINGS: ~/.claude/settings.json
GLOBAL_PATTERNS: ~/.claude/hooks/damage-control/patterns.yaml
PROJECT_SETTINGS: .claude/settings.json
PROJECT_PATTERNS: .claude/hooks/damage-control/patterns.yaml
LOCAL_SETTINGS: .claude/settings.local.json

## 指示

- 在每個決策點使用 AskUserQuestion 工具
- 嘗試修改前務必驗證設定是否存在
- 如果找不到設定，重導至安裝工作流程
- 修改前備份 patterns.yaml
- 修改後驗證 YAML 語法
- 向使用者顯示修改前後的比較以供確認

## 工作流程

### 步驟 1：確定設定等級

1. 使用 AskUserQuestion：

```
問題：「您想修改哪個設定等級？」
選項：
- 全域（所有專案）- ~/.claude/
- 專案（與團隊共用）- .claude/
- 專案個人 - .claude/settings.local.json
```

2. 儲存選擇並設定路徑：
   - **全域**：SETTINGS=`~/.claude/settings.json`，PATTERNS=`~/.claude/hooks/damage-control/patterns.yaml`
   - **專案**：SETTINGS=`.claude/settings.json`，PATTERNS=`.claude/hooks/damage-control/patterns.yaml`
   - **本地**：SETTINGS=`.claude/settings.local.json`，PATTERNS=`.claude/hooks/damage-control/patterns.yaml`

### 步驟 2：驗證安裝是否存在

3. 使用 Read 工具檢查 SETTINGS 和 PATTERNS 檔案是否存在

4. **如果任一檔案不存在**：
   - 報告：「此等級尚未安裝損害控制 (Damage Control)。」
   - 使用 AskUserQuestion：
   ```
   問題：「您要現在安裝損害控制 (Damage Control) 嗎？」
   選項：
   - 是，安裝它
   - 否，取消
   ```
   - 如果選是：讀取並執行 [install_damage_control_ag_workflow.md](install_damage_control_ag_workflow.md)
   - 如果選否：結束工作流程

5. **如果兩個檔案都存在**：繼續步驟 3

### 步驟 3：確定修改類型

6. 使用 AskUserQuestion：

```
問題：「您想修改什麼？」
選項：
- 新增/移除受保護路徑（限制檔案/目錄存取）
- 新增/移除被封鎖的指令（封鎖特定 bash 指令）
- 檢視目前設定
```

### 分支 A：修改受保護路徑

7. **如果選擇「新增/移除受保護路徑」**：使用 AskUserQuestion：

```
問題：「您想執行什麼動作？」
選項：
- 新增受保護路徑
- 移除現有的受保護路徑
- 列出所有受保護路徑
```

8. **新增受保護路徑**：
   a. 使用 AskUserQuestion：
   ```
   問題：「此路徑應該有什麼保護等級？」
   選項：
   - 零存取（禁止所有操作 — 用於密鑰/憑證）
   - 唯讀（可讀取，不可修改 — 用於設定檔）
   - 禁止刪除（可讀取/寫入/編輯，不可刪除 — 用於重要檔案）
   ```

   b. 使用 AskUserQuestion（預期透過「其他」輸入文字）：
   ```
   問題：「輸入要保護的路徑（例如 ~/.aws/、/etc/passwd、./config/）：」
   選項：
   - ~/.ssh/（常見密鑰目錄）
   - ~/.aws/（雲端憑證）
   - 其他（輸入自訂路徑）
   ```

   c. 讀取目前的 patterns.yaml

   d. 將路徑加入適當的區段：
      - 零存取 → `zeroAccessPaths`
      - 唯讀 → `readOnlyPaths`
      - 禁止刪除 → `noDeletePaths`

   e. 寫入更新後的 patterns.yaml

   f. 顯示確認及修改前後比較

9. **移除受保護路徑**：
   a. 讀取 patterns.yaml 並列出所有受保護路徑
   b. 使用 AskUserQuestion 選擇要移除的路徑
   c. 從適當的區段移除路徑
   d. 寫入更新後的 patterns.yaml

10. **列出受保護路徑**：
    a. 讀取 patterns.yaml
    b. 按類別顯示格式化的所有路徑清單

### 分支 B：修改被封鎖的指令

11. **如果選擇「新增/移除被封鎖的指令」**：使用 AskUserQuestion：

```
問題：「您想執行什麼動作？」
選項：
- 新增被封鎖的指令模式
- 移除現有模式
- 列出所有被封鎖的模式
```

12. **新增被封鎖的模式**：
    a. 使用 AskUserQuestion：
    ```
    問題：「您想如何指定要封鎖的指令？」
    選項：
    - 輸入確切指令（例如「npm publish」）
    - 用自然語言描述（我會建立正規表達式）
    ```

    b. **如果選擇確切指令**：
       - 跳脫特殊正規表達式字元
       - 建立模式：`\b[escaped_command]\b`
       - 詢問原因/描述

    c. **如果選擇自然語言**：
       - 解析描述
       - 產生適當的正規表達式模式
       - 向使用者顯示模式以供確認

    d. 讀取 patterns.yaml

    e. 加入到 `bashToolPatterns`：
    ```yaml
    - pattern: '[generated_pattern]'
      reason: '[user_reason]'
    ```

    f. 寫入更新後的 patterns.yaml

13. **移除模式**：
    a. 讀取 patterns.yaml 並列出所有模式
    b. 使用 AskUserQuestion 選擇要移除的模式
    c. 移除模式
    d. 寫入更新後的 patterns.yaml

### 分支 C：檢視設定

14. **如果選擇「檢視目前設定」**：
    a. 讀取 patterns.yaml
    b. 讀取 settings.json
    c. 顯示格式化的設定

### 步驟 4：確認並套用變更

15. 任何修改後，顯示變更：

```
## 建議的變更

**檔案**：[PATTERNS 或 SETTINGS]

**修改前**：
[修改前的相關區段]

**修改後**：
[修改後的相關區段]
```

16. 使用 AskUserQuestion：
```
問題：「套用此變更？」
選項：
- 是，套用
- 否，取消
```

17. **如果選是**：寫入變更
18. **如果選否**：捨棄變更並報告取消

### 步驟 5：重新啟動提醒

19. **重要**：套用任何修改後，您必須告知使用者：

> **請重新啟動您的代理程式以使這些變更生效。**

這非常重要 — 鉤子和模式只在代理程式啟動時載入。

## 報告

呈現修改摘要：

## 損害控制 (Damage Control) 設定已更新

**設定等級**：[全域/專案/專案個人]
**修改類型**：[路徑保護/指令封鎖/檢視]

### 已做的變更

[路徑保護]
**動作**：新增/移除路徑
**路徑**：`[path]`
**保護等級**：[零存取/唯讀/禁止刪除]

[指令封鎖]
**動作**：新增/移除模式
**模式**：`[pattern]`
**原因**：[reason]

### 目前設定摘要

**零存取路徑 (Zero Access Paths)**（禁止操作）：
- [列出路徑]

**唯讀路徑 (Read Only Paths)**（僅讀取）：
- [列出路徑]

**禁止刪除路徑 (No Delete Paths)**（禁止刪除）：
- [列出路徑]

**被封鎖的指令模式 (Blocked Command Patterns)**：[數量] 個模式

### 重要

**請重新啟動您的代理程式以使這些變更生效。**

### 驗證
變更已寫入：
- `[PATTERNS 檔案路徑]`

重新啟動後執行 `/hooks` 驗證變更已生效。
