---
allowed-tools: Bash(date:*), Bash(ls:*), Bash(git:*), Bash(cat:*), Read, Write, Edit
description: 在 Projects/<project>/ 下新增一份研究筆記，更新 index.md 並 commit
---

## Context

- Today's date: !`date "+%Y-%m-%d"`
- Arguments: $ARGUMENTS
- Project directory listing: !`p=$(echo "$ARGUMENTS" | awk '{print $1}'); ls "Projects/$p/" 2>/dev/null || echo "(project not found)"`
- Project index (if exists): !`p=$(echo "$ARGUMENTS" | awk '{print $1}'); cat "Projects/$p/index.md" 2>/dev/null | head -80`

## Your task

Create a new research note inside an existing project directory and hook it into the project index.

**Argument shape**: `$ARGUMENTS` is `<project-slug> <note-slug> [optional title / description]`. If the title is omitted, derive one from the note-slug (kebab-case → Title Case).

### Step 1: Validate
1. `Projects/<project-slug>/` must exist. If not, tell the user and stop (suggest `/new-project` for a new project).
2. `Projects/<project-slug>/<note-slug>.md` must NOT already exist. If it does, stop and ask whether to open it for editing instead.
3. `<note-slug>` must be kebab-case, no `.md` suffix, no path separators.

### Step 2: Create the note
Use the Write tool to create `Projects/<project-slug>/<note-slug>.md` with this skeleton:

```markdown
# <Derived Title>

> **標籤**: #project/<project-slug> <additional tags the user mentions>
> **狀態**: #status/active
> **建立日期**: <today>
> **最後更新**: <today>
> **相關**: [[index|<project> 專案索引]]

---

## 背景

<one-line placeholder for the user to fill in>

## <First real section — TBD by user>

-
```

If the user's prompt body describes the note's intended content, seed the "背景" section with their framing instead of a placeholder.

### Step 3: Hook into project index
Read `Projects/<project-slug>/index.md`. Find the section that lists project documents (usually `## 📁 專案文件` or similar with sub-sections like "研究項目" / "支援 migration 的活躍文件" / etc.). Use Edit to add one line under the most appropriate sub-section:

```
- [[<note-slug>|<Title>]] — <one-line summary>
```

Also bump the index's "最後更新" date to today.

If the index has no appropriate section, add the wikilink at the bottom of the document list and tell the user which section you picked.

### Step 4: Commit
- `git add Projects/<project-slug>/<note-slug>.md Projects/<project-slug>/index.md`
- `git commit -m "docs(<project-slug>): add <note-slug> note"` with Co-Authored-By trailer
- `git push origin main`

### Step 5: Report
Tell the user the file path and the index section the link went into. Do not dump the whole file back.

## Rules

- Never use wikilinks with path prefixes (`[[Projects/aml/xxx]]`). Shortest form only, per AGENTS.md.
- Tags must include `#project/<slug>` and `#status/active` at minimum.
- Do not pre-fill body sections with generic content. The note is a skeleton; the user writes the substance.
