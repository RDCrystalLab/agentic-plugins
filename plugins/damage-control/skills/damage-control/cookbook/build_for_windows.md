---
model: opus
description: 將損害控制 (Damage Control) 模式轉換為 Windows（PowerShell/cmd）相容格式
---

# 目的

更新現有的損害控制 (Damage Control) 安裝，使其能在 Windows 機器上運作，將 Unix 模式轉換為 Windows PowerShell 和 cmd 等效指令。

## 變數

GLOBAL_PATTERNS: ~/.claude/hooks/damage-control/patterns.yaml
PROJECT_PATTERNS: .claude/hooks/damage-control/patterns.yaml

## 指示

- 檢查現有的損害控制 (damage control) 安裝
- 如果尚未安裝，詢問使用者是否要先安裝
- 將 Unix 指令模式轉換為 Windows 等效指令
- 加入 Windows 特定的危險模式
- 保留現有的路徑保護（路徑可跨平台使用）
- 不要移除 Unix 模式 — 在其旁邊加入 Windows 模式

**重要**：這會建立一個可同時在 Unix 和 Windows 上運作的跨平台 patterns.yaml。

## Windows 指令對應表

| Unix 指令 | Windows PowerShell | Windows cmd |
|--------------|-------------------|-------------|
| `rm -rf` | `Remove-Item -Recurse -Force` | `rd /s /q`、`del /f /s /q` |
| `rm -r` | `Remove-Item -Recurse` | `rd /s` |
| `chmod 777` | `icacls * /grant Everyone:F` | `icacls` |
| `chown` | `takeown`、`icacls` | `takeown` |
| `sudo rm` | `Start-Process -Verb RunAs` | 不適用 |
| `git reset --hard` | 相同 | 相同 |
| `git push --force` | 相同 | 相同 |
| `mkfs` | `Format-Volume` | `format` |
| `dd` | 不適用 | 不適用 |
| `kill -9` | `Stop-Process -Force` | `taskkill /F` |
| `history -c` | `Clear-History` | `doskey /reinstall` |

## 工作流程

### 步驟 1：確定安裝等級

1. 使用 AskUserQuestion：

```
問題：「您想要更新哪個損害控制 (Damage Control) 安裝以支援 Windows？」
選項：
- 全域 (Global)（~/.claude/hooks/damage-control/）
- 專案 (Project)（.claude/hooks/damage-control/）
- 專案個人 (Project Personal)（相同位置，不同設定檔）
```

2. 根據選擇設定 PATTERNS_FILE

### 步驟 2：檢查安裝是否存在

3. 讀取 PATTERNS_FILE 檢查是否存在

4. **如果找不到**：使用 AskUserQuestion：
```
問題：「此等級尚未安裝損害控制 (Damage Control)。您要先安裝嗎？」
選項：
- 是，先安裝（然後執行 Windows 轉換）
- 否，取消
```

5. 如果選「是」→ 讀取並執行 [install_damage_control_ag_workflow.md](install_damage_control_ag_workflow.md)，然後繼續

### 步驟 3：讀取目前模式

6. 讀取現有的 patterns.yaml 檔案
7. 解析 `bashToolPatterns` 區段

### 步驟 4：加入 Windows 模式

8. 將以下 Windows 特定模式加入 `bashToolPatterns`：

