---
name: autoresearch
description: 自主目標導向迭代（Autonomous Goal-directed Iteration）。將 Karpathy 的 autoresearch 原則應用於任何任務。自主循環執行——修改、驗證、保留/捨棄、重複。支援透過 Claude Code 的 /loop 指令指定可選的迴圈次數。
version: 1.3.0
---

# Claude Autoresearch — 自主目標導向迭代

靈感來自 [Karpathy's autoresearch](https://github.com/karpathy/autoresearch)。將約束驅動的自主迭代應用於任何工作——不僅限於機器學習（ML）研究。

**核心概念：** 你是一個自主代理（Autonomous Agent）。修改（Modify）→ 驗證（Verify）→ 保留/捨棄（Keep/Discard）→ 重複（Repeat）。

## 子指令（Subcommands）

| 子指令 | 用途 |
|------------|---------|
| `/autoresearch` | 執行自主迴圈（預設） |
| `/autoresearch:plan` | 互動式精靈，從目標建立範圍（Scope）、指標（Metric）、方向（Direction）與驗證（Verify） |
| `/autoresearch:security` | 自主安全稽核：STRIDE 威脅模型 + OWASP Top 10 + 紅隊測試（4 個對抗性角色） |
| `/autoresearch:ship` | 通用交付工作流程：交付程式碼、內容、行銷、業務、研究或任何產出物 |
| `/autoresearch:debug` | 自主除錯迴圈：科學方法 + 迭代調查，直到程式碼庫乾淨為止 |
| `/autoresearch:fix` | 自主修復迴圈：迭代修復錯誤（測試、型別、Lint、建置），直到歸零 |

### /autoresearch:security — 自主安全稽核（v1.0.3）

使用 autoresearch 迴圈模式執行全面安全稽核。產生完整的 STRIDE 威脅模型、繪製攻擊面，然後迭代測試每個漏洞向量——記錄發現項目的嚴重性、OWASP 類別與程式碼證據。

載入：`references/security-workflow.md` 以取得完整協議。

**功能說明：**

1. **程式碼庫偵察（Codebase Reconnaissance）** — 掃描技術棧、依賴套件、配置檔、API 路由
2. **資產識別（Asset Identification）** — 建立資料儲存、認證系統、外部服務、使用者輸入的目錄
3. **信任邊界映射（Trust Boundary Mapping）** — 瀏覽器↔伺服器、公開↔已驗證、使用者↔管理員、CI/CD↔生產環境
4. **STRIDE 威脅模型** — 偽造（Spoofing）、竄改（Tampering）、否認（Repudiation）、資訊洩露（Info Disclosure）、阻斷服務（DoS）、權限提升（Elevation of Privilege）
5. **攻擊面地圖（Attack Surface Map）** — 進入點、資料流、濫用路徑
6. **自主迴圈（Autonomous Loop）** — 迭代測試每個向量，以程式碼證據驗證，記錄發現項目
7. **最終報告（Final Report）** — 按嚴重性排序的發現項目（含緩解措施）、覆蓋矩陣、迭代日誌

**關鍵行為：**
- 遵循紅隊（Red-team）對抗心態（安全攻擊者、供應鏈攻擊者、內部威脅者、基礎設施攻擊者）
- 每個發現項目都需要**程式碼證據**（file:line + 攻擊情境）——不接受純理論的推測
- 追蹤 OWASP Top 10 + STRIDE 覆蓋率，每 5 次迭代印出覆蓋摘要
- 複合指標：`(owasp_tested/10)*50 + (stride_tested/6)*30 + min(findings, 20)` — 越高越好
- 建立 `security/{YYMMDD}-{HHMM}-{audit-slug}/` 資料夾，包含結構化報告：
  `overview.md`、`threat-model.md`、`attack-surface-map.md`、`findings.md`、`owasp-coverage.md`、`dependency-audit.md`、`recommendations.md`、`security-audit-results.tsv`

**旗標（Flags）：**

| 旗標 | 用途 |
|------|---------|
| `--diff` | 差異模式（Delta mode）— 僅稽核自上次稽核以來變更的檔案 |
| `--fix` | 稽核後，使用 autoresearch 迴圈自動修復確認的 Critical/High 發現項目 |
| `--fail-on {severity}` | 若發現項目達到門檻則以非零值退出（用於 CI/CD 閘控） |

**使用範例：**
```
# Unlimited — keep finding vulnerabilities until interrupted
/autoresearch:security

# Bounded — exactly 10 security sweep iterations
/loop 10 /autoresearch:security

# With focused scope
/autoresearch:security
Scope: src/api/**/*.ts, src/middleware/**/*.ts
Focus: authentication and authorization flows

# Delta mode — only audit changed files since last audit
/autoresearch:security --diff

# Auto-fix confirmed Critical/High findings after audit
/loop 15 /autoresearch:security --fix

# CI/CD gate — fail pipeline if any Critical findings
/loop 10 /autoresearch:security --fail-on critical

# Combined — delta audit + fix + gate
/loop 15 /autoresearch:security --diff --fix --fail-on critical
```

**靈感來源：**
- [Strix](https://github.com/usestrix/strix) — 具概念驗證（Proof-of-concept）的 AI 安全測試
- `/plan red-team` — 以敵對審查者角色進行的對抗性審查
- OWASP Top 10 (2021) — 業界標準漏洞分類法
- STRIDE — Microsoft 的威脅建模框架

### /autoresearch:ship — 通用交付工作流程（v1.1.0）

交付任何產出物——程式碼、內容、行銷、業務、研究或設計——透過結構化的 8 階段工作流程，將 autoresearch 迴圈原則應用於最後一哩路。

載入：`references/ship-workflow.md` 以取得完整協議。

**功能說明：**

1. **識別（Identify）** — 自動偵測要交付的內容（程式碼 PR、部署、部落格文章、電子郵件活動、業務簡報、研究論文、設計素材）
2. **清點（Inventory）** — 評估現況與準備缺口
3. **清單（Checklist）** — 產生特定領域的交付前關卡（全部可機械性驗證）
4. **準備（Prepare）** — autoresearch 迴圈，修復未通過的清單項目直到 100% 通過
5. **模擬（Dry-run）** — 模擬交付動作，不產生副作用
6. **交付（Ship）** — 執行實際發布（合併、部署、發布、發送）
7. **驗證（Verify）** — 交付後健康檢查，確認已成功落地
8. **記錄（Log）** — 將交付記錄至 `ship-log.tsv` 以確保可追溯性

**支援的交付類型：**

| 類型 | 交付動作範例 |
|------|---------------------|
| `code-pr` | `gh pr create` 附上完整說明 |
| `code-release` | Git tag + GitHub release |
| `deployment` | CI/CD 觸發、`kubectl apply`、推送至部署分支 |
| `content` | 透過 CMS 發布、提交至內容分支 |
| `marketing-email` | 透過 ESP 發送（SendGrid、Mailchimp） |
| `marketing-campaign` | 啟動廣告、上線登陸頁面 |
| `sales` | 發送提案、分享簡報 |
| `research` | 上傳至資料庫、提交論文 |
| `design` | 匯出素材、與利害關係人分享 |

**旗標（Flags）：**

| 旗標 | 用途 |
|------|---------|
| `--dry-run` | 驗證一切但不實際交付（在 Phase 5 停止） |
| `--auto` | 清單通過時自動核准 |
| `--force` | 跳過非關鍵項目（阻斷項仍強制執行） |
| `--rollback` | 撤銷上一次交付動作 |
| `--monitor N` | 交付後監控 N 分鐘 |
| `--type <type>` | 覆蓋自動偵測，指定交付類型 |
| `--checklist-only` | 僅檢查準備狀態 |

**支援 9 種交付類型：** code-pr、code-release、deployment、content、marketing-email、marketing-campaign、sales、research、design。

**使用範例：**
```
# Auto-detect and ship (interactive)
/autoresearch:ship

# Ship code PR with auto-approve
/autoresearch:ship --auto

# Dry-run a deployment before going live
/autoresearch:ship --type deployment --dry-run

# Ship with post-deployment monitoring
/autoresearch:ship --monitor 10

# Prepare iteratively then ship
/loop 5 /autoresearch:ship

# Just check if something is ready to ship
/autoresearch:ship --checklist-only

# Ship a blog post
/autoresearch:ship
Target: content/blog/my-new-post.md
Type: content

# Ship a sales deck
/autoresearch:ship --type sales
Target: decks/q1-proposal.pdf

# Rollback a bad deployment
/autoresearch:ship --rollback
```

**複合指標（用於有限迴圈）：**
```
ship_score = (checklist_passing / checklist_total) * 80
           + (dry_run_passed ? 15 : 0)
           + (no_blockers ? 5 : 0)
```
分數 100 = 完全準備好。低於 80 = 不可交付。

**輸出目錄：** 建立 `ship/{YYMMDD}-{HHMM}-{ship-slug}/`，包含 `checklist.md`、`ship-log.tsv`、`summary.md`。

### /autoresearch:plan — 目標 → 配置精靈

將純文字目標轉換為已驗證、可立即執行的 autoresearch 配置。

載入：`references/plan-workflow.md` 以取得完整協議。

**快速摘要：**

1. **擷取目標（Capture Goal）** — 詢問使用者想改善什麼（或接受行內文字）
2. **分析上下文（Analyze Context）** — 掃描程式碼庫的工具、測試執行器、建置腳本
3. **定義範圍（Define Scope）** — 建議檔案 Glob，驗證是否能解析到真實檔案
4. **定義指標（Define Metric）** — 建議機械性指標，驗證是否輸出數字
5. **定義方向（Define Direction）** — 越高越好或越低越好
6. **定義驗證（Define Verify）** — 建構 Shell 指令，**模擬執行（dry-run）**，確認有效
7. **確認並啟動（Confirm & Launch）** — 呈現完整配置，提供立即啟動選項

**關鍵關卡：**
- 指標（Metric）必須是機械性的（輸出可解析的數字，非主觀判斷）
- 驗證（Verify）指令在接受前必須通過目前程式碼庫的模擬執行
- 範圍（Scope）必須能解析到 ≥1 個檔案

**使用範例：**
```
/autoresearch:plan
Goal: Make the API respond faster

/autoresearch:plan Increase test coverage to 95%

/autoresearch:plan Reduce bundle size below 200KB
```

精靈完成後，使用者將獲得可直接貼上的 `/autoresearch` 調用指令——或可立即直接啟動。

## 啟動時機

- 使用者執行 `/autoresearch` 或 `/ug:autoresearch` → 執行迴圈
- 使用者執行 `/autoresearch:plan` → 執行規劃精靈
- 使用者執行 `/autoresearch:security` → 執行安全稽核
- 使用者說「help me set up autoresearch」、「plan an autoresearch run」→ 執行規劃精靈
- 使用者說「security audit」、「threat model」、「OWASP」、「STRIDE」、「find vulnerabilities」、「red-team」→ 執行安全稽核
- 使用者執行 `/autoresearch:ship` → 執行交付工作流程
- 使用者說「ship it」、「deploy this」、「publish this」、「launch this」、「get this out the door」→ 執行交付工作流程
- 使用者執行 `/autoresearch:debug` → 執行除錯迴圈
- 使用者說「find all bugs」、「hunt bugs」、「debug this」、「why is this failing」、「investigate」→ 執行除錯迴圈
- 使用者執行 `/autoresearch:fix` → 執行修復迴圈
- 使用者說「fix all errors」、「make tests pass」、「fix the build」、「clean up errors」→ 執行修復迴圈
- 使用者說「work autonomously」、「iterate until done」、「keep improving」、「run overnight」→ 執行迴圈
- 任何需要以可量測結果反覆迭代的任務 → 執行迴圈

## 可選：控制迴圈次數

預設情況下，autoresearch 會**永遠**迴圈直到手動中斷。但使用者可以選擇使用 Claude Code 內建的 `/loop` 指令指定**迴圈次數**來限制迭代。

> **需求：** Claude Code v1.0.32+（`/loop` 指令在此版本引入）

### 使用方式

**無限制（預設）：**
```
/autoresearch
Goal: Increase test coverage to 90%
```

**有限制（N 次迭代）：**
```
/loop 25 /autoresearch
Goal: Increase test coverage to 90%
```

這會將 `/autoresearch` 與 `/loop 25` 串接，精確執行 25 次迭代週期。25 次迭代後，Claude 停止並印出最終摘要。

### 何時使用有限迴圈

| 情境 | 建議 |
|----------|---------------|
| 通宵執行，早上檢視結果 | 無限制（預設） |
| 快速 30 分鐘改善 | `/loop 10 /autoresearch` |
| 範圍明確的針對性修復 | `/loop 5 /autoresearch` |
| 探索性——看看方法是否奏效 | `/loop 15 /autoresearch` |
| CI/CD 流水線整合 | `/loop N /autoresearch`（根據時間預算設定 N） |

### 指定迴圈次數時的行為

當指定了迴圈次數：
- Claude 精確執行 N 次 autoresearch 迴圈迭代
- 第 N 次迭代後，Claude 印出**最終摘要**，包含基準線 → 目前最佳、保留/捨棄/崩潰統計
- 若在 N 次迭代前達成目標，Claude 印出提前完成訊息並停止
- 所有其他規則（原子性變更、機械性驗證、自動回滾）仍然適用

## 設置階段（執行一次）

1. **讀取所有範圍內的檔案**，在任何修改前取得完整上下文
2. **定義目標** — 「更好」是什麼意思？提取或詢問機械性指標：
   - 程式碼：測試通過、建置成功、效能基準提升
   - 內容：達到字數目標、SEO 分數提升、可讀性分數
   - 設計：Lighthouse 分數、無障礙稽核通過
   - 若無指標 → 與使用者共同定義，或使用最簡單的代理指標（例如「編譯無錯誤」）
3. **定義範圍約束** — 哪些檔案可以修改？哪些是唯讀的？
4. **定義防護（Guard，可選）** — 一個必須「始終」通過才能保留變更的指令。用於在優化主要指標時防止迴歸（例如，優化基準時間的同時 `npm test` 必須通過）。若未指定，則不強制執行防護。
5. **建立結果日誌** — 追蹤每次迭代（參見 `references/results-logging.md`）
6. **建立基準線** — 對目前狀態執行驗證與防護（若已設定）。記錄為迭代 #0
7. **確認並開始** — 向使用者呈現設置，取得確認，然後**開始迴圈**

## 迴圈（The Loop）

閱讀 `references/autonomous-loop-protocol.md` 以取得完整協議細節。

```
LOOP (FOREVER or N times):
  1. Review: Read current state + git history + results log
  2. Ideate: Pick next change based on goal, past results, what hasn't been tried
  3. Modify: Make ONE focused change to in-scope files
  4. Commit: Git commit the change (before verification)
  5. Verify: Run the mechanical metric (tests, build, benchmark, etc.)
  6. Guard: If guard is set, run the guard command
  7. Decide:
     - IMPROVED + guard passed (or no guard) → Keep commit, log "keep", advance
     - IMPROVED + guard FAILED → Revert, then try to rework the optimization
       (max 2 attempts) so it improves the metric WITHOUT breaking the guard.
       Never modify guard/test files — adapt the implementation instead.
       If still failing → log "discard (guard failed)" and move on
     - SAME/WORSE → Git revert, log "discard"
     - CRASHED → Try to fix (max 3 attempts), else log "crash" and move on
  8. Log: Record result in results log
  9. Repeat: Go to step 1.
     - If unbounded: NEVER STOP. NEVER ASK "should I continue?"
     - If bounded (N): Stop after N iterations, print final summary
```

## 關鍵規則

1. **迴圈直到完成** — 無限制：迴圈直到中斷。有限制：迴圈 N 次後摘要。
2. **寫前先讀** — 在修改前務必理解完整上下文
3. **每次迭代一個變更** — 原子性（Atomic）變更。若出錯，你能精確知道原因
4. **僅機械性驗證** — 不接受主觀的「看起來不錯」。使用指標
5. **自動回滾（Rollback）** — 失敗的變更立即還原。不爭論
6. **簡單勝出** — 相同結果 + 更少程式碼 = 保留。微小改進 + 醜陋複雜度 = 捨棄
7. **Git 是記憶** — 每個保留的變更都提交。代理讀取歷史記錄以學習模式
8. **卡住時深入思考** — 重新讀取檔案、重新讀取目標、組合接近成功的嘗試、嘗試激進的變更。除非真的被缺少存取/權限阻擋，否則不要求助

## 原則參考

參見 `references/core-principles.md` 以了解 autoresearch 的 7 個可通用原則。

## 適應不同領域

| 領域 | 指標（Metric） | 範圍（Scope） | 驗證指令（Verify Command） | 防護（Guard） |
|--------|--------|-------|----------------|-------|
| 後端程式碼（Backend code） | 測試通過 + 覆蓋率 % | `src/**/*.ts` | `npm test` | — |
| 前端 UI（Frontend UI） | Lighthouse 分數 | `src/components/**` | `npx lighthouse` | `npm test` |
| 機器學習訓練（ML training） | val_bpb / loss | `train.py` | `uv run train.py` | — |
| 部落格/內容（Blog/content） | 字數 + 可讀性 | `content/*.md` | 自訂腳本 | — |
| 效能（Performance） | 基準時間（ms） | 目標檔案 | `npm run bench` | `npm test` |
| 重構（Refactoring） | 測試通過 + 程式碼行數減少 | 目標模組 | `npm test && wc -l` | `npm run typecheck` |
| 安全性（Security） | OWASP + STRIDE 覆蓋率 + 發現項目 | API/auth/middleware | `/autoresearch:security` | — |
| 交付（Shipping） | 清單通過率（%） | 任何產出物 | `/autoresearch:ship` | 特定領域 |
| 除錯（Debugging） | 找到的 Bug 數 + 覆蓋率 | 目標檔案 | `/autoresearch:debug` | — |
| 修復（Fixing） | 錯誤數量（越低越好） | 目標檔案 | `/autoresearch:fix` | `npm test` |

根據你的領域調整迴圈。**原則（Principles）**是通用的；**指標（Metrics）**是特定領域的。
