---
model: opus
description: 透過對 patterns.yaml 執行測試腳本來測試所有損害控制 (Damage Control) 鉤子
---

# 目的

透過讀取 patterns.yaml 並針對每個已設定的模式和受保護路徑執行測試案例，驗證所有損害控制 (Damage Control) 鉤子是否正常運作。

## 變數

HOOKS_DIR: .claude/hooks/damage-control
PATTERNS_FILE: .claude/hooks/damage-control/patterns.yaml（如果在專案中）或 ~/.claude/hooks/damage-control/patterns.yaml（如果是全域）

## 指示

- 讀取 patterns.yaml 檔案以取得所有已設定的模式和路徑
- 對於每個模式/路徑，使用適當的參數呼叫測試腳本
- 測試腳本會將 JSON 回送到鉤子中 — 它不會執行實際指令
- 追蹤通過/失敗計數並在結束時報告摘要
- 使用 Python 測試腳本（`uv run test-damage-control.py`）或 TypeScript（`bun run test-damage-control.ts`）

**重要**：您是透過將模擬資料傳入鉤子來測試。不要執行實際的危險指令。不會執行任何實際的危險指令。

## 工作流程

### 步驟 0：判斷是專案還是全域

1. 檢查目前工作目錄是專案還是全域
   - 如果是專案 → 設定 PATTERNS_FILE 為 .claude/hooks/damage-control/patterns.yaml
   - 如果是全域 → 設定 PATTERNS_FILE 為 ~/.claude/hooks/damage-control/patterns.yaml

### 步驟 1：確定執行環境

1. 查看鉤子目錄檢查安裝了哪個執行環境：
   - 如果存在 `.py` 檔案 → 使用 `uv run test-damage-control.py`
   - 如果存在 `.ts` 檔案 → 使用 `bun run test-damage-control.ts`

2. 設定 TEST_CMD 為適當的指令

### 步驟 2：讀取設定

3. 從 HOOKS_DIR 讀取 patterns.yaml 檔案

4. 擷取以下區段：
   - `bashToolPatterns` - 要封鎖的指令模式
   - `zeroAccessPaths` - 禁止存取的路徑
   - `readOnlyPaths` - 唯讀存取的路徑
   - `noDeletePaths` - 不可刪除的路徑

### 步驟 3：測試 bashToolPatterns

5. 對於 `bashToolPatterns` 中的每個模式，產生符合該模式的測試指令：

| 模式                       | 測試指令                           |
| -------------------------- | ---------------------------------- |
| `\brm\s+-[rRf]`            | `rm -rf /tmp/test`                 |
| `\bgit\s+reset\s+--hard`   | `git reset --hard HEAD`            |
| `\bgit\s+push\s+.*--force` | `git push --force origin main`     |
| `\bchmod\s+.*777`          | `chmod 777 /tmp/test`              |
| `\bDELETE\s+FROM`          | `sqlite3 db 'DELETE FROM users;'`  |

6. 執行每個測試：
```bash
uv run [HOOKS_DIR]/test-damage-control.py bash Bash "[test_command]" --expect-blocked
```

7. 同時測試安全指令是否被允許：
```bash
uv run [HOOKS_DIR]/test-damage-control.py bash Bash "ls -la" --expect-allowed
uv run [HOOKS_DIR]/test-damage-control.py bash Bash "git status" --expect-allowed
```

### 步驟 4：測試 zeroAccessPaths

8. 對於 `zeroAccessPaths` 中的每個路徑，測試所有存取是否被封鎖：

```bash
# 測試 bash 存取（讀取）
uv run [HOOKS_DIR]/test-damage-control.py bash Bash "cat [path]/test" --expect-blocked

# 測試編輯存取
uv run [HOOKS_DIR]/test-damage-control.py edit Edit "[path]/test.txt" --expect-blocked

# 測試寫入存取
uv run [HOOKS_DIR]/test-damage-control.py write Write "[path]/test.txt" --expect-blocked
```

### 步驟 5：測試 readOnlyPaths

9. 對於 `readOnlyPaths` 中的每個路徑，測試讀取被允許但寫入被封鎖：

```bash
# 測試 bash 讀取 - 應該被允許
uv run [HOOKS_DIR]/test-damage-control.py bash Bash "cat [path]" --expect-allowed

# 測試 bash 寫入 - 應該被封鎖
uv run [HOOKS_DIR]/test-damage-control.py bash Bash "echo test > [path]/test" --expect-blocked

# 測試編輯 - 應該被封鎖
uv run [HOOKS_DIR]/test-damage-control.py edit Edit "[path]/test.txt" --expect-blocked

# 測試寫入 - 應該被封鎖
uv run [HOOKS_DIR]/test-damage-control.py write Write "[path]/test.txt" --expect-blocked
```

### 步驟 6：測試 noDeletePaths

10. 對於 `noDeletePaths` 中的每個路徑，測試刪除被封鎖但寫入被允許：

