---
name: drawio
description: 建立和編輯 draw.io 圖表的 XML 格式。當使用者想要建立流程圖、架構圖、序列圖或任何視覺化圖表時使用。處理 XML 結構、樣式、字型、箭頭、連接線和 PNG 匯出。
---

# Draw.io 圖表技能

直接以 XML 格式建立和編輯 draw.io 檔案（.drawio）的技能。

## 核心原則：簡化 AI 任務

**重要：只生成 mxCell 元素，wrapper 結構由系統自動添加。**

這種設計大幅降低 AI 出錯機率：
- AI 只需專注於圖形元素（mxCell）
- 系統自動處理 mxfile/diagram/mxGraphModel/root 結構
- 系統自動添加根節點（id="0" 和 id="1"）

## 關鍵規則

### 生成規則（必須遵守）

1. **只生成 mxCell 元素** - 不要包含 `<mxfile>`, `<diagram>`, `<mxGraphModel>`, `<root>` 等 wrapper 標籤
2. **不要包含根節點** - 不要生成 `id="0"` 或 `id="1"` 的 mxCell（系統自動添加）
3. **所有 mxCell 必須是同層級** - 絕對不要將 mxCell 嵌套在另一個 mxCell 內
4. **使用唯一的連續 ID** - 從 "2" 開始
5. **設定正確的 parent** - 頂層元素用 `parent="1"`，群組內元素用 `parent="<container-id>"`
6. **特殊字符必須轉義** - `<` 用 `&lt;`，`>` 用 `&gt;`，`&` 用 `&amp;`，`"` 用 `&quot;`

### 正確範例

AI 只需生成這樣的內容：

```xml
<mxCell id="2" value="開始" style="rounded=1;whiteSpace=wrap;html=1;fontFamily=Helvetica;fontSize=18;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
<mxCell id="3" value="處理" style="rounded=1;whiteSpace=wrap;html=1;fontFamily=Helvetica;fontSize=18;fillColor=#d5e8d4;strokeColor=#82b366;" vertex="1" parent="1">
  <mxGeometry x="100" y="200" width="120" height="60" as="geometry"/>
</mxCell>
<mxCell id="4" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=classic;" edge="1" parent="1" source="2" target="3">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

系統會自動包裝成完整的 .drawio 檔案。

### 錯誤範例（不要這樣做）

```xml
<!-- 錯誤：包含了 wrapper 標籤 -->
<mxfile>
  <diagram>
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ...
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## mxCell 元素參考

### 形狀（Shapes）

#### 矩形
```xml
<mxCell id="2" value="標籤" style="rounded=0;whiteSpace=wrap;html=1;fontFamily=Helvetica;fontSize=18;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
```

#### 圓角矩形
```xml
<mxCell id="2" value="標籤" style="rounded=1;whiteSpace=wrap;html=1;fontFamily=Helvetica;fontSize=18;arcSize=20;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="60" as="geometry"/>
</mxCell>
```

#### 橢圓
```xml
<mxCell id="2" value="標籤" style="ellipse;whiteSpace=wrap;html=1;fontFamily=Helvetica;fontSize=18;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="80" as="geometry"/>
</mxCell>
```

#### 菱形（決策）
```xml
<mxCell id="2" value="條件?" style="rhombus;whiteSpace=wrap;html=1;fontFamily=Helvetica;fontSize=18;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="100" height="100" as="geometry"/>
</mxCell>
```

#### 純文字
```xml
<mxCell id="2" value="文字" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontFamily=Helvetica;fontSize=18;" vertex="1" parent="1">
  <mxGeometry x="100" y="100" width="120" height="30" as="geometry"/>
</mxCell>
```

#### 泳道（Swimlane）
```xml
<mxCell id="lane1" value="前端" style="swimlane;fontFamily=Helvetica;fontSize=16;" vertex="1" parent="1">
  <mxGeometry x="40" y="40" width="200" height="200" as="geometry"/>
</mxCell>
<mxCell id="step1" value="步驟 1" style="rounded=1;fontFamily=Helvetica;" vertex="1" parent="lane1">
  <mxGeometry x="20" y="60" width="160" height="40" as="geometry"/>
</mxCell>
```