```yaml
# ---------------------------------------------------------------------------
# WINDOWS 破壞性檔案操作 (PowerShell)
# ---------------------------------------------------------------------------
- pattern: '\bRemove-Item\s+.*-Recurse'
  reason: Remove-Item 帶 -Recurse 旗標（PowerShell rm -rf 等效指令）

- pattern: '\bRemove-Item\s+.*-Force'
  reason: Remove-Item 帶 -Force 旗標（PowerShell rm -f 等效指令）

- pattern: '\bri\s+.*-Recurse'
  reason: ri（Remove-Item 別名）帶 -Recurse

- pattern: '\bdel\s+.*-Recurse'
  reason: del（Remove-Item 別名）帶 -Recurse

- pattern: '\bRemove-Item\s+-Path\s+[''"]?[\\/\*]'
  reason: Remove-Item 針對根路徑

# ---------------------------------------------------------------------------
# WINDOWS 破壞性檔案操作 (cmd)
# ---------------------------------------------------------------------------
- pattern: '\brd\s+/s'
  reason: rd /s（遞迴刪除目錄）

- pattern: '\brmdir\s+/s'
  reason: rmdir /s（遞迴刪除目錄）

- pattern: '\bdel\s+/[fF]'
  reason: del /f（強制刪除）

- pattern: '\bdel\s+/[sS]'
  reason: del /s（遞迴刪除）

- pattern: '\berase\s+/[fFsS]'
  reason: erase 帶強制/遞迴旗標

# ---------------------------------------------------------------------------
# WINDOWS 權限變更
# ---------------------------------------------------------------------------
- pattern: '\bicacls\s+.*Everyone:F'
  reason: icacls 授予 Everyone 完全控制權限

- pattern: '\bicacls\s+.*\*:F'
  reason: icacls 授予完全控制權限

- pattern: '\btakeown\s+/[rR]'
  reason: takeown 帶遞迴旗標

- pattern: '\battrib\s+.*-[rRhHsS]'
  reason: attrib 移除保護屬性

# ---------------------------------------------------------------------------
# WINDOWS 程序終止
# ---------------------------------------------------------------------------
- pattern: '\bStop-Process\s+.*-Force'
  reason: Stop-Process -Force（PowerShell kill -9）

- pattern: '\btaskkill\s+/[fF]'
  reason: taskkill /F（強制終止）

- pattern: '\btaskkill\s+.*\/IM\s+\*'
  reason: taskkill 針對所有程序

- pattern: '\bkill\s+.*-Force'
  reason: kill 別名帶 -Force

# ---------------------------------------------------------------------------
# WINDOWS 系統操作
# ---------------------------------------------------------------------------
- pattern: '\bFormat-Volume'
  reason: Format-Volume（磁碟格式化）

- pattern: '\bformat\s+[a-zA-Z]:'
  reason: format 指令針對磁碟機

- pattern: '\bClear-Disk'
  reason: Clear-Disk（清除磁碟）

- pattern: '\bInitialize-Disk'
  reason: Initialize-Disk（可能破壞分割區）

# ---------------------------------------------------------------------------
# WINDOWS 歷史/Shell 操作
# ---------------------------------------------------------------------------
- pattern: '\bClear-History'
  reason: Clear-History（PowerShell 清除歷史）

- pattern: '\bdoskey\s+/reinstall'
  reason: doskey /reinstall（cmd 清除歷史）

# ---------------------------------------------------------------------------
# WINDOWS 登錄檔（危險）
# ---------------------------------------------------------------------------
- pattern: '\bRemove-ItemProperty\s+.*HKLM:'
  reason: 移除 HKEY_LOCAL_MACHINE 登錄檔機碼

- pattern: '\bRemove-Item\s+.*HKLM:'
  reason: 移除 HKEY_LOCAL_MACHINE 登錄檔路徑

- pattern: '\breg\s+delete\s+HKLM'
  reason: reg delete 針對 HKEY_LOCAL_MACHINE

- pattern: '\breg\s+delete\s+.*\/f'
  reason: reg delete 帶強制旗標
```

### 步驟 5：寫入更新後的模式

9. 寫入已加入 Windows 模式的更新版 patterns.yaml

10. 向使用者顯示已加入的內容

### 步驟 6：重新啟動提醒

11. **重要**：告知使用者：

> **請重新啟動您的代理程式以使這些變更生效。**

## 報告

呈現更新摘要：

---

## 損害控制 (Damage Control) 已更新為 Windows 版本

**安裝等級**：[全域/專案/專案個人]
**模式檔案**：`[PATTERNS_FILE]`

### 已加入的 Windows 模式

**PowerShell 破壞性操作**：
- `Remove-Item -Recurse/-Force`
- `ri`、`del` 別名帶遞迴旗標

**cmd 破壞性操作**：
- `rd /s`、`rmdir /s`
- `del /f /s`、`erase`

**權限變更**：
- `icacls` 授予完全控制權限
- `takeown` 帶遞迴旗標

**程序終止**：
- `Stop-Process -Force`
- `taskkill /F`

**系統操作**：
- `Format-Volume`、`format`
- `Clear-Disk`、`Initialize-Disk`

**登錄檔保護**：
- `Remove-ItemProperty` 針對 HKLM
- `reg delete` 針對 HKLM

### 現有 Unix 模式

所有現有的 Unix 模式已保留。您的 patterns.yaml 現在可同時在 Unix 和 Windows 上運作。

### 重要

**請重新啟動您的代理程式以使這些變更生效。**

### 後續步驟

1. 檢視更新後的 patterns.yaml
2. 加入任何額外需要保護的 Windows 特定路徑
3. 使用「test damage control」進行測試
