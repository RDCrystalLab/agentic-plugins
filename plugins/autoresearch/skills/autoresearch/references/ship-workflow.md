# Ship 工作流程 — /autoresearch:ship

通用交付（Ship）工作流程，將 autoresearch 迴圈原則應用於最後一哩路——把任何事物從「完成」推進到「部署/發布/交付」。適用於程式碼、內容、行銷、業務、研究、設計，或任何需要觸達受眾的產出物。

**核心概念：** 無論領域為何，交付都遵循一個通用模式。識別（Identify）→ 清單（Checklist）→ 準備（Prepare）→ 模擬（Dry-run）→ 交付（Ship）→ 驗證（Verify）→ 記錄（Log）。

## 觸發條件

- 使用者執行 `/autoresearch:ship`
- 使用者說「ship it」、「deploy this」、「publish this」、「launch this」、「release this」
- 使用者說「get this out the door」、「push to prod」、「send this out」、「go live」

## 迴圈支援

支援有限模式（bounded mode），用於迭代式的交付前準備：

```
# Ship with automatic preparation loop
/autoresearch:ship

# Bounded preparation — iterate N times before shipping
/loop 10 /autoresearch:ship

# Ship specific artifact
/autoresearch:ship
Target: src/features/auth/**
Destination: production
```

## 架構

```
/autoresearch:ship
  ├── Phase 1: Identify（識別 — 我們要交付什麼？）
  ├── Phase 2: Inventory（清點 — 目前狀態為何？）
  ├── Phase 3: Checklist（清單 — 特定領域的交付前關卡）
  ├── Phase 4: Prepare（準備 — autoresearch 迴圈直到清單全部通過）
  ├── Phase 5: Dry-run（模擬 — 模擬交付動作）
  ├── Phase 6: Ship（交付 — 執行實際的發布）
  ├── Phase 7: Verify（驗證 — 交付後的健康檢查）
  └── Phase 8: Log（記錄 — 記錄本次交付）
```

## Phase 1：識別（Identify）— 我們要交付什麼？

從上下文自動偵測交付類型，或詢問使用者。

**偵測演算法：**
```
FUNCTION detectShipmentType(context):
  # Check explicit user input first
  IF user specifies type → USE IT

  # Auto-detect from context
  IF git diff has staged changes OR user mentions "deploy/release/merge":
    IF has Dockerfile/k8s/deploy configs → "deployment"
    IF has open PR or branch changes → "code-pr"
    ELSE → "code-release"

  IF context mentions "blog/article/post" OR target files are *.md in content/:
    → "content"

  IF context mentions "email/campaign/newsletter":
    → "marketing-email"

  IF context mentions "landing page/ad/social":
    → "marketing-campaign"

  IF context mentions "deck/proposal/pitch/quote":
    → "sales"

  IF context mentions "paper/report/analysis/findings":
    → "research"

  IF context mentions "assets/mockup/design/figma":
    → "design"

  # Default: ask user
  → ASK "What are you shipping? (code/content/marketing/sales/research/design/other)"
```

**輸出：** `✓ Phase 1: Identified shipment — [type]: [brief description]`

## Phase 2：清點（Inventory）— 現況評估

掃描產出物及其環境，了解準備程度。

**各交付類型需蒐集的資訊：**

| 類型 | 清點項目 |
|------|-----------------|
| code-pr | 變更的檔案、測試狀態、Lint 狀態、PR 說明、審查狀態 |
| code-release | 版本標籤、變更日誌（Changelog）、遷移狀態、依賴套件稽核 |
| deployment | 建置狀態、環境變數、基礎設施健康狀態、回滾（Rollback）計畫 |
| content | 字數、連結檢查、圖片是否存在、Metadata/Frontmatter |
| marketing-email | 主旨行、預覽文字、連結、退訂連結、CAN-SPAM 合規性 |
| marketing-campaign | 素材是否就緒、追蹤像素、UTM 參數、A/B 變體 |
| sales | 定價是否最新、品牌一致性、聯絡資訊、CTA 是否清晰 |
| research | 引用是否完整、研究方法說明、資料來源連結 |
| design | 匯出格式、響應式（Responsive）變體、無障礙性（Accessibility）檢查 |

