# Label schema

Hub issue workflow 用到的固定 label。新增 project 時會同時多一個 `project:<slug>`。

## Project — `project:<slug>`

每個 active `Projects/<slug>/` 對應一個同名 label。顏色統一綠色 `#0E8A16`。

```bash
gh label create "project:<slug>" --color "0E8A16" --description "Work belonging to Projects/<slug>"
```

## Type — 工作性質 / 粒度

| Label | Color | When to use |
|---|---|---|
| `type:epic`     | `#3E1F92` | 跨多週、會拆成多個 story 的大工程 |
| `type:story`    | `#006B75` | 單一功能或可交付成果，通常一週內完成、會再拆成 tasks |
| `type:task`     | `#1D76DB` | 具體可執行任務，半天到幾天 |
| `type:bug`      | `#D93F0B` | 壞掉的東西要修 |
| `type:research` | `#5319E7` | 要查資料、比較、產出結論 |
| `type:decision` | `#FBCA04` | 需要拍板、有兩個以上選項 |
| `type:idea`     | `#C5DEF5` | 還沒成形的想法，未來可能升級 |

**粒度階層**：`epic` ⊃ `story` ⊃ `task` — 用 GitHub 的 sub-issue 功能把階層串起來（parent issue 標 `type:epic`，子 issue 標 `type:story` 並設為 sub-issue；以此類推）。`bug` / `research` / `decision` / `idea` 不屬於粒度軸，跟 task 同級。

```bash
gh label create "type:epic"     --color "3E1F92"
gh label create "type:story"    --color "006B75"
gh label create "type:task"     --color "1D76DB"
gh label create "type:bug"      --color "D93F0B"
gh label create "type:research" --color "5319E7"
gh label create "type:decision" --color "FBCA04"
gh label create "type:idea"     --color "C5DEF5"
```

## Horizon — 排程視窗

| Label | Color | Meaning |
|---|---|---|
| `now`   | `#B60205` | 這週要做 |
| `next`  | `#FBCA04` | 下週待排 |
| `later` | `#BFD4F2` | 想做但沒排期 |

```bash
gh label create "now"   --color "B60205"
gh label create "next"  --color "FBCA04"
gh label create "later" --color "BFD4F2"
```

## 使用原則

1. **每個 issue 至少一個 `project:*` + 一個 `type:*`**（缺一個就像沒歸類的 inbox）
2. **Horizon label 三選一，不要都不加**——否則 `gh issue list --label now` 看不到
3. **跨 repo 使用相同 schema**：code repo 與 hub(`sb`)repo 都要有這套 label，跨 repo filter 才一致
4. **不要為細分子功能建 label**——想要更細，改用 milestone 或 sub-issues
