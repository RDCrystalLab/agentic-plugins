---
name: new-project
description: 在 Obsidian vault 新增一個專案並更新 Projects/index.md。當用戶想建立新專案、開始追蹤一個新項目、或說「新增專案」、「建立專案」、「create project」、「add project」時使用。會引導用戶填入基本資訊後自動建立目錄結構與更新 index。
metadata:
  version: 1.0.0
---

# New Project

Guide the user through creating a new project in the Obsidian vault (PARA structure) and keeping the project index up to date.

## Vault paths

- Projects root: `Projects/`
- Project index: `Projects/index.md`

## Step 1: Gather project information

Ask the user for the following. You can ask all at once in a single message:

1. **Project name** (English, used as directory name — e.g. `agents`, `billing-service`)
2. **Description** (one sentence summarizing the project's purpose)
3. **Category** — choose one:
   - 主要工作（main work item, goes under "🔥 主要工作項目"）
   - Side Project（AI/infra experiments, goes under "🧪 Side Projects"）
   - 其他（everything else, goes under "📋 其他專案"）
4. **Status** — choose one: `active` 🟢 / `planning` 🟡 / `pending` ⏸️
5. **Related repos** (optional, e.g. `ricky1698/ca-expl`, `RDCrystalLab/agentic-plugins`)
6. **Core themes or focus areas** (optional, a few bullet points for the README)

If the user has already provided some of this in their message, extract it directly — don't ask again.

## Step 2: Create project files

### README.md

Create `Projects/<name>/README.md`:

```markdown
---
tags:
  - project/<name>
  - status/<status>
created: <YYYY-MM-DD>
---

# <Name>

<description>

## 目標

(user to fill in)

## 核心主題

| 主題 | 說明 | 狀態 |
|------|------|------|
| **<theme>** | <desc> | 🔍 探索中 |

## 相關 Repos

- `<repo>` — <purpose>

## 資源

→ [[Projects/<name>/Resources|Resources]]
```

Omit sections that have no content (e.g. skip "相關 Repos" if none provided, skip "核心主題" if no themes given). Keep it lean — the user will flesh it out.

### Resources.md (optional)

Only create `Projects/<name>/Resources.md` if the user mentioned specific tools, links, or references. Don't create an empty file just to have one.

## Step 3: Update Projects/index.md

Read the current `Projects/index.md` and make the following changes:

1. **Add project entry** under the correct category section. Use this format:

```markdown
### <Display Name>
- **狀態**: <status emoji> <status label>
- **描述**: <description>
- **Repo**: `<repo>` (omit if none)
- **重要檔案**:
  - [[Projects/<name>/README|專案概述]]
```

2. **Update the tags section** — add `- \`#project/<name>\` - <display name>` to the tag index list.

3. **Update the stats** — increment the count for the appropriate status bucket (進行中 / 規劃中 / 暫停).

4. **Update "最近更新"** — prepend a new line:
   `- **<YYYY-MM-DD>**: 新增 <name> 專案 — <one-line description>`

5. **Update "最後更新" date** at the top.

## Step 4: Confirm and report

Tell the user what was created:
- Files created (README.md, Resources.md if applicable)
- What changed in Projects/index.md

Keep it brief.
