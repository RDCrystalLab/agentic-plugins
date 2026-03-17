# 修復工作流程 — /autoresearch:fix

自主修復循環，接收損壞的狀態並反覆修復，直到所有項目通過為止。每次迭代修復一件事。原子性（atomic）、已提交（committed）、已驗證（verified），失敗時自動回滾。

**核心概念：** 偵測（Detect）→ 優先排序（Prioritize）→ 修復一件事（Fix ONE thing）→ 驗證（Verify）→ 保留／回滾（Keep/Revert）→ 重複直到零錯誤。

## 觸發條件

- 使用者呼叫 `/autoresearch:fix`
- 使用者說「修復所有錯誤」、「讓測試通過」、「修復建置」、「清除所有警告」
- 使用者有 `/autoresearch:debug` 的輸出並想修復發現的問題

## 迴圈支援

```
# 無限制——持續修復直到所有項目通過
/autoresearch:fix

# 有界——剛好執行 N 次修復迭代（iteration）
/loop 30 /autoresearch:fix

# 指定明確目標
/autoresearch:fix
Target: make all tests pass
Scope: src/**/*.ts
Guard: npm run typecheck
```

## 架構

```
/autoresearch:fix
  ├── Phase 1: Detect (what's broken?)
  ├── Phase 2: Prioritize (fix order)
  ├── Phase 3: Fix ONE thing (atomic change)
  ├── Phase 4: Commit (before verification)
  ├── Phase 5: Verify (did error count decrease?)
  ├── Phase 6: Guard (did anything else break?)
  ├── Phase 7: Decide (keep / revert / rework)
  └── Phase 8: Log & Repeat
```

## 第一階段：偵測（Detect）— 什麼損壞了？

從上下文自動偵測失敗領域，或接受明確指定的目標。

**偵測演算法：**
```
FUNCTION detectFailures(context):
  failures = []

  # Run test suite
  IF test runner detected (jest, pytest, vitest, go test, cargo test):
    result = run_tests()
    IF failures → ADD {type: "test", count: N, details: [...]}

  # Run type checker
  IF typescript detected:
    result = run("tsc --noEmit")
    IF errors → ADD {type: "type", count: N, details: [...]}

  # Run linter
  IF linter detected (eslint, ruff, clippy):
    result = run_lint()
    IF errors → ADD {type: "lint", count: N, details: [...]}

  # Run build
  IF build script detected:
    result = run_build()
    IF fails → ADD {type: "build", count: 1, details: [...]}

  # Check for debug findings
  IF debug/{latest}/findings.md exists:
    bugs = parse_findings()
    ADD {type: "bug", count: N, details: [...]}

  # Check CI
  IF .github/workflows/ exists:
    IF user mentions CI failure → ADD {type: "ci", count: 1, details: [...]}

  # Detect warnings (lower priority but tracked)
  IF warning-level output detected:
    result = run_warnings()
    IF warnings → ADD {type: "warning", count: N, details: [...]}

  RETURN failures sorted by severity
```

**輸出：** `✓ Phase 1: Detected — [N] test failures, [M] type errors, [K] lint errors, [W] warnings`

**偵測優先順序說明：** 先執行建置——若建置失敗，型別／測試／靜態分析的結果都不可靠。警告最後偵測；`{type: "warning"}` 的項目進入最低優先佇列。

## 第二階段：優先排序（Prioritize）— 修復順序

按此順序修復（阻塞項優先，潤色最後）：

| 優先順序 | 類別 | 優先原因 |
|----------|----------|-----------|
| 1 | **建置失敗** | 無法編譯則一切無法運作 |
| 2 | **致命（Critical）／高（High）錯誤** | 來自除錯發現——資料遺失、安全問題 |
| 3 | **型別錯誤** | 型別安全防止串聯錯誤 |
| 4 | **測試失敗** | 測試驗證正確性 |
| 5 | **中（Medium）／低（Low）錯誤** | 來自除錯發現 |
| 6 | **靜態分析（Lint）錯誤** | 程式碼品質 |
| 7 | **警告** | 潤色——偵測中的 "warning" 型別 |

