---
name: Damage Control
version: 1.0.0
description: This skill should be used when the user asks to "install damage control", "setup security hooks", "deploy damage control", "add protection", "block dangerous commands", "protect sensitive files", "test damage control", "verify hooks", "安裝 damage control", "設定安全鉤子", "部署損害控制", "新增保護", "封鎖危險指令", "保護敏感檔案", "測試 damage control", "驗證鉤子", or mentions damage control, security hooks (安全鉤子), protected paths (受保護路徑), blocked commands (封鎖指令), zero access paths (零存取路徑), read only paths (唯讀路徑), install security (安裝安全功能), modify protection (修改保護設定).
---

# 損害控制技能 (Damage Control Skill)

為 Claude Code 提供深度防禦 (defense-in-depth) 保護系統。透過 PreToolUse 鉤子 (hooks) 封鎖危險指令並保護敏感檔案。

## 概述

此技能協助使用者部署和管理損害控制 (Damage Control) 安全系統，提供以下功能：

- **指令模式封鎖 (Command Pattern Blocking)**：封鎖危險的 bash 指令（如 rm -rf、git reset --hard 等）
- **詢問模式 (Ask Patterns)**：對於有風險但合理的操作觸發確認對話框（`ask: true`）
- **路徑保護等級 (Path Protection Levels)**：
  - `zeroAccessPaths` - 零存取路徑：完全禁止存取（用於密鑰/憑證）
  - `readOnlyPaths` - 唯讀路徑：允許讀取，封鎖修改
  - `noDeletePaths` - 禁止刪除路徑：允許所有操作，但禁止刪除

## 技能結構

```
.claude/skills/damage-control/
├── SKILL.md                     # 此檔案
├── patterns.yaml                # 共用安全模式（單一事實來源）
├── cookbook/
│   ├── install_damage_control_ag_workflow.md
│   ├── modify_damage_control_ag_workflow.md
│   ├── manual_control_damage_control_ag_workflow.md
│   ├── list_damage_controls.md
│   ├── test_damage_control.md
│   └── build_for_windows.md
├── hooks/
│   ├── damage-control-python/   # Python/UV 實作
│   │   ├── bash-tool-damage-control.py
│   │   ├── edit-tool-damage-control.py
│   │   ├── write-tool-damage-control.py
│   │   ├── python-settings.json
│   │   └── test-damage-control.py
│   └── damage-control-typescript/  # Bun/TypeScript 實作
│       ├── bash-tool-damage-control.ts
│       ├── edit-tool-damage-control.ts
│       ├── write-tool-damage-control.ts
│       ├── typescript-settings.json
│       └── test-damage-control.ts
└── test-prompts/                # 驗證用測試提示
    ├── sentient_v1.md
    ├── sentient_v2.md
    ├── sentient_v3.md
    └── sentient_v4.md
```

## 安裝後

安裝工作流程會根據選擇的等級複製鉤子 (hooks) 並建立設定：

### 全域鉤子 (Global Hooks)
```
~/.claude/
├── settings.json                      # 鉤子設定
└── hooks/
    └── damage-control/
        ├── patterns.yaml
        ├── bash-tool-damage-control.py（或 .ts）
        ├── edit-tool-damage-control.py
        └── write-tool-damage-control.py
```

### 專案鉤子 (Project Hooks)
```
<代理程式目前工作目錄>/
└── .claude/
    ├── settings.json                  # 鉤子設定（共用）
    └── hooks/
        └── damage-control/
            ├── patterns.yaml
            ├── bash-tool-damage-control.py（或 .ts）
            ├── edit-tool-damage-control.py
            └── write-tool-damage-control.py
```

### 專案個人鉤子 (Project Personal Hooks)
```
<代理程式目前工作目錄>/
└── .claude/
    ├── settings.local.json            # 個人覆寫設定（已加入 gitignore）
    └── hooks/
        └── damage-control/
            ├── patterns.yaml
            ├── bash-tool-damage-control.py（或 .ts）
            ├── edit-tool-damage-control.py
            └── write-tool-damage-control.py
```

---

## 操作指南 (Cookbook)

本節定義處理使用者請求的決策樹。根據使用者所說的內容，讀取並執行適當的工作流程提示。

### 安裝路徑

**觸發語句**：「install damage control」、「setup security hooks」、「deploy damage control」、「add protection」

**工作流程**：讀取並執行 [cookbook/install_damage_control_ag_workflow.md](cookbook/install_damage_control_ag_workflow.md)

### 修改路徑

**觸發語句**：「help me modify damage control」、「update protection」、「change blocked paths」、「add restricted directory」

**工作流程**：讀取並執行 [cookbook/modify_damage_control_ag_workflow.md](cookbook/modify_damage_control_ag_workflow.md)

### 手動控制路徑

**觸發語句**：「how do I manually update」、「explain damage control config」、「show me the settings」

