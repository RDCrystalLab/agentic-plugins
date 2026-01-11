---
name: drawio
description: 當使用者要求 draw.io (diagrams.net) 圖表、流程圖 (flowchart)、架構圖 (architecture diagram)，或需要可匯入 (importable) 的 .drawio XML 時使用此技能。本技能會引導蒐集需求，並輸出可在 diagrams.net 匯入的有效 draw.io XML。
---

# Draw.io (diagrams.net) 圖表技能

此技能用於把文字規格轉換成 **相容於 draw.io 的 `.drawio` XML**，讓使用者能直接在 diagrams.net 匯入。

## 何時使用

當使用者出現以下情境時觸發此技能：
- 提到 **drawio**、**draw.io** 或 **diagrams.net**
- 要求建立 **流程圖 (flowchart)／架構圖 (architecture diagram)／系統圖 (system diagram)**
- 說「**畫流程圖／畫架構圖／畫一張 drawio 圖**」
- 明確要求 **可匯入 (importable) 的 `.drawio` 檔案**

## 工作流程 (Workflow)

1. **釐清圖的目的與範圍**
   - 圖的類型：流程圖 (flowchart)／架構圖 (architecture)／ERD 風格 (ERD-style)／泳道 (swimlanes)
   - 受眾：工程 (engineering)／產品 (product)／維運 (operations)
   - 規模：簡單（≤ 10 個節點）或詳細

2. **蒐集最小規格（不足就提問）**
   - 節點：名稱 + 短標籤
   - 連線：`A -> B`（可選：邊線標籤）
   - 分組：泳道／容器 (lane/container)（例如："Frontend"、"Backend"、"DB"）
   - 樣式偏好（可選）：方向 (LR/TB)、配色、圖示 (icon)

3. **輸出 draw.io XML**
   - 只輸出一個 fenced code block，內含完整 `.drawio` XML
   - 確保可在 diagrams.net 匯入
   - 版面偏好：對齊格線、間距一致、文字易讀

4. **提供匯入步驟**
   - 最短步驟即可：
     - 開啟 `https://app.diagrams.net/`
     - `File -> Import From -> Device`（或把 XML 貼進空白 `.drawio` 檔）

## 輸出規格 (Output contract)

當回覆圖表內容時：
- 只包含 **一段** XML（不要多段 XML 片段）
- 使用 `xml` 的 code fence
- 文件內的 ID 保持一致且可重複使用

## 提問模板（你應該問什麼）

若使用者未提供完整資訊，優先問以下項目：
- 圖表類型與方向 (LR/TB)
- 節點清單
- 邊線清單（含可選標籤）
- 是否需要容器／泳道

範例：

**使用者：**「幫我做一張 Web App 的 draw.io 架構圖」

**助理（提問）：**
- 主要元件有哪些（例如：瀏覽器 (Browser)、CDN、API、背景工作 (Worker)、資料庫 (DB)）？
- 需要哪些邊界／容器（例如：前端／後端／資料層）？
- 希望方向是由左到右，還是由上到下？

## 備註

- 若使用者提供既有 `.drawio` XML 並要求修改，請以「最小變更」方式更新，並回傳完整更新後 XML。
- 若需求不明確，優先提出 2–4 個關鍵問題，不要硬猜。