**同一類別內，按以下順序優先：**
1. 串聯影響（修一個可能連帶修好其他的）
2. 簡單程度（先搶快勝——建立動能）
3. 檔案局部性（同一檔案的修復集中處理）

**輸出：** `✓ Phase 2: Prioritized — fixing [category] first ([N] items)`

## 第三階段：修復一件事（Fix ONE Thing）— 原子性變更

選取優先級最高的未修復項目，進行一個聚焦的變更。

**依類別的修復策略：**

| 類別 | 策略 |
|----------|----------|
| 建置失敗 | 讀取錯誤，修復確切的行／引入／設定 |
| 型別錯誤 | 加入適當的型別、修復函式簽名、處理 null 情況 |
| 測試失敗 | 讀取測試與實作，找出不符之處，修復實作（而非測試） |
| 靜態分析錯誤 | 套用規則——盡可能自動修復 |
| 錯誤（來自除錯） | 套用 findings.md 中的建議修復 |
| 警告 | 解決根本問題，不要壓制 |

**依語言的修復策略：**

| 語言 | 絕對不做 | 正確模式 |
|----------|----------|-----------------|
| TypeScript | `any`、`@ts-ignore`、型別斷言以繞過 | 適當的介面（interface）、泛型（generic）、可辨別聯合（discriminated union） |
| Python | 裸 `except:`、公開 API 缺少型別提示 | `except SpecificError:`、搭配 `from __future__ import annotations` 的完整型別提示 |
| Go | 用 `_` 忽略錯誤、在函式庫程式碼中使用 `panic` | 明確的錯誤包裝 `fmt.Errorf("context: %w", err)`，帶上下文傳播 |
| Rust | 正式環境中的 `.unwrap()`、壓制 `#[allow(unused)]` | 用 `?` 傳播 `Result<T, E>`，搭配 `thiserror` 的自訂錯誤型別 |
| Java | 吞噬例外（exception）、使用原始型別（raw type） | 型別化例外、泛型（generic）、受檢例外（checked exception）處理 |

**規則：**
- 每次迭代只做一個修復。不是兩個。不是「順手做一下」。
- 修復實作（implementation），而非測試（除非測試本身確實有誤）
- 絕不加入 `@ts-ignore`、`eslint-disable`、`# type: ignore` 來壓制錯誤
- 絕不使用 any｜any 的逃生艙永遠無法解決型別錯誤——使用適當的收窄型別（narrowed type）或泛型（generic）
- 絕不刪除測試｜刪除測試覆蓋率永遠無法改善程式碼——修復實作以滿足測試
- 偏好最小化變更——最小的差異（diff）能解決問題即可

## 第四階段：提交（Commit）— 驗證前先提交

```bash
git add -A
git commit -m "fix: [what was fixed] — [file:line]"
```

在執行驗證**前**先提交。這讓修復若破壞某些東西時能夠乾淨地回滾。

## 第五階段：驗證（Verify）— 它有幫助嗎？

重新執行第一階段的偵測並比較：

```
previous_errors = error_count_before
current_errors = error_count_after

delta = previous_errors - current_errors
```

**預期：** `delta > 0`（比之前的錯誤少）

## 第六階段：防護（Guard）— 有其他東西損壞嗎？

若指定了防護（guard）指令，執行它：

```
guard_result = run(guard_command)  # e.g., "npm test"
```

**防護（Guard）防止回歸（regression）。** 修復型別錯誤不應該破壞測試。修復測試不應該破壞建置。

## 第七階段：決策（Decide）— 保留、回滾或重做

| 條件 | 行動 |
|-----------|--------|
| `delta > 0` 且防護通過 | **保留（KEEP）** — 提交保留，記錄「已修復」 |
| `delta > 0` 且防護失敗 | **重做（REWORK）** — 回滾，嘗試不同方法（最多 2 次） |
| `delta == 0` | **捨棄（DISCARD）** — 回滾，修復沒有幫助 |
| `delta < 0`（更多錯誤！） | **捨棄（DISCARD）** — 立即回滾 |
| 修復過程崩潰 | **恢復（RECOVER）** — 回滾，嘗試更簡單的方法（最多 3 次） |