```bash
# 測試 bash 刪除 - 應該被封鎖
uv run [HOOKS_DIR]/test-damage-control.py bash Bash "rm [path]/test.txt" --expect-blocked

# 測試 bash 寫入 - 應該被允許（noDeletePaths 允許寫入）
uv run [HOOKS_DIR]/test-damage-control.py bash Bash "echo test > [path]/test.txt" --expect-allowed
```

### 步驟 7：測試 PermissionRequest 鉤子

11. 測試 PermissionRequest 鉤子，它會強制對有風險的操作進行使用者確認。

權限鉤子 (permission hook) 使用不同的輸出：
- `--expect-ask` = 鉤子回傳 `{"decision": "ask"}`（強制使用者確認）
- `--expect-allow` = 鉤子回傳 `{"decision": "allow"}`（自動核准）

**SQL DELETE 操作** - 應該強制使用者確認：

```bash
# 帶 WHERE 的 SQL DELETE - 應該要求確認
uv run [HOOKS_DIR]/test-damage-control.py permission Bash "DELETE FROM users WHERE id=1" --expect-ask

# DELETE FROM - 應該要求確認
uv run [HOOKS_DIR]/test-damage-control.py permission Bash "sqlite3 test.db 'DELETE FROM users WHERE active=0'" --expect-ask
```

**MongoDB 刪除操作** - 應該強制使用者確認：

```bash
# MongoDB deleteOne - 應該要求確認
uv run [HOOKS_DIR]/test-damage-control.py permission Bash "db.users.deleteOne({id: 1})" --expect-ask

# MongoDB deleteMany - 應該要求確認
uv run [HOOKS_DIR]/test-damage-control.py permission Bash "db.users.deleteMany({active: false})" --expect-ask
```

**Redis 刪除操作** - 應該強制使用者確認：

```bash
# Redis DEL - 應該要求確認
uv run [HOOKS_DIR]/test-damage-control.py permission Bash "redis-cli DEL mykey" --expect-ask

# Redis FLUSHDB - 應該要求確認
uv run [HOOKS_DIR]/test-damage-control.py permission Bash "redis-cli FLUSHDB" --expect-ask
```

**安全操作** - 應該自動允許：

```bash
# SELECT 查詢 - 應該允許
uv run [HOOKS_DIR]/test-damage-control.py permission Bash "SELECT * FROM users" --expect-allow

# 一般 bash 指令 - 應該允許
uv run [HOOKS_DIR]/test-damage-control.py permission Bash "ls -la" --expect-allow

# Git 指令 - 應該允許
uv run [HOOKS_DIR]/test-damage-control.py permission Bash "git status" --expect-allow
```

### 步驟 8：彙整結果

12. 計算總通過和失敗的測試數
13. 呈現摘要報告

## 報告

以此格式呈現結果：

---

## 損害控制 (Damage Control) 測試結果

### bashToolPatterns
| 測試 | 指令               | 預期     | 結果      |
| ---- | ------------------ | -------- | --------- |
| 1    | `rm -rf /tmp`      | 封鎖     | 通過/失敗 |
| 2    | `git reset --hard` | 封鎖     | 通過/失敗 |
| ...  | ...                | ...      | ...       |

### zeroAccessPaths
| 路徑    | 工具        | 預期     | 結果      |
| ------- | ----------- | -------- | --------- |
| ~/.ssh/ | Bash（讀取）| 封鎖     | 通過/失敗 |
| ~/.ssh/ | Edit        | 封鎖     | 通過/失敗 |
| ~/.ssh/ | Write       | 封鎖     | 通過/失敗 |

### readOnlyPaths
| 路徑  | 工具         | 預期     | 結果      |
| ----- | ------------ | -------- | --------- |
| /etc/ | Bash（讀取） | 允許     | 通過/失敗 |
| /etc/ | Bash（寫入） | 封鎖     | 通過/失敗 |
| /etc/ | Edit         | 封鎖     | 通過/失敗 |

### noDeletePaths
| 路徑           | 工具          | 預期     | 結果      |
| -------------- | ------------- | -------- | --------- |
| .claude/hooks/ | Bash（刪除）  | 封鎖     | 通過/失敗 |
| .claude/hooks/ | Bash（寫入）  | 允許     | 通過/失敗 |

### PermissionRequest 鉤子
| 類別    | 指令                         | 預期     | 結果      |
| ------- | ---------------------------- | -------- | --------- |
| SQL     | `DELETE FROM users WHERE...` | 詢問     | 通過/失敗 |
| MongoDB | `.deleteOne({...})`          | 詢問     | 通過/失敗 |
| MongoDB | `.deleteMany({...})`         | 詢問     | 通過/失敗 |
| Redis   | `DEL mykey`                  | 詢問     | 通過/失敗 |
| Redis   | `FLUSHDB`                    | 詢問     | 通過/失敗 |
| 安全    | `SELECT * FROM users`        | 允許     | 通過/失敗 |
| 安全    | `ls -la`                     | 允許     | 通過/失敗 |

---

### 摘要

**總測試數**：[count]
**通過**：[count]
**失敗**：[count]

[如果全部通過]
所有損害控制 (Damage Control) 鉤子運作正常。

[如果有失敗]
部分測試失敗。請檢視上方失敗的測試並檢查鉤子實作。