**輸出：** `✓ Phase 2: Inventory complete — [N] items assessed, [M] gaps found`

## Phase 3：清單（Checklist）— 特定領域的交付前關卡

根據交付類型產生機械性清單。每一項必須可驗證（通過/失敗）。

### 程式碼清單

**code-pr：**
- [ ] 所有測試通過（`npm test` / `pytest` / 語言對應工具）
- [ ] Lint 乾淨（無錯誤，警告可接受）
- [ ] 型別檢查通過（如適用）
- [ ] PR 說明說明了「為什麼（why）」
- [ ] Diff 中無機密資訊（`git diff --cached | grep -i "password\|secret\|api_key"`）
- [ ] 新程式碼中無 TODO/FIXME（或已記錄為刻意保留）
- [ ] 破壞性變更（Breaking changes）已記錄（如有）
- [ ] 已指派審查者或審查已完成

**code-release：**
- [ ] 所有 code-pr 檢查通過
- [ ] 版本號已在 package.json/pyproject.toml/Cargo.toml 中更新
- [ ] CHANGELOG 已更新發布說明
- [ ] 遷移腳本（Migration scripts）已測試（如有 DB 變更）
- [ ] 依賴套件稽核乾淨（`npm audit` / `pip audit`）
- [ ] 已建立與版本相符的 Tag

**deployment：**
- [ ] 所有 code-release 檢查通過
- [ ] CI 建置成功
- [ ] 目標環境的環境變數已設定
- [ ] 健康檢查端點（Health check endpoint）正常回應
- [ ] 回滾（Rollback）計畫已記錄
- [ ] 監控/告警已配置
- [ ] Feature flags 已正確設定

### 內容清單

**content（部落格/文件）：**
- [ ] 標題存在且具描述性
- [ ] 無失效連結（內部或外部）
- [ ] 圖片有替代文字（alt text）
- [ ] Meta description 存在（≤160 字元）
- [ ] 無佔位符文字（「Lorem ipsum」、「TODO」、「TBD」）
- [ ] 文法/拼字檢查通過
- [ ] 發布日期已設定
- [ ] 作者署名存在

### 行銷清單

**marketing-email：**
- [ ] 主旨行存在（建議 ≤60 字元）
- [ ] 預覽文字（Preview text）已設定
- [ ] 所有連結有效且附有追蹤（UTM 參數）
- [ ] 退訂連結存在且有效
- [ ] 實體地址已包含（CAN-SPAM 要求）
- [ ] 行動裝置響應式呈現正常（測試渲染）
- [ ] 純文字備用版本存在
- [ ] 寄件者名稱與回覆地址（reply-to）已配置

**marketing-campaign：**
- [ ] 所有創意素材（Creative assets）已定稿
- [ ] 追蹤像素/UTM 參數已配置
- [ ] 目標受眾已定義並分群
- [ ] 預算已分配並核准
- [ ] 登陸頁面（Landing page）已上線並測試
- [ ] A/B 測試變體已設定（如適用）
- [ ] 排程已確認

### 業務清單

**sales（簡報/提案）：**
- [ ] 整份文件中的公司/潛在客戶名稱正確
- [ ] 定價是最新且核准的
- [ ] 聯絡資訊正確
- [ ] 品牌一致（Logo、顏色、字體）
- [ ] 競爭對手名稱無拼字錯誤
- [ ] CTA 清晰且具行動力
- [ ] 附加的案例研究/客戶見證是最新的
- [ ] 檔案格式適當（外部用 PDF，內部用可編輯格式）

### 研究清單

**research（論文/報告）：**
- [ ] 摘要（Abstract）/執行摘要存在
- [ ] 所有引用格式正確
- [ ] 資料來源已連結且可存取
- [ ] 研究方法（Methodology）章節完整
- [ ] 圖表已加標題並被引用
- [ ] 結論呼應既定假設
- [ ] 致謝（Acknowledgments）已包含
- [ ] 無佔位符引用（「[citation needed]」）

### 設計清單