**重做策略（當防護失敗時）：**
1. 讀取防護失敗資訊——了解什麼發生了回歸
2. 回滾失敗的修復：`git revert HEAD --no-edit`
3. 了解修復為何破壞其他東西（檢查串聯依賴）
4. 找到一個能修復目標而不破壞防護的方法
5. 若 2 次重做嘗試失敗 → 跳過此項目，加入 `blocked.md`，移至下一個
6. 在 fix-results.tsv 中記錄，狀態為「rework」，描述已嘗試的內容

**延伸決策矩陣：**

| 條件 | delta | 防護 | 行動 | TSV 狀態 |
|-----------|-------|-------|--------|-----------|
| 完美修復 | > 0 | 通過 | 保留 | fixed |
| 部分修復 | > 0 | 通過 | 保留並繼續 | fixed |
| 引入回歸 | > 0 | 失敗 | 重做 | rework |
| 無效果 | == 0 | - | 捨棄 | discard |
| 情況更糟 | < 0 | - | 立即捨棄 | discard |
| 崩潰／例外 | 任何 | 失敗 | 恢復（更簡單） | recover |
| 第 3 次嘗試失敗 | 任何 | 任何 | 跳至已封鎖 | blocked |

## 第八階段：記錄（Log）與重複（Repeat）

**附加到 fix-results.tsv：**
```tsv
iteration	category	target	delta	guard	status	description
0	-	-	-	pass	baseline	47 test failures, 12 type errors, 3 lint errors
1	type	auth.ts:42	-2	pass	fixed	add return type annotation
2	type	db.ts:15	-1	pass	fixed	handle nullable column
3	test	api.test.ts	-3	pass	fixed	fix expected status code (was 200, should be 201)
4	test	auth.test.ts	0	-	discard	wrong approach — test expectation was correct
5	test	auth.test.ts	-1	pass	fixed	missing await on async handler
```

**每 5 次迭代，列印進度：**
```
=== Fix Progress (iteration 15) ===
Baseline: 62 errors → Current: 23 errors (-39, -63%)
Category breakdown:
  Tests:  31/47 fixed
  Types:  8/12 fixed
  Lint:   0/3 fixed (not yet started — lower priority)
Keeps: 11 | Discards: 3 | Reworks: 1
```

**完成偵測：**
```
IF current_errors == 0:
  PRINT "=== All Clear — Zero Errors ==="
  STOP (even in unbounded mode)
```

## 旗標（Flags）

| 旗標 | 用途 |
|------|---------|
| `--target <command>` | 明確指定驗證指令（覆蓋自動偵測） |
| `--guard <command>` | 必須始終通過的安全指令 |
| `--scope <glob>` | 限制修復範圍至特定檔案 |
| `--category <type>` | 只修復特定類別（test、type、lint、build、bug） |
| `--skip-lint` | 不修復靜態分析（lint）錯誤（聚焦在功能問題） |
| `--from-debug` | 從最新的 debug/ 工作階段讀取發現 |

## 修復工作階段狀態機（State Machine）

```
States: DETECTING → PRIORITIZING → FIXING → VERIFYING → DECIDING → [DONE | LOOP]

DETECTING:
  → Run all error detection commands
  → If zero errors found → DONE (nothing to fix)
  → If errors found → PRIORITIZING

PRIORITIZING:
  → Sort errors by priority table
  → Group cascading errors (fixing one fixes others)
  → Pick first unfixed item → FIXING

FIXING:
  → Read error details + surrounding code
  → Assess blast radius (impact assessment)
  → Check git history for prior attempts on this file
  → Apply minimal change
  → Commit → VERIFYING

VERIFYING:
  → Re-run error detection
  → Compute delta (previous - current)
  → Run guard command → DECIDING

DECIDING:
  → delta > 0 AND guard passes → KEEP → log "fixed" → LOOP
  → delta > 0 AND guard fails → REWORK (max 2) → FIXING
  → delta == 0 → DISCARD → revert → PRIORITIZING (next item)
  → delta < 0 → DISCARD → revert immediately → PRIORITIZING
  → 3 failed attempts on same item → SKIP → blocked list → PRIORITIZING
  → All items fixed or skipped → DONE

DONE:
  → Generate summary.md
  → Print fix_score
  → Suggest /autoresearch:debug for blocked items
```

