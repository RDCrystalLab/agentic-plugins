# 除錯工作流程 — /autoresearch:debug

自主除錯循環，以科學方法反覆迭代。不會在找到第一個錯誤後停止——持續調查直到程式碼庫乾淨，或由你中斷為止。

**核心概念：** 假設（Hypothesize）→ 測試（Test）→ 驗證／推翻（Prove/Disprove）→ 記錄（Log）→ 重複（Repeat）。每個發現都需要程式碼證據。每個失敗的假設都能引導下一個。

## 觸發條件

- 使用者呼叫 `/autoresearch:debug`
- 使用者說「找出所有錯誤」、「除錯」、「為什麼這個失敗」、「追蹤錯誤」、「調查」
- 使用者回報特定錯誤並想進行根本原因分析

## 迴圈支援

```
# 無限制——持續追蹤錯誤直到中斷
/autoresearch:debug

# 有界——剛好執行 N 次調查迭代（iteration）
/loop 20 /autoresearch:debug

# 聚焦範圍
/autoresearch:debug
Scope: src/api/**/*.ts
Symptom: API returns 500 on POST /users
```

## 架構

```
/autoresearch:debug
  ├── Phase 1: Gather (symptoms + context)
  ├── Phase 2: Reconnaissance (scan codebase, map error surface)
  ├── Phase 3: Hypothesize (form falsifiable hypothesis)
  ├── Phase 4: Test (run experiment to prove/disprove)
  ├── Phase 5: Classify (bug found / hypothesis disproven / inconclusive)
  ├── Phase 6: Log (record finding or elimination)
  └── Phase 7: Repeat (next hypothesis, next vector)
```

## 第一階段：蒐集（Gather）— 症狀與上下文

在開始調查之前，蒐集所有已知的問題資訊。

**如果使用者提供症狀：**
- 預期行為 vs 實際行為
- 錯誤訊息、堆疊追蹤（stack trace）、日誌輸出
- 何時開始出現（提交版本、部署、設定變更）
- 重現步驟（若已知）
- 執行環境（作業系統、執行時期、版本）

**如果沒有症狀（自主追蹤錯誤）：**
- 執行現有測試套件，蒐集失敗項目
- 執行靜態分析工具（linter），蒐集錯誤
- 執行型別檢查器，蒐集問題
- 檢查建置，蒐集警告
- 掃描常見反模式（anti-pattern）（未處理的 Promise、未檢查的 null、競態條件（race condition））

**輸出：** `✓ Phase 1: Gathered — [N] symptoms, [M] error signals detected`

## 第二階段：偵察（Reconnaissance）— 映射錯誤面

了解可能存在錯誤的程式碼庫區域。

**操作：**
1. 讀取堆疊追蹤（stack trace）／錯誤訊息中提及的檔案
2. 從錯誤來源向後追蹤呼叫鏈
3. 識別進入點（API 路由、事件處理器、CLI 指令）
4. 映射受影響元件的資料流
5. 檢查受影響區域的近期 git 變更（`git log --oneline -20 -- <path>`）
6. 識別外部依賴項和整合點

**錯誤面映射：**
```
Entry Point → Data Flow → Failure Point → Side Effects
  POST /users → validate() → db.insert() → ← FAILS HERE
                                             → notification.send() ← cascading
```

**輸出：** `✓ Phase 2: Recon — [N] files scanned, [M] potential failure points mapped`

## 第三階段：假設（Hypothesize）— 形成可證偽的假設

**好的假設應該是：**
- 具體的：「auth.ts 第 42 行的 JWT 驗證跳過了演算法檢查」
- 可測試的：可以用具體實驗來證明或推翻
- 可證偽的：存在能夠證明其錯誤的證據
- 有優先順序的：根據現有證據，最可能的原因優先

**假設形成策略：**

| 優先順序 | 策略 | 使用時機 |
|----------|----------|-------------|
| 1 | **錯誤訊息字面意義** | 堆疊追蹤（stack trace）指向確切行數 |
| 2 | **近期變更** | 錯誤在特定提交後開始出現 |
| 3 | **資料流追蹤** | 輸入 → 轉換 → 輸出的鏈路 |
| 4 | **環境差異** | 本機正常，CI／正式環境失敗 |
| 5 | **依賴項問題** | 升級／安裝後出現 |
| 6 | **競態條件（Race Condition）** | 間歇性、與時序相關 |
| 7 | **邊緣案例（Edge Case）** | 大多數輸入正常，特定輸入失敗 |