**design（素材/原型）：**
- [ ] 所有要求的格式已匯出（PNG、SVG、PDF）
- [ ] 已提供響應式變體（手機、平板、桌面）
- [ ] 色彩對比符合 WCAG AA（文字 4.5:1）
- [ ] 無佔位符圖片或文字
- [ ] 原始檔案已整理並命名
- [ ] 遵循品牌規範
- [ ] 交接說明/規格（Handoff notes/specs）已記錄

**輸出：** `✓ Phase 3: Checklist generated — [N] items, [P] passing, [F] failing`

## Phase 4：準備（Prepare）— 迭代改善迴圈

應用 autoresearch 迴圈來修正未通過的清單項目。

```
metric = count_passing_checklist_items / total_checklist_items * 100
direction = higher_is_better
target = 100 (all items pass)

LOOP (until all pass OR max iterations):
  1. Read checklist status
  2. Pick highest-priority failing item
  3. Fix it (one atomic change)
  4. Re-run checklist verification
  5. IF item now passes → keep, log "fixed: [item]"
  6. IF item still fails → revert, try different approach
  7. IF all items pass → EXIT LOOP with "ready to ship"
```

**修正優先順序：**
1. **阻斷項（Blockers）** — 安全問題、建置失敗、缺少關鍵內容
2. **必要項（Required）** — 測試、Lint、連結、合規性項目
3. **建議項（Recommended）** — 說明、文件、潤色

**可自動修正的項目：**
- 執行測試套件並修正失敗
- 自動修正 Lint 錯誤
- 補充缺少的 Meta description
- 從 git log 產生變更日誌（Changelog）條目
- 檢查並修正失效連結
- 為圖片加上替代文字（描述或提示使用者）
- 格式化引用
- 匯出缺少的設計格式

**需要人工介入的項目：**
- 定價核准
- 法務審查簽核
- 品牌核准
- 策略決策（A/B 測試變體）
- → 標記這些項目並詢問使用者，不要因此阻塞流程

**輸出：** `✓ Phase 4: Preparation complete — [N/N] checklist items passing`

## Phase 5：模擬（Dry-Run）— 交付前先模擬

在不產生副作用的情況下，模擬執行交付動作。

| 類型 | 模擬動作 |
|------|---------------|
| code-pr | `gh pr create --draft` 或預覽 PR diff |
| code-release | 在本地建立 Tag（不推送），預覽 Changelog |
| deployment | 建置 Docker image，在本地執行健康檢查 |
| content | 預覽渲染，檢查所有連結是否可解析 |
| marketing-email | 將測試郵件寄送至寄件者自己的信箱 |
| marketing-campaign | 在廣告平台預覽，估算觸及人數 |
| sales | 預覽 PDF 渲染，檢查所有頁面 |
| research | 匯出至最終格式，檢查分頁 |
| design | 預覽所有匯出格式，檢查尺寸 |

**模擬關卡（Dry-run gate）：**
- 向使用者呈現模擬結果
- `--auto` 旗標：若無錯誤則自動核准
- 預設：在繼續前詢問使用者「Ready to ship?」
- `--dry-run` 旗標：在此停止，不執行實際交付

**輸出：** `✓ Phase 5: Dry-run complete — [result summary]`

## Phase 6：交付（Ship）— 執行發布

實際的交付動作，因領域而異。

| 類型 | 交付動作 |
|------|------------|
| code-pr | `gh pr create` 附上完整說明，指派審查者 |
| code-release | `git tag`、`git push --tags`、建立 GitHub release |
| deployment | 推送至部署分支（deploy branch）、觸發 CI/CD，或 `kubectl apply` |
| content | 透過 CMS API 發布，或提交至內容分支（content branch） |
| marketing-email | 透過 ESP API 發送（SendGrid、Mailchimp 等） |
| marketing-campaign | 在廣告平台啟動活動 |
| sales | 寄送附件郵件或分享連結 |
| research | 上傳至資料庫，提交至期刊/平台 |
| design | 上傳至素材庫，與利害關係人分享 |