## 不該做的事 — 反模式（Anti-Patterns）

這些捷徑看似修復了錯誤，卻使情況更糟：

| 反模式 | 為何錯誤 | 正確做法 |
|--------------|----------------|-----------------|
| 加入 `@ts-ignore` / `eslint-disable` | 隱藏問題——最終以執行時期錯誤浮現 | 修復根本原因 |
| 用 `any` 型別讓 TypeScript 靜默 | 破壞整個鏈路的型別安全 | 使用適當的型別、泛型（generic）或 `unknown` 加收窄 |
| 刪除或跳過失敗的測試 | 移除安全網 | 修復實作以滿足測試 |
| 用行內註解壓制靜態分析（lint） | 靜默累積技術債 | 正確套用靜態分析規則 |
| `catch (e) {}` 空的 catch 區塊 | 吞噬錯誤——錯誤變得不可見 | 至少要記錄；處理或重新拋出 |
| 將損壞的程式碼註解掉 | 永遠不會被取消註解 | 修復它或完全刪除 |
| 硬編碼數值以通過特定測試 | 測試通過了，但功能對真實資料是損壞的 | 修復邏輯，而非數值 |
| npm/yarn install 加 `--force` | 忽略對等依賴衝突導致執行時期崩潰 | 明確解決衝突 |
| 增加測試逾時而不修復原因 | 遮蔽緩慢程式碼或死結（deadlock） | 分析（Profile）並修復根本問題 |
| 增加測試逾時而不修復原因 | 遮蔽緩慢程式碼或死結（deadlock） | 分析（Profile）並修復根本問題 |

**一次一修（ONE fix rule）防止大多數反模式。** 當你想使用某個反模式時，這表示真正的修復更難——記錄下來，跳至下一個項目，帶著新的思路再回來。

## 修復驗證深度（Fix Verification Depth）

驗證深度隨爆炸半徑（blast radius）擴展：

| 變更範圍 | 最低驗證 | 完整驗證 |
|-------------|---------------------|-------------------|
| 單一工具函式 | 該函式的單元測試 | 呼叫者的單元測試 + 整合測試 |
| 公開 API 變更 | 整合測試 | 單元測試 + 整合測試 + 契約測試（contract test） |
| 資料庫 Schema | 遷移試運行（dry-run） | 預備環境（staging）冒煙測試 |
| 設定／環境變數 | CI 流水線執行 | 完整部署至預備環境 |
| 依賴項升級 | `npm test` | 完整回歸套件 + E2E 測試 |
| 認證（auth）／安全程式碼 | 單元測試 + 整合測試 | 安全稽核 + 滲透測試 |

## 綜合指標（Composite Metric）

對於有界迴圈，考量修復品質的細緻 fix_score：

```
fix_score = reduction_score + quality_score + bonus_score

reduction_score = ((baseline_errors - current_errors) / baseline_errors) * 60
  # 權重：60%——首要目標是減少錯誤數量

quality_score = 0
  # 扣除低品質修復（使用了反模式）：
  quality_score -= (suppression_count * 5)   # @ts-ignore, eslint-disable used
  quality_score -= (skipped_test_count * 10)  # tests deleted/commented out
  quality_score -= (any_type_count * 3)       # `any` type introduced
  quality_score = max(quality_score, -20)     # floor: never below -20

guard_score = (guard_always_passed ? 25 : 0)
  # 權重：25%——無回歸（regression）至關重要

bonus_score = 0
  bonus_score += (zero_errors ? 10 : 0)              # all clear bonus
  bonus_score += (no_discards ? 5 : 0)               # every fix worked first try
  bonus_score += (compound_detected_and_fixed ? 5 : 0) # found hidden bugs too
```

**解讀：**
- **100+** = 完美：所有錯誤已修復、無回歸（regression）、無反模式
- **80-99** = 良好：顯著進展、防護（guard）保持、極少反模式
- **60-79** = 可接受：有意義的減少，但存在一些回歸或反模式
- **<60** = 需要改進：太多捨棄（discard）、防護失敗或使用了反模式

