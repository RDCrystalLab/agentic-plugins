---
allowed-tools: Bash(git:*), Bash(mktemp:*), Bash(rm:*), Read, Write, Edit, Glob, Grep
description: 在 clean baseline 上做 spec-only reapply，驗證 specs/patches.md 是否足以重建功能
---

# Validate Patch Spec

驗證的對象是 `specs/patches.md`，不是原始 patch 是否還能套上。

## Inputs

- Arguments: `$ARGUMENTS`
- Expected form: `<baseline-ref> [feature-xx]`
- Default spec path: `specs/patches.md`

若 baseline ref 不明確，先詢問使用者，不要自己猜測 upstream 基準。

## Goal

在 **乾淨 baseline** 上做一次 **spec-only reapply**，確認沒有原客製化實作可偷看的情況下，這份 spec 是否仍足以引導 feature restore。

## Instructions

### 1. Create an isolated baseline

1. 用 `$ARGUMENTS` 提供的 baseline ref 建立 disposable worktree 或等價隔離工作目錄。
2. baseline 必須沒有本地客製化實作。
3. 把 `specs/patches.md` 帶進驗證環境，但不要把既有的 customized implementation 帶進去。

### 2. Enforce isolation

在驗證 pass 中強制以下限制：

1. source of truth 只有 `specs/patches.md`
2. 不可讀取主工作樹內已完成的 custom implementation
3. 優先根據 `feature-xx`、`Required Behavior`、`Implementation Anchors` 做 directed reapply
4. 避免 open-ended exploration

如果有 subagent 可用，優先用 fresh subagent 執行這個隔離 pass；若沒有，就在 disposable worktree 中手動遵守同樣限制。

### 3. Review the reconstruction result

檢查：

- 是否真的恢復核心行為
- 是否只改了合理範圍
- 是否產生大量 unrelated churn
- 是否因 spec 模糊而自行發明行為

### 4. Update the validation record

將結果追加到 `specs/patched.md` 或獨立加上一節，至少包含：

- validation baseline
- spec-only reconstruction summary
- files changed during validation pass
- passed / failed behaviors
- ambiguity notes
- next spec fixes

## Success criteria

只有當以下條件成立，才算 spec 達到可重建等級：

1. 核心 feature 行為能在 clean baseline 上被補回
2. 不需要偷看原客製化實作
3. 修改面大致收斂
4. 只剩少量、可描述的 ambiguity

## Failure handling

若驗證失敗，不要放寬標準。回頭補強 `specs/patches.md`，特別檢查：

- wire shape
- payload details
- fallback semantics
- path / naming policy
- scope boundaries

## Output

完成後回報：

- baseline ref
- 驗證是通過還是失敗
- spec 還缺哪些資訊
- 是否建議回到 `extract-patch-spec` 更新 spec
