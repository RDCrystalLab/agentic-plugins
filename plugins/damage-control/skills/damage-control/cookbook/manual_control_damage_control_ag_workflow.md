---
model: opus
description: 提供手動設定損害控制 (Damage Control) 的指引，不使用自動化工作流程
---

# 目的

說明如何手動設定損害控制 (Damage Control) 安全鉤子系統 (security hooks system)。提供文件和指引，不執行自動化工作流程 — 適合偏好直接控制的使用者。

## 變數

無（僅提供資訊）

## 指示

- 首先詢問使用者想了解什麼
- 提供清楚、詳細的說明
- 顯示確切的檔案路徑和格式
- 包含可複製貼上的範例
- 不要執行任何安裝或修改指令
- 這純粹是教育/文件性質

## 工作流程

### 步驟 1：了解使用者目標

1. 使用 AskUserQuestion：

```
問題：「您想了解損害控制 (Damage Control) 的哪些內容？」
選項：
- 了解系統架構
- 學習如何編輯 patterns.yaml
- 學習如何編輯 settings.json
- 學習如何測試鉤子
- 查看所有檔案位置
```

### 分支 A：系統架構

2. **如果選擇「了解系統架構」**：

說明以下內容：

---

## 損害控制架構 (Damage Control Architecture)

### 概述

損害控制 (Damage Control) 使用 Claude Code 的**鉤子系統 (hook system)** 在工具呼叫執行前攔截。它提供三層保護：

```
┌─────────────────────────────────────────────┐
│           Claude Code 工具呼叫              │
└─────────────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    ▼                 ▼                 ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│  Bash   │     │  Edit   │     │  Write  │
│  Tool   │     │  Tool   │     │  Tool   │
└────┬────┘     └────┬────┘     └────┬────┘
     │               │               │
     ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ PreToolUse  │ │ PreToolUse  │ │ PreToolUse  │
│    Hook     │ │    Hook     │ │    Hook     │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       ▼               ▼               ▼
  Exit 0 = 允許   Exit 0 = 允許   Exit 0 = 允許
  Exit 2 = 封鎖   Exit 2 = 封鎖   Exit 2 = 封鎖
```

### 鉤子類型 (Hook Types)

1. **PreToolUse 鉤子**：在工具執行前執行
   - `bash-tool-damage-control` - 檢查 bash 指令是否符合模式
   - `edit-tool-damage-control` - 檢查編輯路徑
   - `write-tool-damage-control` - 檢查寫入路徑

2. **PermissionRequest 鉤子**：需要使用者確認時執行
   - `permission-request-damage-control` - 強制 DELETE 操作確認

### 結束碼 (Exit Codes)

| 代碼 | 意義 | 行為 |
|------|------|------|
| 0 | 允許 | 工具呼叫繼續執行 |
| 2 | 封鎖 | 工具呼叫被封鎖，stderr 顯示給 Claude |

### 設定檔

| 檔案 | 用途 |
|------|------|
| `settings.json` | 向 Claude Code 註冊鉤子 |
| `patterns.yaml` | 定義被封鎖的模式和受保護路徑 |

---

### 分支 B：編輯 patterns.yaml

3. **如果選擇「學習如何編輯 patterns.yaml」**：

---

## 編輯 patterns.yaml

### 檔案位置

`patterns.yaml` 檔案位於您的鉤子目錄中：

- **全域**：`~/.claude/hooks/damage-control/patterns.yaml`
- **專案**：`.claude/hooks/damage-control/patterns.yaml`

### 檔案結構

```yaml
# 危險的 bash 指令模式
bashToolPatterns:
  - pattern: '\brm\s+-[rRf]'
    reason: rm 帶遞迴或強制旗標
  - pattern: '\bgit\s+reset\s+--hard\b'
    reason: git reset --hard

# 完全禁止存取（密鑰/憑證）
zeroAccessPaths:
  - ~/.ssh/
  - ~/.aws/
  - ~/.gnupg/

# 允許讀取，禁止修改
readOnlyPaths:
  - /etc/
  - ~/.bashrc
  - ~/.zshrc

# 允許除刪除外的所有操作
noDeletePaths:
  - .claude/hooks/
  - .claude/commands/

# 稽核日誌位置
logFile: .claude/security-audit.log
```

### 加入被封鎖的模式

要封鎖新指令，加入到 `bashToolPatterns`：

```yaml
bashToolPatterns:
  # ... 現有模式 ...
  - pattern: '\bnpm\s+publish\b'
    reason: 為安全起見封鎖 npm publish
```

**模式技巧**：
- 使用 `\b` 表示字詞邊界
- 使用 `\s+` 表示空白
- 跳脫特殊字元：`.` 變成 `\.`
- 模式不區分大小寫