**認知偏誤防護（Cognitive Bias Guards）：**
- 確認偏誤（Confirmation Bias）：主動尋找反對假設的證據
- 錨定偏誤（Anchoring）：不要執著於第一條線索——考慮替代方案
- 沉沒成本（Sunk Cost）：若 3 次實驗都無法確認，放棄並嘗試新假設
- 可得性偏誤（Availability）：熟悉某種錯誤模式，不代表它就是原因

**輸出：** `Hypothesis [N]: "[specific, testable claim]" — testing...`

## 第四階段：測試（Test）— 執行實驗

設計一個最小化的實驗，明確地證明或推翻假設。

**實驗類型：**

| 類型 | 方法 | 最適用於 |
|------|--------|----------|
| **直接檢視** | 讀取疑似位置的程式碼 | 邏輯錯誤、缺少檢查 |
| **追蹤執行** | 加入日誌、執行、讀取輸出 | 資料流問題 |
| **最小重現** | 建立最小的失敗案例 | 複雜互動 |
| **二元搜尋** | 註解掉一半程式碼，縮小範圍 | 「此檔案某處有問題」 |
| **差異比較** | 比較正常 vs 異常狀態（git diff、環境差異） | 回歸（Regression） |
| **Git 二分法** | 找出引入錯誤的確切提交 | 「以前可以正常運作」 |
| **輸入變異** | 系統性地改變輸入 | 邊緣案例（Edge Case）、邊界問題 |

**實驗規則：**
- 每次迭代只做一個實驗（原子性——清楚知道自己測試了什麼）
- 記錄確切的指令／操作及其輸出
- 若實驗具有破壞性，先執行 git stash
- 逾時：若實驗超過 30 秒，表示太複雜——請簡化

## 第五階段：分類（Classify）— 我們學到了什麼？

| 結果 | 行動 |
|--------|--------|
| **確認錯誤** | 記錄發現，包含完整證據、嚴重程度、位置 |
| **假設被推翻** | 記錄為已排除，提取學習成果以供下一個假設使用 |
| **結論不確定** | 加入更多限制條件來精煉假設，重新測試 |
| **發現新線索** | 記錄發現，加入假設佇列 |

**錯誤發現格式：**
```
### [SEVERITY] Bug: [title]
- **Location:** `file:line`
- **Hypothesis:** [what we suspected]
- **Evidence:** [code snippet + experiment result]
- **Reproduction:** [exact steps to trigger]
- **Impact:** [what breaks, who's affected]
- **Root cause:** [WHY it happens, not just WHAT happens]
- **Suggested fix:** [concrete code change]
```

**嚴重程度分類：**
| 等級 | 標準 |
|-------|----------|
| CRITICAL（致命） | 資料遺失、安全漏洞、系統崩潰 |
| HIGH（高） | 功能損壞、結果錯誤、效能下降超過 10 倍 |
| MEDIUM（中） | 邊緣案例（Edge Case）失敗、使用者體驗降級、有替代方案 |
| LOW（低） | 外觀問題、輕微不一致、理論上的風險 |

## 第六階段：記錄（Log）— 記錄一切

**附加到 debug-results.tsv：**
```tsv
iteration	type	hypothesis	result	severity	location	description
1	hypothesis	JWT skips alg check	confirmed	CRITICAL	auth.ts:42	Algorithm confusion vulnerability
2	hypothesis	Rate limit missing	disproven	-	-	Rate limiter exists in middleware
3	discovery	-	new_lead	-	db.ts:88	Unhandled promise rejection in insert
4	hypothesis	DB insert missing await	confirmed	HIGH	db.ts:88	Silent failure on write errors
```

**每 5 次迭代，列印進度：**
```
=== Debug Progress (iteration 10) ===
Bugs found: 3 (1 Critical, 1 High, 1 Medium)
Hypotheses tested: 8 (3 confirmed, 4 disproven, 1 inconclusive)
Files investigated: 14 / 47 in scope
Techniques used: direct inspection, trace, binary search
```

## 第七階段：重複（Repeat）— 下一步調查

**下一次迭代的優先順序：**
1. 追蹤前次實驗中發現的新線索
2. 尚未測試的高優先假設
3. 錯誤面中尚未調查的檔案
4. 對已確認錯誤進行深入調查（找出根本原因，而非僅是症狀）
5. 基於模式的搜尋（若發現 NULL 檢查錯誤，在程式碼庫中尋找類似模式）

**何時停止（無界模式）：**
- 永不自動停止——由使用者中斷
- 若連續 5 次迭代都沒有新發現，印出「邊際效益遞減」警告

**何時停止（有界模式）：**
- 達到 N 次迭代後，列印最終摘要並停止