### 連接線（Edges）

#### 基本箭頭
```xml
<mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=classic;" edge="1" parent="1" source="2" target="3">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

#### 帶標籤的箭頭
```xml
<mxCell id="e1" value="標籤" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=classic;fontFamily=Helvetica;fontSize=14;" edge="1" parent="1" source="2" target="3">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

#### 虛線箭頭
```xml
<mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;dashed=1;endArrow=classic;" edge="1" parent="1" source="2" target="3">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

#### 帶 waypoints 的箭頭（繞過障礙物）
```xml
<mxCell id="e1" style="edgeStyle=orthogonalEdgeStyle;exitX=0.5;exitY=1;entryX=0.5;entryY=0;endArrow=classic;" edge="1" parent="1" source="2" target="5">
  <mxGeometry relative="1" as="geometry">
    <Array as="points">
      <mxPoint x="160" y="350"/>
      <mxPoint x="400" y="350"/>
    </Array>
  </mxGeometry>
</mxCell>
```

## 邊緣路由規則（避免重疊）

### 規則 1：不要讓多條邊共享相同路徑
- 如果兩條邊連接相同節點，必須使用不同的 exit/entry 位置
- 使用 `exitY=0.3` 和 `exitY=0.7` 區分（不要都用 0.5）

### 規則 2：雙向連接使用相反側
```xml
<!-- A→B: 從 A 的右側出發，進入 B 的左側 -->
<mxCell id="e1" style="exitX=1;exitY=0.5;entryX=0;entryY=0.5;endArrow=classic;" edge="1" source="a" target="b">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
<!-- B→A: 從 B 的左側出發，進入 A 的右側 -->
<mxCell id="e2" style="exitX=0;exitY=0.5;entryX=1;entryY=0.5;endArrow=classic;" edge="1" source="b" target="a">
  <mxGeometry relative="1" as="geometry"/>
</mxCell>
```

### 規則 3：明確指定 exitX, exitY, entryX, entryY
每條邊都應該設定這 4 個屬性以獲得精確控制。

### 規則 4：繞過中間形狀（障礙物避讓）
- 生成邊之前，識別所有位於 source 和 target 之間的形狀
- 如果有形狀在直接路徑上，必須使用 waypoints 繞過
- 在形狀邊界外保持 20-30px 的間距

### 規則 5：使用自然的連接點
- 避免使用角落連接（如 entryX=1,entryY=1）
- 上到下流程：從底部出發（exitY=1），從頂部進入（entryY=0）
- 左到右流程：從右側出發（exitX=1），從左側進入（entryX=0）

## 樣式參考

### 常用顏色
| 用途 | 填充色 | 邊框色 |
|------|--------|--------|
| 淺藍色 | #dae8fc | #6c8ebf |
| 淺綠色 | #d5e8d4 | #82b366 |
| 淺黃色 | #fff2cc | #d6b656 |
| 淺紅色 | #f8cecc | #b85450 |
| 淺紫色 | #e1d5e7 | #9673a6 |
| 淺灰色 | #f5f5f5 | #666666 |

### 字型設定
- 建議 `fontSize=18` 提升可讀性
- 中文每字約需 30-40px 寬度

## 版面約束

- 所有元素的 x 座標保持在 0-800 之間
- 所有元素的 y 座標保持在 0-600 之間
- 容器最大寬度：700px
- 容器最大高度：550px
- 元素間距建議：150-200px（為邊緣路由留出空間）

## 完整輸出模板

雖然核心原則是「只生成 mxCell」，但寫入 .drawio 檔案時需要完整結構。

**工作流程：**
1. 先構思 mxCell 元素（遵循上述規則）
2. 將 mxCell 放入以下模板
3. 寫入 .drawio 檔案

```xml
<mxfile host="app.diagrams.net" agent="Agent" version="21.0.0">
  <diagram name="Page-1" id="page-1">
    <mxGraphModel dx="1000" dy="600" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0" defaultFontFamily="Helvetica">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        <!-- 在此放入你生成的 mxCell 元素 -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## 輔助工具（可選）