### 加入受保護路徑

根據保護等級選擇適當的區段：

```yaml
# 用於密鑰（封鎖所有存取包括讀取）
zeroAccessPaths:
  - ~/.my-secrets/

# 用於設定檔（允許讀取，封鎖寫入）
readOnlyPaths:
  - /my/config/dir/

# 用於重要檔案（允許除刪除外的所有操作）
noDeletePaths:
  - ./important-data/
```

### 驗證

編輯後，驗證 YAML 語法：
```bash
python -c "import yaml; yaml.safe_load(open('patterns.yaml'))"
```

---

### 分支 C：編輯 settings.json

4. **如果選擇「學習如何編輯 settings.json」**：

---

## 編輯 settings.json

### 檔案位置

| 等級 | 路徑 |
|------|------|
| 全域 | `~/.claude/settings.json` |
| 專案 | `.claude/settings.json` |
| 專案個人 | `.claude/settings.local.json` |

### 最小設定

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/damage-control/bash-tool-damage-control.py",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

### 完整設定

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/damage-control/bash-tool-damage-control.py",
            "timeout": 5
          }
        ]
      },
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/damage-control/edit-tool-damage-control.py",
            "timeout": 5
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/damage-control/write-tool-damage-control.py",
            "timeout": 5
          }
        ]
      }
    ],
    "PermissionRequest": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/damage-control/permission-request-damage-control.py",
            "timeout": 5
          }
        ]
      }
    ]
  },
  "permissions": {
    "deny": [
      "Bash(rm -rf /*:*)",
      "Bash(rm -rf ~/*:*)",
      "Bash(sudo rm -rf:*)"
    ],
    "ask": [
      "Bash(git push --force:*)",
      "Bash(git reset --hard:*)"
    ]
  }
}
```

### 關鍵點

- `$CLAUDE_PROJECT_DIR` 會解析為專案根目錄
- Python 使用 `.py` 副檔名，TypeScript 使用 `.ts`
- `timeout` 單位為秒
- `matcher` 支援正規表達式：`"Edit|Write"` 可同時符合兩者

---

### 分支 D：測試鉤子

5. **如果選擇「學習如何測試鉤子」**：

---

## 測試損害控制鉤子 (Damage Control Hooks)

### 驗證鉤子已註冊

在 Claude Code 中執行：
```
/hooks
```

您應該會看到列出的 PreToolUse 和 PermissionRequest 鉤子。

### 手動鉤子測試

從命令列直接測試鉤子：

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"rm -rf /"}}' | \
  .claude/hooks/damage-control/bash-tool-damage-control.py

echo $?  # 應該輸出 2（已封鎖）
```

### 在 Claude Code 中測試

嘗試這些指令（它們應該被封鎖）：

```bash
# 測試 bashToolPatterns 封鎖
rm -rf /tmp/test

# 測試 noDeletePaths
rm .claude/hooks/test.txt

# 測試 zeroAccessPaths
cat ~/.ssh/id_rsa
```

### 互動式測試器

如果可用，使用模式測試器：

```bash
cd .claude/hooks/damage-control
./tester.py
```

### 除錯模式

使用除錯日誌執行 Claude Code：

```bash
claude --debug
```

這會顯示鉤子執行的詳細資訊。

---

### 分支 E：檔案位置

6. **如果選擇「查看所有檔案位置」**：

---

## 檔案位置參考

### 全域安裝

```
~/.claude/
├── settings.json                    # 鉤子設定
└── hooks/
    └── damage-control/
        ├── bash-tool-damage-control.py
        ├── edit-tool-damage-control.py
        ├── write-tool-damage-control.py
        ├── permission-request-damage-control.py
        └── patterns.yaml
```

### 專案安裝

```
your-project/
└── .claude/
    ├── settings.json                # 鉤子設定
    ├── settings.local.json          # 個人覆寫（已加入 gitignore）
    └── hooks/
        └── damage-control/
            ├── bash-tool-damage-control.py
            ├── edit-tool-damage-control.py
            ├── write-tool-damage-control.py
            ├── permission-request-damage-control.py
            └── patterns.yaml
```

### 設定優先順序

1. **受管理設定 (Managed settings)**（企業版）- 最高
2. **本地專案 (Local project)**（`.claude/settings.local.json`）
3. **共用專案 (Shared project)**（`.claude/settings.json`）
4. **使用者全域 (User global)**（`~/.claude/settings.json`）- 最低

---

## 報告

以清楚、格式良好的方式呈現所請求的資訊。包含程式碼區塊以便複製貼上，並使用表格以便快速參考。

**注意**：此工作流程僅提供文件。此工作流程期間不會修改任何檔案。
