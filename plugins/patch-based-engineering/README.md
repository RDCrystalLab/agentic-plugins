# patch-based-engineering

把一次性的 patch 提升成可重建的客製化能力。

這個 plugin 把「patch / commit range / custom branch」轉成一套可重複執行的 workflow：先抽出 feature intent，寫成 `specs/patches.md`，再依 spec 重建，最後用 clean baseline 驗證這份 spec 是否真的夠強。

## 包含元件

| 元件 | 名稱 | 用途 |
|------|------|------|
| skill | `patch-based-engineering` | 使用者入口，判斷何時該走 patch-based workflow |
| command | `/patch-based-engineering:extract-patch-spec` | 從 patch / commit range 抽出 feature intent，產生 `specs/patches.md` |
| command | `/patch-based-engineering:reapply-patch-spec` | 依 `specs/patches.md` 在目前 baseline 上重建功能，並產生 `specs/patched.md` |
| command | `/patch-based-engineering:validate-patch-spec` | 在 clean baseline 上做 spec-only reapply 驗證 |
| agent | `patch-based-engineering` | 編排整條 workflow，決定該跑哪些 command |

## 核心概念

### `specs/patches.md`

前向規格（forward spec）。這是未來重建時的 source of truth，應描述：

- feature scope
- required behavior
- non-goals
- implementation anchors
- test plan / acceptance criteria

### `specs/patched.md`

後向實作紀錄（delivery ledger）。這是本次落地的事實紀錄，應描述：

- changed files
- restored behavior
- validation results
- remaining gaps / ambiguities

## 工作流

```
patch / commit range
  -> extract intent
  -> write specs/patches.md
  -> reapply from spec
  -> write specs/patched.md
  -> validate spec-only reapply on clean baseline
```

## 什麼時候用

- 你有一份舊 patch，但 upstream 已經變動，不能直接套用
- 你想把 downstream customization 從 diff 提升成 spec
- 你想確認 `specs/patches.md` 本身是否足以讓別的 agent 重建功能
- 你要做長期 upstream tracking，而不是只保存某一次 merge 衝突後的 patch

## 使用範例

```text
/patch-based-engineering:extract-patch-spec path/to/changes.patch
/patch-based-engineering:extract-patch-spec upstream/main..custom-branch
/patch-based-engineering:reapply-patch-spec
/patch-based-engineering:validate-patch-spec v1.2.3
```

若你要跑完整 workflow，直接要求使用 `patch-based-engineering` agent 即可。

## 特色

- **feature-first**：先抽 intent，再看 diff
- **spec / ledger 分離**：避免把規格與落地紀錄混成一份文件
- **spec-only validation**：驗證的不只是 code，還有 spec 是否足以重建功能
- **雙格式支援**：同時支援 Claude plugin 與 Copilot plugin