`helpers/` 目錄包含 TypeScript 工具，可用於驗證和除錯：

```bash
# 驗證 .drawio 檔案（需要 Bun）
bun helpers/validate-xml.ts diagram.drawio

# 將純 mxCell XML 包裝成 .drawio（需要 Bun）
bun helpers/wrap-mxfile.ts cells.xml output.drawio
```

這些工具是**可選的**參考實作，Agent 不需要呼叫它們，只需遵循上述規則即可

## 產生 .drawio.png（可編輯的 PNG）

`.drawio.png` 是一種特殊格式：既是 PNG 圖片，又嵌入了 draw.io XML 資料，可以在 draw.io 中重新編輯。

**需求：** Docker + [rlespinasse/drawio-export](https://github.com/rlespinasse/drawio-export) 映像

**工作流程：**

```
1. Agent 寫入 .drawio 檔案
         ↓
2. 執行 Docker 匯出（使用 -e 嵌入選項）
         ↓
3. 產生 .drawio.png（可編輯的 PNG）
```

**匯出指令：**

```bash
# 使用 helper 腳本
./helpers/export-drawio-png.sh diagram.drawio output.drawio.png

# 或直接使用 Docker
docker run --rm -v $(pwd):/data rlespinasse/drawio-export \
    -f png -e --remove-page-suffix -o /data /data/diagram.drawio
```

**重要選項：**
- `-f png`: 輸出 PNG 格式
- `-e, --embed-diagram`: 嵌入 diagram XML（關鍵！）
- `-t, --transparent`: 透明背景
- `-s, --scale <n>`: 縮放比例
- `--remove-page-suffix`: 移除頁面後綴

**產生的檔案特性：**
- 可以作為普通 PNG 圖片使用
- 可以在 draw.io 或 VS Code 中開啟並編輯
- 編輯後可另存為任何格式

## VS Code 整合

如果使用者安裝了 [Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio) 擴充套件：

**支援的檔案格式：**

| 格式 | Agent 可產生 | VS Code 可編輯 | 說明 |
|------|---------------|----------------|------|
| `.drawio` | ✅ 直接 | ✅ | 純 XML |
| `.dio` | ✅ 直接 | ✅ | 同 .drawio |
| `.drawio.png` | ✅ via Docker | ✅ | PNG + 嵌入 XML |
| `.drawio.svg` | ❌ | ✅ | 需要 SVG 渲染 |

**建議做法：**
1. Agent 產生 `.drawio` 檔案
2. 如需 `.drawio.png`，使用 Docker 匯出
3. 使用者在 VS Code 中開啟即可視覺化編輯

## CLI 匯出（可選）

如果環境有 draw.io CLI：

```bash
# 使用 drawio-export（Docker 環境）
drawio-export -x -f png -s 2 -t -o output.png input.drawio

# 使用 drawio CLI（有顯示環境）
drawio -x -f png -s 2 -t -o output.png input.drawio
```

選項說明：
- `-x`: 匯出模式
- `-f png`: 輸出格式（也可用 svg、pdf）
- `-s 2`: 2 倍縮放（高解析度）
- `-t`: 透明背景

## 驗證檢查清單

生成後確認：
- [ ] 只有 mxCell 元素（沒有 wrapper 標籤）
- [ ] 沒有 id="0" 或 id="1" 的根節點
- [ ] 所有 mxCell 是同層級（沒有嵌套）
- [ ] 所有 ID 唯一
- [ ] 特殊字符已轉義
- [ ] 邊緣沒有穿過其他形狀
- [ ] 元素位置在可視範圍內（x: 0-800, y: 0-600）
