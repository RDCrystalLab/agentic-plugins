---
allowed-tools: Bash(git:*), Bash(ls:*), Read, Write, Edit, Glob, Grep
description: 從 patch file、commit range 或 custom branch 抽出 feature intent，寫成 specs/patches.md
---

# Extract Patch Spec

將 raw patch 轉成未來可重建的 forward spec。

## Inputs

- Arguments: `$ARGUMENTS`
- Supported forms:
  - patch file path，例如 `changes.patch`
  - commit range，例如 `upstream/main..custom-branch`
  - custom branch name

## Goal

分析 patch 背後的 feature intent，將 scattered edits 收斂成 1..N 個 `feature-xx`，並把結果寫入 `specs/patches.md`。

## Instructions

### 1. Resolve the source

1. 判斷 `$ARGUMENTS` 是 patch file、commit range，還是 branch。
2. 若輸入無法唯一判定，先詢問使用者，不要猜。
3. 建立或重用 `specs/` 目錄。

### 2. Analyze the change set

1. 列出受影響檔案。
2. 區分：
   - 核心行為變更
   - formatting / rename / incidental churn
3. 把跨檔案修改收斂成 feature-level intent，而不是逐檔摘要。

### 3. Produce a concise breakdown

先整理出：

- feature list
- 每個 feature 的 intent
- 每個 feature 的責任切分
- 需要被寫死的 ambiguity（wire shape、payload、fallback、path policy 等）

### 4. Write `specs/patches.md`

如果檔案已存在，更新它而不是盲目覆蓋；保留已經更清楚的 spec 內容。

使用這個結構：

```md
# Custom Patch Spec

## feature-01 - <feature name>

### Scope

### <sub-spec A>
#### Intent
#### Required Behavior
#### Implementation Anchors
#### Compatibility Rules

### <sub-spec B>

### feature-01 Reapply Checklist

- behavior-oriented checklist item

### feature-01 Test Plan

- automated expectations
- manual verification scenarios
- acceptance rule

### feature-01 Current Non-Goals

- ...
```

## Hard rules

1. 用 **behavior language**，不是 diff walkthrough。
2. Checklist 必須是 **行為導向**，不是檔名導向。
3. `Implementation Anchors` 可以提合理修改面，但不可把檔名當 source of truth。
4. 明確保留 non-goals，避免未來重建時 scope 膨脹。

## Output

完成後回報：

- 新增或更新的 `feature-xx`
- `specs/patches.md` 路徑
- 仍待釐清的 ambiguity
