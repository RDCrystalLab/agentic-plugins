---
name: excalidraw
description: Create Excalidraw diagrams as .excalidraw JSON files. Use when the user asks to create a diagram, flowchart, architecture visualization, or any visual explanation.
argument-hint: "[diagram description]"
allowed-tools: Write, Read, Bash, Edit
---

# Excalidraw 圖表建立器

生成 `.excalidraw` JSON 檔案。圖表應**以視覺來論述**，而非單純陳列資訊。
依循 `Instructions` 指示，執行 `Workflow`，根據 `Cookbook` 選擇對應流程。

## Variables

ENABLE_SIMPLE_DIAGRAMS: true
ENABLE_TECHNICAL_DIAGRAMS: true

## Instructions

- 生成任何圖表前，先讀取 `references/color-palette.md` — 它是所有色彩選擇的唯一真相來源。
- 根據使用者的請求，依照 `Cookbook` 判斷應使用哪個工作流程。
- 需要澄清使用者需求時，讀取 `prompts/clarify-requirements.md` 模板引導提問。

### 核心哲學

**圖表應該論述（argue），而非展示（display）。** 圖表是一個視覺論述，展示文字無法單獨表達的關係、因果與流程。

- **同構測試（Isomorphism Test）**：如果移除所有文字，結構本身能傳達概念嗎？如果不能，重新設計。
- **教育測試（Education Test）**：看圖的人能從中學到具體的東西嗎？好的圖表會教學 — 展示實際格式、真實的事件名稱、具體範例。

## Workflow

1. 理解使用者的請求。
2. 讀取 `references/color-palette.md` 取得色彩配置。
3. 若需求不明確，讀取 `prompts/clarify-requirements.md` 進行澄清。
4. 評估深度：簡單/概念性，還是全面/技術性？
5. 依照對應的 `Cookbook` 條目執行。
6. 依照下方通用規則生成 JSON。
7. **渲染與驗證**（必要步驟 — 見下方）。
8. 渲染後，讀取 `prompts/review-checklist.md` 進行系統性審查。

## Cookbook

### 簡單 / 概念性圖表

- IF: 圖表是概念性的、抽象的，或受眾不需要技術細節。`ENABLE_SIMPLE_DIAGRAMS` 為 true。
- THEN: 讀取並執行 `cookbook/simple-diagram.md`
- EXAMPLES:
  - "畫一個使用者註冊的流程圖"
  - "用圖表解釋 MVC 架構"
  - "建立一個關注點分離的示意圖"

### 技術 / 全面性圖表

- IF: 圖表需映射真實系統、協定或架構，且需包含具體細節。`ENABLE_TECHNICAL_DIAGRAMS` 為 true。
- THEN: 讀取並執行 `cookbook/technical-diagram.md`
- EXAMPLES:
  - "畫 Kubernetes Pod 網路架構圖"
  - "繪製 OAuth2 Authorization Code Flow"
  - "視覺化 AG-UI 協定如何與 CopilotKit 整合"

### 大型 / 多區段圖表

- IF: 圖表需要超過 ~15 個元素或包含多個視覺區段。
- THEN: 除了上方對應的 cookbook 外，另外讀取 `cookbook/large-diagram-strategy.md`。
- EXAMPLES:
  - "建立完整的微服務架構圖"
  - "畫一個包含所有階段的 CI/CD pipeline"

### 視覺模式參考

- IF: 需要為概念選擇合適的視覺模式。
- THEN: 讀取 `cookbook/visual-patterns.md`

---

## 通用規則

### 美學設定
- `roughness: 0` — 乾淨俐落的邊緣（專業圖表的預設值）
- `strokeWidth: 2` — 形狀和主要箭頭的標準寬度
- `opacity: 100` — 所有元素一律使用
- `fontFamily: 3` — 等寬字體
- `fontSize: 16`, `textAlign: "center"`, `verticalAlign: "middle"`
- 多行文字：在 `"text"` 和 `"originalText"` 中使用 `\n`
- 格線對齊：座標對齊到 10 的倍數（格線為 20px）

### 版面配置
- **主角（Hero）**：300x150 — 視覺錨點，最重要
- **主要（Primary）**：180x90
- **次要（Secondary）**：120x60
- **小型（Small）**：60x40
- 最重要的元素周圍應有最多空白（200px+）
- 引導視線：序列通常從左到右或從上到下

### JSON 結構

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [...],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": 20
  },
  "files": {}
}
```

元素模板：`references/element-templates.md`
完整 JSON schema：`references/json-schema.md`

### 常見錯誤（必須避免）

1. **容器太小** — 若矩形內含其他矩形，容器要做得顯著更大。子元素間距 >= 60px。
2. **文字對齊方式不匹配** — 容器矩形：標籤左上方（`textAlign: "left"`, `verticalAlign: "top"`）。葉節點矩形：標籤置中。
3. **箭頭被形狀遮蔽** — 箭頭必須在形狀之上渲染（在 elements 陣列中排在矩形之後）。擁擠區域使用折線路由。
4. **外部長線穿越核心區域** — 長的 ingress/外部箭頭沿外圍邊距路由，不要穿過擁擠的核心。
5. **中心因標籤和線條而雜亂** — 箭頭標籤保持簡短，定位在彎折處或密集中心之外。
6. **千篇一律的卡片方格** — 每個主要概念必須使用不同的視覺模式。
7. **每段文字都加方框** — 預設使用浮動文字。目標：<30% 的文字元素位於容器內。

---

## 渲染與驗證（必要步驟）

單從 JSON 無法判斷圖表品質。生成或編輯 Excalidraw JSON 後，必須渲染為 PNG、檢視圖片、修正看到的問題。

### 如何渲染

```bash
uv run tools/excalidraw-to-png.py <path-to-file.excalidraw>
```

這會在原始檔案旁輸出 `.excalidraw.png`。然後使用 **Read tool** 檢視 PNG。

### 迴圈流程

1. **渲染並檢視** — 執行渲染腳本，然後 Read PNG。
2. **對照設計審查** — 視覺結構是否符合規劃的概念結構？
3. **檢查缺陷** — 文字裁切、重疊、箭頭穿越元素、間距不均、文字過小。
4. **修正** — 編輯 JSON 解決問題（擴大容器、調整座標、加入箭頭中繼點、調整尺寸）。
5. **重新渲染並檢視** — 重複直到通過設計審查和缺陷檢查。通常需要 2-4 次迭代。
6. **系統性審查** — 讀取 `prompts/review-checklist.md`，逐項檢查。

### 首次設定

```bash
uv run --with 'playwright>=1.40.0' python -m playwright install chromium
```

---

## 參考資料

- 範例圖表：`references/templates/sample.excalidraw`
- 色彩系統：`references/color-palette.md`
- 元素模板：`references/element-templates.md`
- JSON schema：`references/json-schema.md`
