---
allowed-tools: Bash(git:*), Read, Write, Edit, Glob, Grep
description: 依 specs/patches.md 在目前 baseline 上重建功能，並產生 specs/patched.md
---

# Reapply Patch Spec

依 forward spec 重建功能，而不是盲目重套舊 diff。

## Inputs

- Arguments: `$ARGUMENTS`
- Default spec path: `specs/patches.md`
- Default ledger path: `specs/patched.md`

## Preconditions

1. `specs/patches.md` 必須存在。
2. 若 spec 不夠清楚到無法開始，先停下來指出缺口，不要亂補整份實作。

## Instructions

### 1. Read the spec first

1. 以 `specs/patches.md` 當 source of truth。
2. 若 `$ARGUMENTS` 指定單一 `feature-xx`，只重建該 feature。
3. 可把原 patch / commit range 當參考資料，但 **不得凌駕於 spec**。

### 2. Rebuild on the current baseline

1. 根據 `Required Behavior`、`Implementation Anchors`、`Compatibility Rules` 決定合理修改面。
2. 避免無限制探索；把修改收斂在 spec 指出的責任邊界附近。
3. 若 spec 與目前 upstream reality 衝突，保留工程判斷，但在 ledger 中寫明。

### 3. Validate the implementation

1. 優先執行專案既有的建置 / 測試 / smoke checks。
2. 若沒有明確測試，也要至少記錄你做了哪些驗證。
3. 驗證結果必須進 `specs/patched.md`，不能只留在對話裡。

### 4. Write `specs/patched.md`

在功能落地後建立或更新這份 ledger：

```md
# patched - <feature name>

## Goal

## Inputs
- source patch / commit / issue
- specs/patches.md

## Changed Files
- ...

## What Was Restored
- ...

## Validation
- baseline checks
- post-change checks
- manual scenarios

## Gaps / Ambiguities
- ...

## Verdict
- feature-level restore status
```

## Hard rules

1. `specs/patched.md` 要寫 **事實**，不是期待。
2. 不要把 spec 內容複製成 ledger。
3. 若靠工程判斷補了 spec 沒寫死的細節，要記在 `Gaps / Ambiguities`。

## Output

完成後回報：

- 這次改了哪些檔案
- 哪些行為被恢復
- `specs/patched.md` 路徑
- 是否建議接著跑 `validate-patch-spec`