**工作流程**：讀取並執行 [cookbook/manual_control_damage_control_ag_workflow.md](cookbook/manual_control_damage_control_ag_workflow.md)

### 測試路徑

**觸發語句**：
    - 「test damage control」
    - 「run damage control tests」
    - 「verify hooks are working」
    - 「damage control test this command <x>」
    - 「damage control test this read to this path <x>」
    - 「damage control test this write to this path <x>」
    - 「damage control test this delete to this path <x>」
    - 「damage control test this run this command <x>」

**工作流程**：讀取並執行 [cookbook/test_damage_control.md](cookbook/test_damage_control.md)

**功能說明**：
- 讀取 patterns.yaml 取得所有已設定的模式和路徑
- 使用結束碼 (exit code) 驗證測試 PreToolUse 鉤子（bash、edit、write）
- 使用 JSON 輸出驗證測試詢問模式 (ask patterns)
- 報告每個測試案例的通過/失敗狀態
- 提供所有結果的摘要

### Windows 建置路徑

**觸發語句**：「build for windows」、「add windows patterns」、「convert to windows」、「windows damage control」

**工作流程**：讀取並執行 [cookbook/build_for_windows.md](cookbook/build_for_windows.md)

**功能說明**：
- 檢查現有安裝
- 在 Unix 模式旁邊加入 Windows PowerShell 和 cmd 模式
- 建立可在兩種系統上運作的跨平台 patterns.yaml

### 直接指令路徑

**觸發語句**：「update global read only paths to include X」、「add /secret to zero access paths」、「block command Y」

**動作**：直接執行，無需提示 — 使用者已熟悉系統。

**範例**：
- 「add ~/.credentials to zero access paths」→ 直接編輯 patterns.yaml
- 「block the command 'npm publish'」→ 將模式加入 bashToolPatterns
- 「make /var/log read only」→ 加入 readOnlyPaths

---

## 快速參考

### 設定檔位置

| 等級            | 路徑                          | 範圍                      |
| --------------- | ----------------------------- | ------------------------- |
| 全域 (Global)   | `~/.claude/settings.json`     | 所有專案                  |
| 專案 (Project)  | `.claude/settings.json`       | 目前專案（共用）          |
| 專案個人 (Project Personal) | `.claude/settings.local.json` | 目前專案（個人）|

### 路徑保護等級

| 類型              | 讀取 | 寫入 | 編輯 | 刪除 | 使用情境                |
| ----------------- | ---- | ---- | ---- | ---- | ----------------------- |
| `zeroAccessPaths` | 否   | 否   | 否   | 否   | 密鑰、憑證              |
| `readOnlyPaths`   | 是   | 否   | 否   | 否   | 系統設定檔、歷史記錄    |
| `noDeletePaths`   | 是   | 是   | 是   | 否   | 重要專案檔案            |

### 執行環境需求

| 實作       | 執行環境    | 安裝指令                                                    |
| ---------- | ----------- | ----------------------------------------------------------- |
| Python     | UV (Astral) | `curl -LsSf https://astral.sh/uv/install.sh \| sh`          |
| TypeScript | Bun         | `curl -fsSL https://bun.sh/install \| bash && bun add yaml` |

### 結束碼 (Exit Codes)

| 代碼 | 意義                              |
| ---- | --------------------------------- |
| 0    | 允許操作                          |
| 0    | 詢問（JSON 輸出觸發對話框）       |
| 2    | 封鎖操作                          |

---

## 測試

使用 [test-prompts/](test-prompts/) 中的測試提示來驗證鉤子：

- `sentient_v1.md` - 測試 `rm -rf` 封鎖（bashToolPatterns）
- `sentient_v2.md` - 測試 `find -delete` 封鎖（noDeletePaths）
- `sentient_v3.md` - 測試詢問模式（帶 ID 的 SQL DELETE）
- `sentient_v4.md` - 測試簡單指令封鎖

執行測試：
```
/project:test-prompts/sentient_v1
```

---

## 相關檔案

- [cookbook/install_damage_control_ag_workflow.md](cookbook/install_damage_control_ag_workflow.md) - 安裝工作流程
- [cookbook/modify_damage_control_ag_workflow.md](cookbook/modify_damage_control_ag_workflow.md) - 修改工作流程
- [cookbook/manual_control_damage_control_ag_workflow.md](cookbook/manual_control_damage_control_ag_workflow.md) - 手動指引
- [cookbook/list_damage_controls.md](cookbook/list_damage_controls.md) - 列出所有設定
- [cookbook/test_damage_control.md](cookbook/test_damage_control.md) - 測試所有鉤子
- [cookbook/build_for_windows.md](cookbook/build_for_windows.md) - 加入 Windows 模式
- [hooks/damage-control-python/](hooks/damage-control-python/) - Python 實作
- [hooks/damage-control-typescript/](hooks/damage-control-typescript/) - TypeScript 實作
