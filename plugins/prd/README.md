# prd

PRD（產品需求文件）全流程工具 — 從用戶訪談建立 PRD，再拆成實作計畫或 GitHub issues。

原作者：[Matt Pocock](https://github.com/mattpocock/skills)

## 包含技能

| 技能 | 指令 | 用途 |
|------|------|------|
| **write-a-prd** | `/prd:write-a-prd` | 從零開始，深度訪談 → 產出 PRD（GitHub issue） |
| **prd-to-plan** | `/prd:prd-to-plan` | 將 PRD 拆成分階段實作計畫（本地 `./plans/*.md`） |
| **prd-to-issues** | `/prd:prd-to-issues` | 將 PRD 拆成多個獨立 GitHub issues（tracer bullet 垂直切片） |

## 工作流

### 流程 A：PRD → GitHub issues（團隊協作）

```
/prd:write-a-prd          ← 產出 PRD issue #42
/prd:prd-to-issues        ← 讀 #42 → 建立子 issues，各自可分派
```

### 流程 B：PRD → 本地計畫（個人開發）

```
/prd:write-a-prd          ← 產出 PRD issue #42
/prd:prd-to-plan          ← 讀 #42 → 產出 ./plans/feature-name.md
```

### 流程 C：已有 PRD，直接拆

```
/prd:prd-to-issues        ← 給 issue 編號就開始拆
```

## 核心概念

### Deep Modules（write-a-prd）

PRD 過程中主動尋找可獨立測試的深層模組 — 封裝大量功能在簡單、穩定的介面背後。

### Tracer Bullet / Vertical Slices（prd-to-plan、prd-to-issues）

每個切片是穿透所有整合層（schema → API → UI → tests）的薄垂直切片，而非單一層的水平切片。每個完成的切片都可獨立 demo 或驗證。

### HITL vs AFK（prd-to-issues）

- **HITL**（Human In The Loop）— 需要人工決策（架構決定、設計 review）
- **AFK**（Away From Keyboard）— 可自動完成並合併，無需人工介入