## 修復影響評估（Fix Impact Assessment）

在套用修復前，估算爆炸半徑（blast radius）：

```
FUNCTION assessImpact(target_file, fix_type):
  # How many files import this file?
  dependents = grep -r "import.*{target_file}" src/

  # Is this in a critical path?
  is_critical = target_file in [auth, payments, database, api-gateway]

  # How many tests cover this?
  test_coverage = count tests that import or test target_file

  RETURN {
    dependents: N,
    is_critical: bool,
    test_coverage: N,
    risk_level: HIGH if (dependents > 10 OR is_critical) else MEDIUM if dependents > 3 else LOW
  }
```

| 風險等級 | 行動 |
|------------|--------|
| 低（LOW） | 修復並以單元測試驗證 |
| 中（MEDIUM） | 修復並以單元測試 + 整合測試作為防護（guard） |
| 高（HIGH） | 在隔離分支修復，以完整套件驗證，合併前取得審查 |

## 複合修復偵測（Compound Fix Detection）

當修復一個錯誤揭露另一個，或修復只是部分完成時：

```
FUNCTION detectCompound(before_errors, after_errors):
  new_errors = after_errors - before_errors  # errors that didn't exist before

  IF new_errors > 0:
    LOG "Compound fix detected: {N} new errors surfaced"
    # These are likely pre-existing errors that were masked
    ADD new_errors to fix queue at current priority
    CONTINUE (do not treat as regression)

  IF delta == 0 AND error_details_changed:
    LOG "Error transformed — not fixed, just moved"
    REVERT and try different approach
```

**常見複合模式：**
- 修復型別錯誤揭露了被錯誤型別隱藏的邏輯錯誤
- 修復 null 檢查揭露了缺少的初始化
- 升級依賴項揭露了原本通過的測試依賴的是一個錯誤行為
- 修復測試 A 揭露了測試 B 共用可變狀態

## 回滾協議（Rollback Protocol）

當修復使情況更糟（delta < 0）或防護（guard）失敗時：

```
STEP 1: Identify the bad commit
  git log --oneline -5

STEP 2: Revert the specific commit
  git revert HEAD --no-edit
  # OR for harder cases:
  git reset --soft HEAD~1  # unstage the commit
  git checkout -- .        # discard working changes

STEP 3: Verify rollback succeeded
  Run original failing command — should return to pre-fix error count

STEP 4: Log the failed approach in fix-results.tsv
  Mark as "discard" with description of why it failed

STEP 5: Analyze before retrying
  - What assumption was wrong?
  - What did the fix break?
  - Is there a smaller, safer change?
```

**絕對不要跳過回滾。** 在損壞狀態下的部分修復，會讓下一次迭代的錯誤偵測變得不可靠。

## 平行修復偵測（Parallel Fix Detection）

有些錯誤是獨立的，可以平行修復（不同檔案、無共用狀態）：

```
FUNCTION detectParallelizable(error_list):
  groups = {}

  FOR each error:
    affected_files = error.file
    FOR each group:
      IF affected_files overlaps group.files:
        MERGE error into group  # dependent
      ELSE:
        CREATE new group        # independent

  independent_groups = groups where len(group.files) == 1

  RETURN independent_groups  # can be fixed in parallel subagents
```

**何時平行化：** 5 個以上的獨立錯誤分散在不同模組。用 `--scope` 隔離，產生平行修復代理人（agent）。

## 修復歷史模式學習（Fix History Pattern Learning）

在嘗試修復前，檢查 git 歷史中對同一檔案的過往方式：

```bash
# See what fixes were tried in this file before
git log --oneline --follow -- src/auth/handler.ts

# See the diff of a specific past fix
git show <commit-hash> -- src/auth/handler.ts

# Search for past fix attempts on this error type
git log --grep="fix: type error" --oneline
```

**模式訊號：**
- 同一錯誤被修復 3 次以上 → 根本原因未被解決，修復架構問題
- 同一檔案有近期的回滾 → 先前方法失敗，避免重蹈覆轍
- 「簡單」修復卻有大量差異（diff）→ 該檔案隱藏了複雜度，變更時要謹慎

