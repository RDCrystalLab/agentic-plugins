# Excalidraw 外掛

讓 Claude Code 從自然語言描述生成精美且實用的 Excalidraw 圖表。不只是方框加箭頭 — 而是**以視覺來論述**的圖表。

## 特色

- **視覺論述，而非資訊陳列。** 每個形狀都映射它所代表的概念 — 扇出（fan-out）表示一對多、時間軸表示序列、匯聚表示聚合。不會產生千篇一律的卡片方格。
- **證據工件（Evidence Artifacts）。** 技術圖表可包含真實的程式碼片段、實際的 JSON payload 和具體範例。
- **內建視覺驗證。** 基於 Playwright 的渲染管線讓 agent 能看到自己的輸出、抓到版面問題，並在交付前迴圈修正。
- **可自訂品牌風格。** 所有色彩和品牌樣式集中在 `references/color-palette.md`。替換它就能讓所有圖表遵循你的色彩系統。
- **可編輯的 PNG 輸出。** `.excalidraw.png` 格式嵌入了 Excalidraw JSON metadata，所以輸出既可作為一般圖片檢視，也可在 VS Code 或 Excalidraw 中編輯。

## 使用方式

用 `/excalidraw` 呼叫技能：

```
/excalidraw 畫一個微服務系統的架構圖
```

或直接描述需求：

```
畫一個 Excalidraw 圖表，展示一個 5 階段的 CI/CD pipeline
```

技能會自動處理概念映射、版面規劃、JSON 生成、渲染與視覺驗證。

## 工作流程

1. Agent 生成 `.excalidraw` JSON 檔案（大型圖表採分段建構）
2. 透過 Playwright + Excalidraw 原生渲染器轉換為 PNG
3. 檢視結果並在 render-view-fix 迴圈中修正版面問題
4. 交付最終的 `.excalidraw` 和 `.excalidraw.png`

## PNG 匯出

`tools/excalidraw-to-png.py` 使用 Playwright + Excalidraw 的 `exportToSvg()` 將 `.excalidraw` 檔案轉換為 `.excalidraw.png`，產生像素級精確的手繪風格輸出。

```bash
# 首次設定：安裝 headless Chromium
uv run --with 'playwright>=1.40.0' python -m playwright install chromium

# 基本用法
uv run tools/excalidraw-to-png.py diagram.excalidraw

# 自訂輸出路徑
uv run tools/excalidraw-to-png.py diagram.excalidraw -o output.excalidraw.png

# 更高解析度（預設：2x）
uv run tools/excalidraw-to-png.py diagram.excalidraw --scale 3
```

生成的 `.excalidraw.png` 具備以下特性：
- 可當作一般 PNG 圖片使用，帶有原生 Excalidraw 手繪風格渲染
- 嵌入 Excalidraw JSON metadata（tEXt chunk）
- 可在 Excalidraw 或 VS Code 中重新開啟並編輯

## 自訂色彩

編輯 `references/color-palette.md` 以符合你的品牌風格。技能中的其他內容皆為通用設計方法論。

## VS Code 整合

安裝 [Excalidraw](https://marketplace.visualstudio.com/items?itemName=pomdtr.excalidraw-editor) 擴充套件後：

- `.excalidraw` 檔案會自動在視覺編輯器中開啟
- Claude 生成圖表後，你可以直接圖形化編輯
- 可從編輯器匯出為 PNG/SVG

## 檔案結構

```
excalidraw/
  .claude-plugin/
    plugin.json                     # 外掛 metadata
  skills/excalidraw/
    SKILL.md                        # 設計方法論 + 工作流程
    tools/
      excalidraw-to-png.py          # UV 單檔 Playwright 渲染器
    references/
      color-palette.md              # 品牌色彩（編輯此檔以自訂）
      element-templates.md          # 各元素類型的 JSON 模板
      json-schema.md                # Excalidraw JSON 格式參考
      templates/
        sample.excalidraw           # 範例圖表
        sample.excalidraw.png       # 渲染後的範例
  README.md
```
