# Draw.io (diagrams.net) 外掛

此外掛提供一個技能，可把簡短的文字規格轉成 draw.io (diagrams.net) 圖表，並輸出**可匯入 (importable)** 的 `.drawio` XML。

## 安裝 (Installation)

```bash
claude /plugin add /path/to/drawio
```

## 技能 (Skills)

### drawio

可產生適用於以下情境的 `.drawio` XML：
- 流程圖 (Flowchart)
- 架構／系統圖 (Architecture / System Diagram)
- 序列圖 (Sequence Diagram)（以方塊／泳道呈現）
- 實體關聯圖風格 (ERD-style)（簡化版）

**觸發語句 (Trigger phrases)：**
- "drawio", "draw.io", "diagrams.net"
- "create a diagram", "architecture diagram", "flowchart"
- "畫流程圖", "畫架構圖", "drawio 圖"

## 結構 (Structure)

```
drawio/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── drawio/
│       └── SKILL.md
└── README.md
```

## 授權 (License)

MIT
