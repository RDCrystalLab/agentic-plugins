# 規劃工作流程——/autoresearch:plan

將文字目標轉換為已驗證、可立即執行的 autoresearch 設定。

**輸出：** 完整的 `/autoresearch` 呼叫指令，包含範圍（Scope）、指標（Metric）、方向（Direction）和驗證指令（Verify）——全部在啟動前驗證完畢。

## 觸發條件

- 使用者呼叫 `/autoresearch:plan`
- 使用者說「幫我設定 autoresearch」、「規劃 autoresearch 執行」、「我的指標應該是什麼」

## 工作流程

### 第 1 步：擷取目標

若未提供目標，詢問：

```
AskUserQuestion:
  question: "你想改善什麼？用白話描述你的目標。"
  header: "目標"
  options:
    - label: "程式碼品質"
      description: "測試、覆蓋率、型別安全、Lint、Bundle 大小"
    - label: "效能"
      description: "回應時間、建置速度、Lighthouse 分數、記憶體使用量"
    - label: "內容"
      description: "SEO 分數、可讀性、字數、關鍵字密度"
    - label: "重構"
      description: "減少程式碼行數、消除模式、簡化架構"
```

若使用者直接提供目標文字，跳到第 2 步。

### 第 2 步：分析上下文

1. 讀取程式碼庫結構（package.json、專案檔案、測試設定）
2. 識別領域：後端、前端、ML、內容、DevOps 等
3. 偵測現有工具：測試執行器、Lint 工具、打包器、Benchmark 腳本
4. 從目標 + 工具推斷可能的指標候選項

### 第 3 步：定義範圍

根據程式碼庫分析，提出範圍選項：

```
AskUserQuestion:
  question: "autoresearch 可以修改哪些檔案？"
  header: "範圍"
  options:
    - label: "{inferred_scope_1}"
      description: "{file count} 個檔案——{rationale}"
    - label: "{inferred_scope_2}"
      description: "{file count} 個檔案——{rationale}"
    - label: "整個專案"
      description: "所有原始碼檔案（謹慎使用）"
```

**範圍驗證規則：**
- 範圍至少要解析到 1 個檔案（執行 glob，確認匹配）
- 若範圍超過 50 個檔案則發出警告（代理上下文可能不足）
- 若範圍同時包含測試檔案和原始碼，建議分開

### 第 4 步：定義指標

這是關鍵步驟。指標必須是**機械化的**——可從指令輸出中提取為單一數字。

根據目標 + 工具，提出指標選項：

```
AskUserQuestion:
  question: "哪個數字能告訴你情況有沒有改善？選擇機械化指標。"
  header: "指標"
  options:
    - label: "{metric_1}（推薦）"
      description: "{what it measures}——提取方式：{command snippet}"
    - label: "{metric_2}"
      description: "{what it measures}——提取方式：{command snippet}"
    - label: "{metric_3}"
      description: "{what it measures}——提取方式：{command snippet}"
```

**指標驗證規則（重要）：**

| 檢查項目 | 通過 | 不通過 |
|---------|------|--------|
| 輸出數字 | `87.3`、`0.95`、`42` | `PASS`、`looks good`、`✓` |
| 可由指令提取 | `grep`、`awk`、`jq` | 需要人工判斷 |
| 確定性 | 相同輸入 → 相同輸出 | 隨機、不穩定、時間相依 |
| 快速 | < 30 秒 | > 2 分鐘 |

若指標未通過驗證，說明原因並建議替代方案。**在指標機械化之前不要繼續。**

### 第 4.5 步：定義防護（可選）

詢問使用者是否需要防護指令以防止回歸：

```
AskUserQuestion:
  question: "需要防護指令嗎？這是一個安全網，必須始終通過——在優化時保護現有行為。"
  header: "防護"
  options:
    - label: "是——用測試作為防護（推薦）"
      description: "{detected_test_command} 必須在每次保留的變更中通過"
    - label: "是——自訂防護"
      description: "我自己提供防護指令"
    - label: "不需要防護"
      description: "跳過——指標已足夠（例如，測試覆蓋率中測試本身就是指標）"
```

**防護建議規則：**
- 若指標是效能/Benchmark/Bundle 大小 → 建議以 `{test_command}` 作為防護
- 若指標是 Lighthouse/無障礙 → 建議以 `{test_command}` 作為防護
- 若指標是重構（減少程式碼行數）→ 建議以 `{test_command} && {typecheck_command}` 作為防護
- 若指標**本身就是**測試（覆蓋率、通過數量）→ 預設建議「不需要防護」
- 若未偵測到測試執行器 → 建議「不需要防護」並附帶說明

**防護驗證：** 若設定了防護，先執行一次確認它在目前程式碼庫上通過。若失敗，協助使用者修復後再繼續。

### 第 5 步：定義方向

```
AskUserQuestion:
  question: "你的指標是越高越好還是越低越好？"
  header: "方向"
  options:
    - label: "越高越好"
      description: "覆蓋率%、分數、通過測試數量、吞吐量"
    - label: "越低越好"
      description: "錯誤數、回應時間、Bundle 大小、程式碼行數"
```

### 第 6 步：定義驗證指令

