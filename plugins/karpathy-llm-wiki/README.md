# karpathy-llm-wiki

**一個 skill 打造你的 Karpathy 風格 LLM 知識庫。**

原作者：[Astro-Han](https://github.com/Astro-Han/karpathy-llm-wiki)，靈感來自 [Karpathy 的 LLM Wiki 構想](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)：

> 「LLM 負責寫和維護 wiki；人類負責閱讀和提問。」

## 核心概念

Skill 管理你專案中的兩個目錄：

```
your-project/
├── raw/            ← 不可變原始材料（你或 LLM 新增，永不修改）
│   └── topic/
│       └── 2026-04-03-source-article.md
├── wiki/           ← 編譯後的知識（LLM 維護）
│   ├── topic/
│   │   └── concept-name.md
│   ├── index.md    ← 單頁目錄
│   └── log.md      ← 追加式操作記錄
```

## 三大操作

| 操作 | 用途 |
|------|------|
| **Ingest** | 抓取來源 → 存入 `raw/` → 編譯到 `wiki/`，更新索引和交叉參考 |
| **Query** | 搜尋 wiki 並用引用回答。可選擇將答案 archive 為 wiki 頁 |
| **Lint** | 自動修復壞連結和索引漏洞。回報矛盾、孤立頁面、過期內容 |

## 使用範例

**1. 匯入第一個來源**

> 「Ingest this article: https://example.com/attention-is-all-you-need」

Skill 會把內容抓進 `raw/`，再編譯成 `wiki/` 下的文章。

**2. 向你的 wiki 提問**

> 「What do I know about attention mechanisms?」

Skill 搜尋你的 wiki，用引用連結回答。

**3. 保持品質**

> 「Lint my wiki」

Skill 檢查壞連結、缺失索引、陳舊交叉參考，並回報潛在問題。

## 特色

- **累積式** — 每個新來源都會豐富現有文章、加入交叉參考、標示衝突
- **不可變原始資料** — `raw/` 永不修改，保留來源忠實度
- **LLM 擁有 wiki** — 所有編譯、merge、cascade update 由 LLM 執行
- **衝突標註** — 來源互相矛盾時自動加註並歸因
- **自動 lint** — 偵測壞連結、孤立頁面、過期內容

## 與其他插件的差異

- **vs tutor-skills** — tutor-skills 建立 Obsidian StudyVault（含測驗），本插件建立純 markdown wiki（含 lint + 自動 cascade）
- **vs github-kb** — github-kb 索引 GitHub repos，本插件累積任意來源的知識