## 修復無效 — 升級路徑（Escalation Path）

當同一錯誤嘗試 3 次都失敗時：

```
Attempt 1: FAIL → Log approach, try different strategy
Attempt 2: FAIL → Log approach, read git history for prior attempts
Attempt 3: FAIL → Escalate:

  1. DOCUMENT: What was tried (3 approaches), why each failed
  2. ISOLATE: Create minimal reproduction case
  3. SKIP: Move this error to "blocked" list, continue with others
  4. FLAG: Note in summary.md — "Error X requires investigation"
  5. SUGGEST: /autoresearch:debug on the specific error for root cause analysis
```

**絕不在同一個失敗方法上循環。** 每次嘗試都必須使用實質上不同的策略。

## 依賴項修復模式（Dependency Fix Patterns）

當錯誤來源於 `node_modules`、`pip` 套件或已打包的依賴項時：

| 症狀 | 策略 | 指令 |
|---------|----------|---------|
| 對等依賴（peer dependency）衝突 | 升級至相容版本 | `npm install pkg@latest` |
| 小版本更新的破壞性變更 | 固定至最後可用版本 | `npm install pkg@1.2.3` |
| 安全漏洞 | 修補或替換 | `npm audit fix` / 替換為替代方案 |
| 傳遞依賴（transitive dependency）衝突 | 強制解析 | `package.json` 的 resolutions/overrides 欄位 |
| Python 套件不相容 | 在 requirements 中固定版本 | `pip install pkg==x.y.z` |
| 缺少原生綁定 | 從原始碼重新編譯 | `npm rebuild` / `pip install --no-binary` |

**規則：** 絕不直接修補（patch）`node_modules`——它會被覆蓋。改用 `patch-package` 補丁或 fork。

## 資料庫遷移修復模式（Database Migration Fix Patterns）

當錯誤涉及 schema 衝突或資料完整性時：

| 錯誤類型 | 策略 |
|------------|----------|
| 遷移順序錯誤 | 檢查遷移歷史表，按順序套用缺少的遷移 |
| Schema 衝突（欄位已存在） | 使遷移具有冪等性（idempotent）：`IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS` |
| 資料完整性違反 | 在套用約束前修復資料，或分兩步遷移：加入可 null 欄位 → 回填資料 → 加入約束 |
| 回滾失敗 | 從備份還原，重放前向遷移至已知良好狀態 |
| 列舉（Enum）型別衝突（Postgres） | 無法在交易（transaction）中修改 enum——在交易外使用 `ALTER TYPE` |

**規則：** 在套用前，始終在正式資料的副本上測試遷移。若可用，使用 `--dry-run`。

## CI/CD 流水線修復模式

當錯誤只出現在 CI（本機無法重現）時：

| 症狀 | 根本原因 | 修復 |
|---------|------------|-----|
| `env var not found` | Secret 不在 CI 環境中 | 將 secret 加入 CI 設定，透過 `${{ secrets.NAME }}` 引用 |
| Permission denied | 缺少 IAM 角色／工作流程（workflow）權限 | 在工作流程 YAML 中加入 `permissions:` 區塊 |
| 逾時 | 測試緩慢／缺少快取 | 加入快取步驟、增加逾時、平行化工作 |
| 本機正常，CI 失敗 | 作業系統差異（macOS vs Linux） | 在符合 CI 作業系統的 Docker 中測試；檢查路徑大小寫敏感性 |
| CI 中的不穩定測試（Flaky Test） | 競態條件（race condition）或時序問題 | 加入重試邏輯、修復非同步處理、隔離測試狀態 |
| 快取污染（Cache Poisoning） | 損壞狀態的過時快取 | 清除 CI 快取，加入快取鍵版本號遞增 |

## 自動偵測參考

