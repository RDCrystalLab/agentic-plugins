# Draw.io 插件

使用 Claude Code 以 XML 格式建立和編輯 draw.io 圖表。

## 功能特色

- 生成流程圖、架構圖、序列圖等多種圖表
- 智慧邊緣路由，避免連線重疊
- 版面最佳化，產生清晰易讀的圖表
- XML 驗證與常見問題自動修復

## 核心原則：簡化 AI 生成

本插件採用 [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io) 的關鍵設計理念：

**AI 只需生成 `<mxCell>` 元素，wrapper 結構由系統自動添加。**

這大幅降低了 AI 出錯機率：
- AI 只需專注於圖形元素（mxCell）
- 系統處理 mxfile/diagram/mxGraphModel/root 結構
- 系統自動添加根節點（id="0" 和 id="1"）

## 使用方式

使用 `/drawio` 呼叫技能：

```
/drawio 建立一個顯示登入流程的流程圖
```

或者直接描述你的需求：

```
建立一個 draw.io 圖表，展示包含 4 個組件的 MAPS 框架
```

## AI 生成的關鍵規則

1. **只生成 mxCell 元素** - 不要包含 wrapper 標籤
2. **不要包含根節點** - id="0" 和 id="1" 會自動添加
3. **所有 mxCell 必須是同層級** - 絕對不要將 mxCell 嵌套在另一個 mxCell 內
4. **使用唯一的 ID，從 "2" 開始**
5. **頂層形狀設定 parent="1"**
6. **轉義特殊字符** - `<` 用 `&lt;`，`>` 用 `&gt;`，`&` 用 `&amp;`

## 邊緣路由規則

避免連線重疊的方法：
- 在相同節點間的多條邊使用不同的出入點
- 使用 waypoints 繞過障礙物
- 明確指定 exitX、exitY、entryX、entryY
- 避免使用角落連接（例如 entryX=1, entryY=1）

## 工作流程

1. **思考** mxCell 元素（遵循上述規則）
2. **包裝** 使用完整的 mxfile 模板（在 SKILL.md 中提供）
3. **寫入** .drawio 檔案

Claude 不需要呼叫任何外部工具 - 只需遵循 SKILL.md 的指示即可。

## VS Code 整合

如果你安裝了 [Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio) 擴充套件：

- `.drawio` 檔案會自動在視覺化編輯器中開啟
- 你可以在 Claude 生成圖表後進行圖形化編輯
- 從 VS Code 匯出為 `.drawio.png` 或 `.drawio.svg`

**注意：** Claude 只能生成 `.drawio`（XML）檔案。`.drawio.png` 和 `.drawio.svg` 格式需要圖像渲染，由 VS Code 的擴充套件處理。

## 輔助腳本（可選）

`helpers/` 目錄包含用於除錯和驗證的 TypeScript 工具：

```bash
# 驗證 .drawio 檔案（需要 Bun）
bun helpers/validate-xml.ts diagram.drawio

# 將純 mxCell XML 包裝成 .drawio（需要 Bun）
bun helpers/wrap-mxfile.ts cells.xml output.drawio
```

這些是**可選的**參考實作，用於疑難排解。

## 致謝

XML 驗證與包裝邏輯基於 Dayuan Jiang 的 [next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)。
