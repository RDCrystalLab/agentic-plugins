# Obsidian PARA Wiki

A Claude Code skill for building and maintaining a personal LLM knowledge base
inside a PARA-structured Obsidian vault, with Quartz-compatible wikilinks.

Inspired by [Karpathy's LLM wiki concept](https://x.com/karpathy): the LLM
writes and maintains the wiki; the human reads and asks questions. Adapted
from the upstream [`karpathy-llm-wiki`](../karpathy-llm-wiki/) skill to fit
PARA conventions.

## What it does

Three operations on a sandboxed knowledge base under `Resources/llm-wiki/`:

- **Ingest** — Fetch a source (URL or a file in `0-inbox/`), save it as
  immutable raw material, then compile it into wiki articles. Cascade updates
  related articles, refresh the index, append to the log, and write a line
  into today's daily note Logs section.
- **Query** — Search the wiki and synthesize an answer from existing articles.
  Optionally archive the answer as a new wiki page.
- **Lint** — Auto-fix index drift, broken wikilinks, Quartz shortest-form
  violations; report orphan raw files, factual contradictions, missing
  cross-references.

## Why it's different from upstream

| Aspect | Upstream `karpathy-llm-wiki` | This skill |
|---|---|---|
| Directory layout | `raw/` and `wiki/` at project root | Nested under `Resources/llm-wiki/` (PARA Resources) |
| Link format | Standard markdown `[text](../../raw/x.md)` | Obsidian wikilinks `[[shortest-name]]` |
| Publishing compat | — | Compatible with Quartz `shortest` link resolution |
| Capture workflow | Direct URL ingest only | Also supports ingesting from `0-inbox/<file>.md` |
| File moves | Direct filesystem writes | Uses Obsidian CLI `move` to preserve wikilink integrity |
| Daily note | — | Appends a log line to today's daily note `# Logs` section |
| Orphan raw detection | — | Heuristic lint check for never-referenced raw files |

## Directory layout

```
<vault-root>/
├── 0-inbox/
│   └── daily/YYYY-MM-DD.md         # Daily note; ingest appends to # Logs
├── Resources/
│   └── llm-wiki/
│       ├── raw/                    # Immutable source material
│       │   └── <topic>/YYYY-MM-DD-slug.md
│       └── wiki/                   # Compiled articles (AI-maintained)
│           ├── index.md            # Global index
│           ├── log.md              # Operation log
│           └── <topic>/            # One level of topic subdirectories
│               └── <article>.md
```

## Requirements

- An Obsidian vault organized with PARA top-level directories
  (`0-inbox/`, `Projects/`, `Areas/`, `Resources/`, `Archives/`)
- A daily note template with a `# Logs` section (at
  `0-inbox/daily/YYYY-MM-DD.md`) — optional, skipped when absent
- Obsidian installed at `/Applications/Obsidian.app/` with
  Settings → General → Advanced → **Command line interface** enabled
- Obsidian app running in the background (so the CLI can talk to it)
- A Quartz-published vault or another consumer that respects
  `shortest` wikilink resolution (optional — the skill still works on
  non-published vaults)

## Trigger words

Chinese: 加入知識庫、匯入到 wiki、我對 X 知道什麼、查詢知識庫、檢查 wiki、整理知識庫、PARA wiki、obsidian wiki、個人知識庫

English: add to wiki, ingest to wiki, what do I know about, query my wiki, lint the wiki, check wiki quality, PARA knowledge base

## Usage examples

### Ingest from a URL

```
User: 把這篇論文加入知識庫 https://arxiv.org/abs/2310.06825
AI:   Fetches content, writes raw/llm/2026-04-12-mistral-7b.md,
      compiles wiki/llm/mistral-7b.md (or merges into existing article),
      updates index.md and log.md, appends to today's daily note.
```

### Ingest from 0-inbox

```
User: 把 0-inbox/mistral-notes.md ingest 到 llm-wiki
AI:   Reads the inbox file, writes raw/llm/mistral-notes.md,
      compiles the wiki article, then moves 0-inbox/mistral-notes.md
      to Archives/inbox-processed/mistral-notes.md via Obsidian CLI.
```

### Query

```
User: 我的 wiki 裡關於 LoRA 有什麼內容？
AI:   Reads wiki/index.md, opens relevant articles, synthesizes an
      answer with [[article|Title]] citations. Does not write files
      unless you ask for an archive.
```

### Lint

```
User: 幫我 lint 整個 wiki
AI:   Auto-fixes index drift, broken wikilinks, and path-prefixed
      wikilinks that violate Quartz shortest form. Reports orphan
      raw files, factual contradictions, and missing cross-references.
```

## Design notes

- **Sandbox via Resources/**: Keeping everything under
  `Resources/llm-wiki/` means this skill coexists with whatever else
  lives in the vault without interfering with PARA Projects/Areas flows.
- **Wikilinks over standard markdown links**: Ensures Quartz can
  publish the vault without broken links, and keeps the content
  navigable in Obsidian without round-trip rewrites.
- **Obsidian CLI for moves**: Any rename or move goes through
  `Obsidian move`, which updates every wikilink in the vault
  atomically. Direct `mv` would silently break links.
- **Daily note integration**: Writing to `# Logs` preserves your
  normal daily-note workflow (capture, review, summarize) without
  creating parallel activity streams.