| 訊號 | 偵測類型 | 驗證指令 |
|--------|---------------|----------------|
| `package.json` 有 `test` 腳本 | test | `npm test` |
| `tsconfig.json` 存在 | type | `tsc --noEmit` |
| `.eslintrc*` 或 `eslint.config.*` 存在 | lint | `npx eslint .` |
| `pyproject.toml` 有 `pytest` | test | `pytest` |
| `pyproject.toml` 有 `mypy` 或 `ruff` | type + lint | `mypy .`, `ruff check .` |
| `Cargo.toml` 存在 | test + lint | `cargo test`, `cargo clippy` |
| `go.mod` 存在 | test + lint | `go test ./...`, `golangci-lint run` |
| `package.json` 中有 `build` 腳本 | build | `npm run build` |
| `next.config.*` 存在 | build | `next build` |
| `vite.config.*` 存在 | build | `vite build` |
| `.github/workflows/*.yml` 存在 | ci | 檢查最新執行：`gh run list --limit 1` |
| `debug/*/findings.md` 存在 | bug | 解析發現 |
| `tsc --noEmit` 顯示 `TS2322`, `TS2345` | 型別錯誤 | 修復型別不符 |
| 測試輸出顯示 `Expected.*Received` | 測試失敗 | 修復斷言 |
| 建置日誌顯示 `Module not found` | 建置失敗 | 修復引入路徑 |
| CI 日誌顯示 `exit code 1` | ci | 檢查失敗步驟 |

## 串接模式（Chaining Patterns）

```bash
# 先除錯，然後修復找到的問題
/loop 15 /autoresearch:debug
/loop 30 /autoresearch:fix --from-debug

# 帶防護（guard）的修復
/autoresearch:fix
Target: npm run typecheck
Guard: npm test

# 只修復測試，以型別作為防護
/autoresearch:fix --category test --guard "tsc --noEmit"

# 修復所有問題——迭代直到乾淨
/autoresearch:fix

# 有界衝刺——在 20 次迭代內盡可能修復
/loop 20 /autoresearch:fix
```

## 輸出目錄

建立 `fix/{YYMMDD}-{HHMM}-{fix-slug}/`，包含：
- `fix-results.tsv` — 迭代日誌
- `summary.md` — 修復了什麼、剩下什麼、統計數據
- `blocked.md` — 需要 3 次以上嘗試且已升級的錯誤
- `impact-assessment.md` — 每個已套用修復的爆炸半徑分析

## 延伸串接模式（Extended Chaining Patterns）

```bash
# 完整流水線：除錯 → 修復 → 發佈
/loop 15 /autoresearch:debug
/loop 30 /autoresearch:fix --from-debug --guard "npm test"
/autoresearch:ship

# 只修復關鍵問題，然後驗證乾淨狀態
/autoresearch:fix --category build
/autoresearch:fix --category type --guard "npm run build"
/autoresearch:fix --category test --guard "tsc --noEmit"

# 帶平行代理人（agent）的範圍修復
/autoresearch:fix --scope "src/api/**" --category type
/autoresearch:fix --scope "src/auth/**" --category test

# 停用警告壓制的修復
/autoresearch:fix --category warning --skip-lint

# CI 特定修復：CI 失敗時重新執行
/autoresearch:fix --target "npm run ci" --guard "npm test"

# 依賴項升級後修復串聯問題
npm upgrade && /autoresearch:fix --category type --category test
```

## 摘要報告格式

```markdown
# Fix Session Summary

## Stats
- Session: fix/260316-1805-auth-fixes/
- Duration: 23 iterations
- Baseline: 47 errors (31 test, 12 type, 4 lint)
- Final: 3 errors (2 test, 1 type, 0 lint)
- Reduction: 93.6% (-44 errors)

## Fix Score
fix_score: 97/100
- Reduction: 58/60 (93.6%)
- Guard: 25/25 (no regressions)
- Bonus: +10 (zero lint errors)
- Anti-patterns used: 0

## Fixed
- auth.ts:42 — add return type annotation (type)
- db.ts:15 — handle nullable column (type)
- api.test.ts — fix expected status code 200→201 (test)
[... 41 more ...]

## Blocked (requires investigation)
- auth/token-refresh.ts — circular dependency blocks type resolution
  → Suggested: /autoresearch:debug --scope auth/token-refresh.ts

## Remaining
- user.test.ts:88 — flaky timing test (not a code bug)
- config.ts:12 — type error requires breaking API change
```