## 旗標（Flags）

| 旗標 | 用途 |
|------|---------|
| `--fix` | 找到錯誤後，切換至 autoresearch:fix 模式進行修復 |
| `--scope <glob>` | 限制調查範圍至特定檔案 |
| `--symptom "<text>"` | 預先填入症狀，無需詢問 |
| `--severity <level>` | 只回報達到或超過此嚴重程度的發現 |
| `--technique <name>` | 強制使用特定調查技術 |

## 綜合指標（Composite Metric）

對於有界迴圈，除錯徹底程度指標：

```
debug_score = bugs_found * 15
            + hypotheses_tested * 3
            + (files_investigated / files_in_scope) * 40
            + (techniques_used / 7) * 10
```

分數越高表示越徹底。同時激勵廣度（涵蓋更多檔案）與深度（測試更多假設）。

## 調查技術參考

### 二元搜尋（Binary Search）
將可疑程式碼的一半註解掉。若錯誤消失，問題就在那一半。重複此步驟。

### 差異除錯（Differential Debugging）
比較正常狀態 vs 異常狀態：
- `git stash` 測試乾淨狀態
- `git bisect` 找出確切的破壞性提交
- 比較正常／失敗環境之間的環境變數差異

### 最小重現（Minimal Reproduction）
移除所有無關內容，直到得到能重現錯誤的最小案例。移動的部件越少，原因越清晰。

### 追蹤執行（Trace Execution）
在關鍵資料流點加入 console.log／print 語句。執行並比較實際值與預期值。

### 模式搜尋（Pattern Search）
找到一個錯誤？在整個程式碼庫中搜尋相同的反模式（anti-pattern）：
```bash
grep -rn "pattern" src/ --include="*.ts"
```

### 逆向追蹤（Working Backwards）
從錯誤（輸出）開始，反向追蹤程式碼，直到找到正確行為與實際行為開始分歧的地方。

### 橡皮鴨除錯法（Rubber Duck）
逐行大聲解釋程式碼。解釋的過程往往能揭露錯誤的假設。

## 各語言常見錯誤模式

偵察（Reconnaissance）階段的語言特定錯誤快速參考。

| 語言 | 經典錯誤 | 搜尋模式 | 發生原因 |
|----------|-------------|-------------------|----------------|
| **JavaScript** | 未處理的 Promise 拒絕 | `Promise` 缺少 `.catch` / 缺少 `await` | 非同步錯誤被靜默吞噬 |
| **TypeScript** | 型別收窄後的 `undefined` 存取 | `obj?.prop` 後接 `obj.other`（喪失收窄） | 型別收窄（Type Narrowing）僅限於作用域範圍 |
| **Python** | 可變預設引數 | `def f(x=[]):` — 所有呼叫共用同一物件 | Python 在定義時只評估一次預設值 |
| **Python** | 未檢查回傳值導致的 `None` 注入 | 函式在錯誤路徑回傳 `None`，呼叫者繼續鏈式呼叫 | 缺少 null/None 防護（Guard） |
| **Go** | Goroutine 洩漏 | Goroutine 阻塞在未關閉的 channel | 缺少 `defer close(ch)` 或 `context.Cancel()` |
| **Go** | 共用 map 的競態條件（Race Condition） | 未加互斥鎖（mutex）的並發讀寫 | Go 的 map 非 goroutine 安全 |
| **Go** | 切片／緩衝區操作的整數溢位 | `int` 在 32 位元 vs 64 位元的大小差異 | 隱式的數值型別假設 |
| **Rust** | 正式環境中的 `.unwrap()` panic | `Option::unwrap()` / `Result::unwrap()` 遇到 `Err` | 錯誤路徑未處理 |
| **Java** | `NullPointerException` 串聯 | 未防護的方法鏈 `a.b().c().d()` | 鏈中缺少 null 檢查 |
| **Java** | 字串拼接導致的 SQL 注入 | `"SELECT * FROM t WHERE id=" + id` | 缺少參數化查詢（Parameterized Query） |
| **SQL** | N+1 查詢 | 在迴圈中呼叫資料庫 | 缺少 JOIN 或批次查詢 |
| **所有語言** | 共用狀態的競態條件 | 從並發執行緒修改全域／單例（singleton） | 缺少同步機制 |
| **所有語言** | 計算中的整數溢位 | 對大數進行算術運算而無邊界檢查 | 溢位時靜默回繞（Wrap-around） |
| **所有語言** | 注入漏洞（Injection Vulnerability） | 使用者輸入直接拼接至指令／查詢／模板 | 缺少輸入驗證／跳脫處理 |