**安全防護（Safety rails）：**
- 確認目標環境（Staging vs Production、草稿 vs 發布）
- 記錄所採取的確切指令/動作
- 記錄時間戳記
- 擷取任何回應/確認 ID

**輸出：** `✓ Phase 6: Shipped — [action taken] at [timestamp]`

## Phase 7：驗證（Verify）— 交付後健康檢查

確認交付已實際落地並健康運作。

| 類型 | 驗證方式 |
|------|-------------|
| code-pr | PR 已建立，CI 正在執行，連結可存取 |
| code-release | Tag 可見，Release 頁面已發布，附件已附上 |
| deployment | 健康端點回傳 200，日誌中無錯誤峰值 |
| content | 頁面可載入，連結有效，出現在 Sitemap 中 |
| marketing-email | 送達率 > 95%，無退信（Bounce）峰值 |
| marketing-campaign | 廣告正在投放，登陸頁面可載入，追蹤正在觸發 |
| sales | 郵件已送達，連結追蹤已啟用 |
| research | 可透過 URL/DOI 存取，已正確索引 |
| design | 素材可下載，尺寸正確 |

**交付後監控（使用 `--monitor N` 旗標）：**
```
FOR N minutes:
  Check health metrics every 60 seconds
  IF anomaly detected → ALERT user immediately
  Log metrics to ship-log
```

**輸出：** `✓ Phase 7: Verified — [health status summary]`

## Phase 8：記錄（Log）— 記錄本次交付

建立交付日誌條目以確保可追溯性（Traceability）。

**日誌格式（附加至 `ship-log.tsv`）：**
```tsv
timestamp	type	target	checklist_score	dry_run	shipped	verified	duration	notes
2026-03-16T14:30:00Z	code-pr	#42	18/18	pass	pass	pass	4m32s	auth feature PR
```

**摘要輸出：**
```
=== Ship Complete ===
Type: [shipment type]
Target: [where it went]
Checklist: [P/T] items passed
Duration: [total time]
Status: SHIPPED ✓
```

## 旗標（Flags）

| 旗標 | 用途 |
|------|---------|
| `--dry-run` | 執行所有階段但不實際交付（在 Phase 5 停止） |
| `--auto` | 若無錯誤則自動核准模擬關卡 |
| `--force` | 跳過非關鍵清單項目（阻斷項仍強制執行） |
| `--rollback` | 撤銷上一次交付動作（若可還原） |
| `--monitor N` | 交付後監控 N 分鐘 |
| `--type <type>` | 以明確的交付類型覆蓋自動偵測 |
| `--checklist-only` | 僅產生並評估清單（在 Phase 3 停止） |

## 複合指標（Composite Metric）

在有限迴圈模式下，交付準備度指標：

```
ship_score = (checklist_passing / checklist_total) * 80
           + (dry_run_passed ? 15 : 0)
           + (no_blockers ? 5 : 0)
```

- **100** = 完全準備好交付
- **80-99** = 有小項目待處理，仍可交付（可使用 `--force`）
- **<80** = 尚未準備好，繼續準備

## 回滾協議（Rollback Protocol）

若指定了 `--rollback` 或交付後驗證失敗：

| 類型 | 回滾動作 |
|------|----------------|
| code-pr | 關閉 PR：`gh pr close` |
| code-release | 刪除 Tag：`git tag -d` + `git push --delete origin` |
| deployment | 還原部署：`git revert` 或 `kubectl rollback` |
| content | 取消發布或還原為草稿 |
| marketing-email | 無法回滾（標記為「已發送」） |
| marketing-campaign | 在廣告平台暫停活動 |
| sales | 發送更正/後續郵件 |
| research | 申請撤稿或更新 |
| design | 在素材庫中還原至前一版本 |

**不可還原的動作**（電子郵件、部分出版品）將在 Phase 6 交付前標記告知使用者。

## 輸出目錄

建立 `ship/{YYMMDD}-{HHMM}-{ship-slug}/`，包含：
- `checklist.md` — 完整清單及通過/失敗狀態
- `ship-log.tsv` — 迭代日誌（若執行了準備迴圈）
- `summary.md` — 最終交付報告
