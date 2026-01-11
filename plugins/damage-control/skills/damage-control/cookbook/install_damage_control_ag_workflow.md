---
model: opus
description: 安裝損害控制 (Damage Control) 安全鉤子系統 (security hooks system) 的互動式工作流程
---

# 目的

引導使用者在其選擇的設定等級（全域、專案或專案個人）安裝損害控制 (Damage Control) 安全鉤子系統 (security hooks system)。使用互動式提示來確定執行環境偏好並處理衝突。

## 變數

SKILL_DIR: .claude/skills/damage-control
PATTERNS_FILE: SKILL_DIR/patterns.yaml
GLOBAL_SETTINGS: ~/.claude/settings.json
PROJECT_SETTINGS: .claude/settings.json
LOCAL_SETTINGS: .claude/settings.local.json

## 指示

- 在每個決策點使用 AskUserQuestion 工具引導使用者
- 安裝前檢查現有設定
- 妥善處理合併/覆寫衝突
- 複製適當的鉤子實作（Python 或 TypeScript）
- 確保 patterns.yaml 檔案包含在鉤子中
- 複製後透過檢查檔案是否存在來驗證安裝

## 工作流程

### 步驟 1：確定安裝等級

1. 使用 AskUserQuestion 詢問使用者要安裝到哪裡：

```
問題：「您想要在哪裡安裝損害控制 (Damage Control)？」
選項：
- 全域（影響所有專案）- ~/.claude/settings.json
- 專案（與團隊共用）- .claude/settings.json
- 專案個人（僅限您自己）- .claude/settings.local.json
```

2. 將選擇的路徑儲存為 TARGET_SETTINGS

### 步驟 2：檢查現有設定

3. 使用 Read 工具檢查 TARGET_SETTINGS 是否存在

4. **如果設定檔不存在**：繼續步驟 3（全新安裝）

5. **如果設定檔存在**：使用 AskUserQuestion：

```
問題：「在 [TARGET_SETTINGS] 找到現有設定。您想如何處理？」
選項：
- 合併（將現有鉤子與 damage-control 結合）
- 覆寫（用 damage-control 設定取代）
- 停止（取消安裝）
```

6. 處理回應：
   - **合併**：讀取現有檔案，合併鉤子陣列，寫入組合結果
   - **覆寫**：繼續步驟 3（全新安裝）
   - **停止**：報告「安裝已取消」並結束工作流程

### 步驟 3：選擇執行環境

7. 使用 AskUserQuestion：

```
問題：「您想使用哪個執行環境？」
選項：
- Python with UV（推薦）- 輕量、啟動快速
- TypeScript with Bun - 如果您偏好 TypeScript
```

8. 將選擇儲存為 RUNTIME（「python」或「typescript」）

### 步驟 4：安裝鉤子檔案

9. 根據 RUNTIME，確定來源目錄：
   - Python：`${SKILL_DIR}/hooks/damage-control-python/`
   - TypeScript：`${SKILL_DIR}/hooks/damage-control-typescript/`

10. 根據 TARGET_SETTINGS 確定目標鉤子目錄：
    - 全域：`~/.claude/hooks/damage-control/`
    - 專案/本地：`.claude/hooks/damage-control/`

11. 如果目標鉤子目錄不存在則建立：
```bash
mkdir -p [TARGET_HOOKS_DIR]
```

12. 從執行環境特定目錄複製鉤子腳本：
```bash
cp [SOURCE_DIR]/*.py [TARGET_HOOKS_DIR]/   # Python 用
# 或
cp [SOURCE_DIR]/*.ts [TARGET_HOOKS_DIR]/   # TypeScript 用
```

13. 從技能根目錄複製共用的 patterns.yaml：
```bash
cp SKILL_DIR/patterns.yaml [TARGET_HOOKS_DIR]/
```

### 步驟 5：安裝設定配置

14. 讀取適當的設定範本：
    - Python：`${SKILL_DIR}/hooks/damage-control-python/python-settings.json`
    - TypeScript：`${SKILL_DIR}/hooks/damage-control-typescript/typescript-settings.json`

15. **全新安裝或覆寫時**：
    - 將設定範本寫入 TARGET_SETTINGS
    - 更新 settings.json 中的路徑以符合 TARGET_HOOKS_DIR

16. **合併時**：
    - 解析現有設定 JSON
    - 解析範本設定 JSON
    - 合併 hooks.PreToolUse 陣列（附加 damage-control 鉤子）
    - 合併 hooks.PermissionRequest 陣列
    - 合併 permissions.deny 和 permissions.ask 陣列
    - 將合併結果寫入 TARGET_SETTINGS

### 步驟 6：驗證安裝

17. 驗證所有檔案存在：
```bash
ls -la [TARGET_HOOKS_DIR]/
```

18. 驗證設定檔已建立/更新：
```bash
cat [TARGET_SETTINGS] | head -20
```

19. 使鉤子腳本可執行：
```bash
chmod +x [TARGET_HOOKS_DIR]/*.py [TARGET_HOOKS_DIR]/*.ts 2>/dev/null || true
```

### 步驟 7：顯示執行環境安裝說明

20. 根據 RUNTIME，顯示安裝指令：

**Python (UV)**：
```
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**TypeScript (Bun)**：
```
# macOS/Linux
curl -fsSL https://bun.sh/install | bash
bun add yaml

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
bun add yaml
```

### 步驟 8：重新啟動提醒

21. **重要**：完成所有安裝步驟後，您必須告知使用者：

> **請重新啟動您的代理程式以使這些變更生效。**

這非常重要 — 鉤子 (hooks) 只在代理程式啟動時載入。

### 步驟 9：顯示設定摘要

22. 讀取並執行 [list_damage_controls.md](list_damage_controls.md) 以顯示所有等級的損害控制 (Damage Control) 設定。

## 報告

呈現安裝摘要：

## 損害控制 (Damage Control) 安裝完成

**安裝等級**：[全域/專案/專案個人]
**設定檔**：`[TARGET_SETTINGS]`
**鉤子目錄**：`[TARGET_HOOKS_DIR]`
**執行環境**：[Python/UV 或 TypeScript/Bun]

### 已安裝的檔案
- `bash-tool-damage-control.[py|ts]` - 指令模式封鎖
- `edit-tool-damage-control.[py|ts]` - 編輯路徑保護
- `write-tool-damage-control.[py|ts]` - 寫入路徑保護
- `permission-request-damage-control.[py|ts]` - SQL DELETE 確認
- `patterns.yaml` - 安全模式和受保護路徑

### 執行環境設定
[根據執行環境顯示適當的安裝指令]

### 重要

**請重新啟動您的代理程式以使這些變更生效。**

### 後續步驟
1. 執行 `/hooks` 驗證鉤子已註冊
2. 自訂 `patterns.yaml` 以加入您自己的受保護路徑

### 測試安裝
```
嘗試執行：rm -rf /tmp/test
預期結果：指令應被 damage-control 鉤子封鎖
```