建構滿足以下條件的驗證指令：
1. 執行工具/測試/Benchmark
2. 將指標提取為單一數字
3. 成功時 exit 0，崩潰時 exit 非零

呈現建構的指令：

```
AskUserQuestion:
  question: "這是我每次迭代都會執行的驗證指令。這樣可以嗎？"
  header: "驗證指令"
  options:
    - label: "看起來沒問題，使用這個（推薦）"
      description: "{full_verify_command}"
    - label: "修改一下"
      description: "我來調整指令"
    - label: "我有自己的指令"
      description: "讓我提供自訂驗證指令"
```

**驗證指令強制驗證（必須執行試運行後才接受）：**

1. 在目前程式碼庫上**試運行**驗證指令
2. 確認 exit code 為 0
3. 確認輸出包含可解析的數字
4. 記錄基準線指標值
5. 若試運行失敗 → 顯示錯誤，請使用者修復，重新驗證

```
試運行結果：
  Exit code：{0 或錯誤}
  輸出片段：{相關行}
  提取的指標：{數字}
  基準線：{數字}
  狀態：✓ 有效 / ✗ 無效——{原因}
```

**若驗證指令試運行失敗，不要繼續。** 協助使用者修復。

### 第 7 步：確認並啟動

呈現完整設定：

```markdown
## Autoresearch 設定

**目標：** {使用者目標}
**範圍：** {glob pattern}
**指標：** {metric name}（{方向}）
**驗證：** `{command}`
**防護：** `{guard_command}` *（或「無」）*
**基準線：** {試運行值}

### 可直接使用的指令：

/autoresearch
Goal: {goal}
Scope: {scope}
Metric: {metric}（{direction}）
Verify: {verify_command}
Guard: {guard_command}
```

若未設定防護，輸出中省略 Guard 行。

然後詢問：

```
AskUserQuestion:
  question: "設定已驗證。你想如何執行？"
  header: "啟動"
  options:
    - label: "立即啟動——無限制（推薦）"
      description: "立即啟動 /autoresearch，迴圈直到中斷"
    - label: "立即啟動——有界"
      description: "執行固定次數的迭代（我會詢問次數）"
    - label: "只複製設定"
      description: "只顯示指令，我稍後自己執行"
```

若選「立即啟動——無限制」：使用設定呼叫 `/autoresearch`。
若選「立即啟動——有界」：詢問迭代次數，然後呼叫 `/loop N /autoresearch`。
若選「只複製設定」：輸出可貼上的指令區塊後停止。

## 指標建議資料庫

根據偵測到的領域/工具，以這些作為起點：

### 程式碼品質
| 目標模式 | 指標 | 驗證範本 |
|---------|------|---------|
| 測試覆蓋率 | 覆蓋率 % | `{test_runner} --coverage \| grep "All files"` |
| 型別安全 | `any` 數量 | `grep -r ":\s*any" {scope} --include="*.ts" \| wc -l` |
| Lint 錯誤 | 錯誤數 | `{linter} {scope} 2>&1 \| grep -c "error"` |
| 建置錯誤 | 錯誤數 | `{build_cmd} 2>&1 \| grep -c "error"` |

### 效能
| 目標模式 | 指標 | 驗證範本 |
|---------|------|---------|
| Bundle 大小 | KB | `{build_cmd} 2>&1 \| grep "First Load JS"` |
| 回應時間 | ms | `{bench_cmd} \| grep "p95"` |
| Lighthouse | 0-100 分 | `npx lighthouse {url} --output json --quiet \| jq '.categories.performance.score * 100'` |
| 建置時間 | 秒 | `time {build_cmd} 2>&1 \| grep real` |

### 內容
| 目標模式 | 指標 | 驗證範本 |
|---------|------|---------|
| 可讀性 | Flesch 分數 | `node scripts/readability.js {file}` |
| 字數 | 字數 | `wc -w {scope}` |
| SEO 分數 | 0-100 分 | `node scripts/seo-score.js {file}` |

### 重構
| 目標模式 | 指標 | 驗證範本 |
|---------|------|---------|
| 減少程式碼行數 | 行數 | `{test_cmd} && find {scope} -name "*.ts" \| xargs wc -l \| tail -1` |
| 降低複雜度 | 循環複雜度 | `npx complexity-report {scope} \| grep "average"` |
| 消除模式 | 模式數量 | `grep -r "{pattern}" {scope} \| wc -l` |

## 錯誤恢復

| 錯誤 | 恢復方式 |
|------|---------|
| 未偵測到測試執行器 | 詢問使用者提供測試指令 |
| 驗證指令失敗 | 顯示錯誤，建議修復，重新驗證 |
| 指標無法解析 | 建議加入 `grep`/`awk` 提取數字 |
| 範圍解析到 0 個檔案 | 顯示 glob 結果，請使用者修復模式 |
| 範圍過廣（>100 個檔案） | 建議縮小範圍，警告上下文限制 |

## 反模式

- **不要接受主觀指標** — 「看起來更好」不是指標
- **不要跳過試運行** — 始終驗證驗證指令可以運作
- **不要建議你沒測試過的驗證指令** — 先執行
- **不要用太多問題淹沒使用者** — 所有步驟合計最多 5-6 個問題
- **不要在未得到明確使用者同意的情況下自動啟動** — 始終在第 7 步確認
