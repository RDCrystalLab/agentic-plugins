---
allowed-tools: Bash(date:*), Bash(ls:*), Bash(git:*), Bash(cat:*), Read, Write, Edit
description: 從當前工作萃取 generalizable pattern 成 wiki article（繞過 raw/ ingest 流程）
---

## Context

- Today's date: !`date "+%Y-%m-%d"`
- Arguments: $ARGUMENTS
- Existing wiki topics: !`ls Resources/llm-wiki/wiki/ 2>/dev/null | grep -vE '(\.md|\.gitkeep)$'`
- Wiki index: !`cat Resources/llm-wiki/wiki/index.md 2>/dev/null`
- Wiki log (last 20 lines): !`tail -20 Resources/llm-wiki/wiki/log.md 2>/dev/null`
- Today's daily note exists: !`f="0-inbox/daily/$(date +%Y-%m-%d).md"; [ -f "$f" ] && echo "yes" || echo "no"`

## Your task

Create a new wiki article that distills a generalizable pattern from recent work. Unlike `/obsidian-para-wiki` ingest, this command **does not touch `raw/`** — there is no external source, the article is authored directly from reflective distillation.

**Argument shape**: `$ARGUMENTS` is `<topic> <slug> [optional "Title With Spaces"]`.

- `<topic>` must be an existing directory under `Resources/llm-wiki/wiki/` (e.g. `clickhouse`, `ai-security`, `physics`). If the user wants a new topic, tell them to create the directory first with a `.gitkeep`, and add a topic description to `wiki/index.md`.
- `<slug>` is kebab-case, no `.md` suffix. This becomes the article filename.
- `Title` is optional; derive from slug if omitted.

### Step 1: Validate
1. Verify `Resources/llm-wiki/wiki/<topic>/` exists.
2. Verify `Resources/llm-wiki/wiki/<topic>/<slug>.md` does NOT already exist. If it does, stop and ask whether to merge into the existing article instead.

### Step 2: Draft the article

The user's prompt body supplies the substance of the pattern. Your job is to make it generalizable, not to invent it. Use the Write tool to create `Resources/llm-wiki/wiki/<topic>/<slug>.md` with this frame:

```markdown
# <Title>

> Sources: internal work, <today's date>
> Plan: [[<project-specific plan wikilink if applicable, else omit this line>]]
> Updated: <today's date>

## The question this article answers

<one-paragraph framing: what recurring problem does this pattern address, and who would benefit from knowing it>

## <Main substance — multiple sections as appropriate>

...

## See Also

- [[<related existing articles, wikilink shortest form>]]
- [[<source plan if applicable>]]
```

Key rules for the body:

- **Generalize**: project-specific names (AML, bitcoin, PowerFlex, etc.) become *worked examples*, not the frame. The pattern should be extractable by a reader working on a different system.
- **Worked example is fine** but should be introduced as "for example, in the Bitcoin case..." not as the primary subject.
- **No code blocks from the source plan verbatim** — rewrite them as generic pseudo-code or drop them.
- **No internal credentials, IP addresses, server names, or org-specific acronyms** unless the acronym is explained.

### Step 3: Update wiki index
Edit `Resources/llm-wiki/wiki/index.md`. Under the `## <topic>` section, add a row to the article table:

```
| [[<slug>\|<Title>]] | <one-line summary under 150 chars> | <today's date> |
```

If the topic section has no description paragraph, leave it alone. If the topic section has no table header, create one.

### Step 4: Append wiki log
Edit `Resources/llm-wiki/wiki/log.md`. Prepend a new entry just below `# Wiki Log`:

```
## [<today's date>] extract | <Title>
- Source: internal work (not an external ingest; no raw/ file)
```

### Step 5: Update daily note (if exists)
If `0-inbox/daily/<today>.md` exists, append to its `# Logs` section:

```
- Extracted [[<slug>|<Title>]] into llm-wiki (pattern from <brief context>)
```

If the Logs section only has a `-` placeholder, replace it.

If today's daily note does not exist, skip — do not auto-create it.

### Step 6: Commit
- `git add Resources/llm-wiki/wiki/<topic>/<slug>.md Resources/llm-wiki/wiki/index.md Resources/llm-wiki/wiki/log.md 0-inbox/daily/<today>.md`
- `git commit -m "docs(wiki): extract <slug> pattern"` with Co-Authored-By trailer
- `git push origin main`

### Step 7: Report
Tell the user: article path, the index row added, commit SHA. One or two sentences.

## Distinction from /obsidian-para-wiki ingest

| | `/obsidian-para-wiki` | `/extract-pattern` |
|--|--|--|
| Touches `raw/` | Yes, raw archival copy | No |
| Source | External (URL, paste, inbox) | Internal reflection on current work |
| Primary artifact | Wiki article compiled from raw | Wiki article born directly |
| When to use | Read an article, want to remember | Finished a task, noticed a pattern |

If the user is describing external material, **stop and redirect them to `/obsidian-para-wiki`**.
