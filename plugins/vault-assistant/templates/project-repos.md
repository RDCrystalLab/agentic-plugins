# Project repo routing

`/vault-assistant:capture-issue` 會優先讀這張表來決定 issue 要開在哪個 repo。

## Rules

1. 每列代表一個 project slug（對應 `project:<slug>` label）
2. `default_repo` 是預設落點；只有這裡沒列到時，`/capture-issue` 才會退回 heuristic / hub repo
3. `aliases` 用逗號分隔，填常見別名、repo 名稱、歷史名稱
4. `override_keywords` 可選；若 issue title / body 命中這些關鍵字，就改開到 `override_repo`
5. 這份表是 **vault-local config**，由使用者維護；plugin 不內建固定 mapping

## Mapping table

| project_slug | default_repo | aliases | override_keywords | override_repo | notes |
|---|---|---|---|---|---|
| <project-slug> | <owner>/<repo> | <alias-1>, <alias-2> | <keyword-1>, <keyword-2> | <owner>/<override-repo> | optional notes |
| example-project | your-org/example-repo | example-repo | migration, backend-v2 | your-org/example-migration-repo | Optional example row; replace or delete it |

Keep this file up to date when you add a new project or move ownership to another repo.
