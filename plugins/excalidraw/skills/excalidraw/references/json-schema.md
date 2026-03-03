# Excalidraw JSON Schema

## 元素類型

| 類型 | 用途 |
|------|------|
| `rectangle` | 流程、動作、元件 |
| `ellipse` | 起點/終點、外部系統 |
| `diamond` | 決策、條件判斷 |
| `arrow` | 形狀之間的連線 |
| `text` | 形狀內或浮動的標籤 |
| `line` | 非箭頭連線、結構線 |
| `frame` | 群組容器 |

## 通用屬性

所有元素共用以下屬性：

| 屬性 | 型別 | 說明 |
|------|------|------|
| `id` | string | 唯一識別碼（使用描述性 ID，如 `"user-service"`） |
| `type` | string | 元素類型 |
| `x`, `y` | number | 位置（像素） |
| `width`, `height` | number | 尺寸（像素） |
| `strokeColor` | string | 邊框色（hex） |
| `backgroundColor` | string | 填充色（hex 或 `"transparent"`） |
| `fillStyle` | string | `"solid"`, `"hachure"`, `"cross-hatch"` |
| `strokeWidth` | number | 1, 2, 或 4 |
| `strokeStyle` | string | `"solid"`, `"dashed"`, `"dotted"` |
| `roughness` | number | 0（平滑）, 1（預設手繪）, 2（粗糙） |
| `opacity` | number | 0-100 |
| `seed` | number | roughness 渲染的隨機種子 |

## 文字專用屬性

| 屬性 | 說明 |
|------|------|
| `text` | 顯示文字（僅可讀字詞） |
| `originalText` | 與 text 相同 |
| `fontSize` | 字體大小（建議 16-20） |
| `fontFamily` | 3 為等寬字體（建議預設值） |
| `textAlign` | `"left"`, `"center"`, `"right"` |
| `verticalAlign` | `"top"`, `"middle"`, `"bottom"` |
| `containerId` | 父容器形狀的 ID（`null` 為浮動文字） |
| `lineHeight` | 行高倍數（預設：1.25） |

## 箭頭專用屬性

| 屬性 | 說明 |
|------|------|
| `points` | `[x, y]` 座標陣列，相對於箭頭的 `x`, `y` |
| `startBinding` | 連接到起始形狀 |
| `endBinding` | 連接到目標形狀 |
| `startArrowhead` | `null`, `"arrow"`, `"bar"`, `"dot"`, `"triangle"` |
| `endArrowhead` | `null`, `"arrow"`, `"bar"`, `"dot"`, `"triangle"` |

## Binding 格式

```json
{
  "elementId": "shapeId",
  "focus": 0,
  "gap": 2
}
```

## 矩形圓角

加入以下屬性以啟用圓角：
```json
"roundness": { "type": 3 }
```

## boundElements

容器必須宣告其綁定的子元素：
```json
"boundElements": [
  {"id": "text1", "type": "text"},
  {"id": "arrow1", "type": "arrow"}
]
```