**偵察捷徑：** 進入第二階段時，優先搜尋這些模式——它們在統計上是最常見的問題。

## 特定領域除錯

不同領域有可預測的失敗模式。在形成假設前，先套用特定領域的偵察方法。

### API 錯誤

常見失敗點：認證中介軟體（auth middleware）順序、content-type 不符、序列化／反序列化、HTTP 狀態碼語意。

**API 除錯清單：**
- 路由是否存在且符合 HTTP 方法？
- 認證中介軟體（auth middleware）是否已套用且順序正確？
- 請求主體（request body）是否正確解析（Content-Type 標頭）？
- 4xx 和 5xx 回應是否可區分？錯誤結構是否一致？
- 查詢參數（query parameters）是否已驗證並有正確型別？

### 資料庫錯誤

常見失敗點：N+1 查詢、缺少交易（transaction）、ORM 吞噬約束違反、時區處理、NULL 傳播。

**資料庫除錯清單：**
- 需要原子性（atomicity）的寫入是否都包含在交易（transaction）中？
- NULL 值是否在資料庫層和應用程式層都有處理？
- 查詢是否命中索引（index）？（用 `EXPLAIN` 檢查）
- 連線池（connection pool）是否耗盡？（檢查連線數 vs 池限制）
- 時間戳是否以 UTC 儲存？讀取時是否正確轉換？

### 認證（Authentication）／授權（Authorization）錯誤

常見失敗點：Token 驗證跳過演算法檢查、過期 Token 未被拒絕、缺少所有權檢查導致的權限提升。

**認證除錯清單：**
- JWT 的 `alg` 欄位是否已驗證（防止演算法混淆攻擊）？
- Token 到期時間（`exp`）是否已檢查？
- 授權（authorization，所有權檢查）和認證（authentication，身份確認）是否分離？
- 是否存在權限提升路徑（例如：一般使用者存取管理員端點）？

### 非同步（Async）／並發（Concurrency）錯誤

常見失敗點：共用狀態的競態條件（race condition）、缺少 await 導致部分執行、事件迴圈（event loop）阻塞、死結（deadlock）。

**非同步除錯清單：**
- 每個 `async` 函式在呼叫端是否都有 `await`？
- 共用可變狀態的存取是否有同步保護（mutex、lock、atomic）？
- 是否有死結（deadlock）風險（兩個鎖以不同順序取得）？
- 非同步處理器中的網路／資料庫呼叫是否為非阻塞式？

### 網路（Network）／整合（Integration）錯誤

常見失敗點：逾時設定不當、短暫故障時的重試風暴（retry storm）、缺少斷路器（circuit breaker）、字元編碼不符。

**網路除錯清單：**
- 所有對外呼叫是否都設定了逾時（timeout）？
- 重試邏輯是否有邊界（指數退避（exponential backoff）且有最大重試次數）？
- 回應解析是否能應對意外欄位？
- 字元編碼假設是否明確（全面使用 UTF-8）？

## 不該做的事 — 除錯反模式（Anti-Patterns）

| 反模式 | 為何失效 |
|---|---|
| **在理解前就修復** | 你修的是症狀，不是原因。錯誤會再次出現。 |
| **同時改多件事** | 無法將改善／回歸歸因於任何單一變更。 |
| **忽略被推翻的假設** | 不記錄已排除項目，意味著會重複相同的失敗調查。 |
| **假設而非驗證** | 「可能是 X」卻未測試 = 確認偏誤（Confirmation Bias）。執行實驗。 |
| **跳過重現步驟** | 無法重現，就無法驗證修復。 |
| **在正式環境除錯** | 絕不使用真實資料進行調查。先在本機重現。 |
| **執著於單一檔案** | 錯誤通常跨越邊界。追蹤完整的資料流。 |
| **字面相信錯誤訊息** | 錯誤訊息描述的是症狀。根本原因通常在 2-3 層之下。 |
| **嘗試 3 次就放棄** | 有些錯誤需要 10 個以上的假設。換技術，不要停下來。 |
| **怪罪框架（Framework）** | 95% 的情況下問題出在你的程式碼。先用最小重現案例證明是框架問題。 |

## 跨檔案錯誤追蹤

當錯誤橫跨多個檔案或服務時，標準的單一檔案檢視會失效。使用結構化的跨檔案追蹤。

**適用時機：**
- 堆疊追蹤（stack trace）跨越多個檔案／模組
- 錯誤涉及跨服務邊界的資料轉換
- 修復一個檔案後問題未解決（症狀 vs 原因）

