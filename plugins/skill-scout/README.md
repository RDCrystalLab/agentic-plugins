# skill-scout

從外部 repo 發現、評估、移植 skills 到你的插件市集。

## 為什麼需要這個

找到好的 skills 散落在各處（GitHub、npm、個人 repo），但直接搬進來往往不合用 — 需要評估品質、泛化個人化設定、合併相關 skills、產出符合市集規範的結構。這個 skill 把整個流程標準化。

## 工作流

```
瀏覽外部 repo → 評估 + 討論 → 決定結構 → 移植 + 改造 → 註冊到市集
```

### Phase 1: Discover（發現）
```
/skill-scout ~/workspaces/some-skills-repo
```
掃描 repo，列出所有 skills 的概覽表。

### Phase 2: Evaluate（評估）
選擇感興趣的 skills，深入閱讀並討論：
- 功能是否實用
- 是否與現有插件重疊
- 是否需要合併多個 skills
- 是否有需要泛化的個人化設定

### Phase 3: Port（移植）
根據討論結果執行：
- 產出雙格式 plugin.json（Claude Code + VS Code Copilot）
- README 用繁體中文撰寫
- 泛化個人化引用
- Python 偏好 uv 模式
- 註冊到 marketplace.json、AGENTS.md、README.md

### Phase 4: Report（報告）
總結移植結果和使用方式。

## 特色

- **討論優先** — 不是機械式複製，而是互動評估後再行動
- **智慧合併** — 相關 skills 建議合為一個插件
- **品質把關** — 主動標示需要修改的地方（硬編碼路徑、平台限定用語等）
- **跨平台** — 產出同時相容 Claude Code、VS Code Copilot、npx skills