**方法：**
1. 從症狀（錯誤輸出或失敗的斷言）開始
2. 向後跨越檔案邊界追蹤：識別流入的資料／呼叫
3. 對追蹤路徑中的每個檔案記錄：輸入什麼、輸出什麼、在哪裡轉換
4. 識別輸出第一次偏離預期契約（contract）的檔案
5. 該檔案就是錯誤的所有者——即使錯誤不是在那裡浮現

**跨檔案追蹤映射格式：**
```
file-a.ts → file-b.ts → file-c.ts → ERROR
  input: {...}  transform: {...}  output: WRONG
         ^first divergence = root cause lives here
```

**跨微服務（Microservices）：** 在映射中加入網路邊界。在每個服務邊界包含請求／回應的載荷（payload）。服務 B「的錯誤」通常意味著服務 A 發送了格式錯誤的資料。

## 效能錯誤調查

效能錯誤是一種正確性錯誤，其中輸出是「太慢」而非「錯誤」。用相同的科學方法，以效能分析（profiling）作為量測工具。

**先分析，後猜測：**
- 優化前先做效能分析（profiling）——慢的部分幾乎從不在你認為的地方
- 識別單一最熱路徑（慢查詢、慢渲染、慢計算）
- 在嘗試修復前，先用最小化的基準測試（benchmark）重現慢的問題

**效能問題模式：**
| 症狀 | 可能原因 | 調查方法 |
|---------|--------------|---------------------|
| API 回應緩慢 | N+1 資料庫查詢 | 記錄 SQL 查詢，計算每次請求的 DB 呼叫次數 |
| 頁面渲染緩慢 | 每次渲染都進行昂貴的重新計算 | 效能分析（React DevTools、Chrome DevTools） |
| 背景任務緩慢 | 迴圈內查詢缺少索引（index） | 對重複查詢執行 `EXPLAIN ANALYZE` |
| 記憶體緩慢增長 | 記憶體洩漏（事件監聽器、未關閉的連線） | 隨時間推移的堆積快照（Heap Snapshot） |
| 冷啟動緩慢 | 過度引入模組、大型套件、緩慢的初始化程式碼 | Bundle 分析工具、啟動效能分析 |
| 間歇性請求緩慢 | 鎖爭用（Lock Contention）或連線池耗盡 | 資料庫慢查詢日誌、連線池指標 |

**效能除錯清單：**
1. 量測基準線（p50、p95、p99 延遲或總時間）
2. 分析（Profile）以找出實際熱點（而非假設的）
3. 形成假設：「移除 X 將使 Y 減少 Z%」
4. 實施一個變更，重新量測
5. 驗證改善在統計上具有顯著意義（而非雜訊）

## 五個為什麼（The 5 Whys）— 根本原因深挖

表面錯誤很少揭露根本原因。遞迴地問「為什麼」，直到找到可以永久修復的根本原因。

**模板：**
```
Symptom: [what the user/system reported]
Why 1: [immediate technical cause]
Why 2: [cause of the cause]
Why 3: [deeper system issue]
Why 4: [process or design flaw]
Why 5: [root cause — fixable permanently]
```

**範例：**
```
Symptom: API returns 500 on POST /users
Why 1: database insert throws ConstraintViolationError
Why 2: email field is empty string, violates NOT NULL constraint
Why 3: validation layer allows empty strings as valid email
Why 4: validation uses truthy check (empty string is falsy — wait, it isn't)
Why 5: regex validator has a bug — accepts empty string as valid email format
Root Fix: fix the email regex to require at least one character before @
```

**何時停止：** 當「為什麼」指向你無法控制的外部系統、刻意的設計決策，或硬體／基礎設施限制時。這些情況採用替代方案（workaround），而非根本修復。

**停止繼續問「為什麼」的條件：** 當你找到的修復能防止所有未來同類錯誤的出現——而不只是這個特定實例。

## 輸出目錄

建立 `debug/{YYMMDD}-{HHMM}-{debug-slug}/`，包含：
- `findings.md` — 所有已確認的錯誤及其證據
- `eliminated.md` — 被推翻的假設（同樣具有價值）
- `debug-results.tsv` — 迭代日誌
- `summary.md` — 包含建議的執行摘要

## 與 /autoresearch:fix 的串接

```
# 找到錯誤，然後修復它們
/autoresearch:debug --fix

# 或手動串接
/loop 15 /autoresearch:debug    # hunt bugs
/loop 20 /autoresearch:fix      # fix everything found
```

指定 `--fix` 後，除錯迴圈完成後會自動切換至 `/autoresearch:fix`，針對已發現的問題進行修復。
