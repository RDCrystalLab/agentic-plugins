---
allowed-tools: Bash(gh:*), Bash(git:*), Bash(ls:*), Bash(cat:*), Bash(date:*), Read, Write, Edit, Glob, Grep
description: 把一個 GitHub repo 加進 research-repos monitoring list（含 clone、產生 note、更新 index、commit+push）
---

## Context

- Today's date: !`date "+%Y-%m-%d"`
- Current Monitoring List: !`cat Areas/development/research-repos/index.md 2>/dev/null || echo "(index not found)"`
- Local github kb root: !`ls ~/workspaces/github/ 2>/dev/null | head -30`

## Your task

Add a GitHub repo to the research-repos monitoring list. Input is `$ARGUMENTS` — accepts:
- Full URL: `https://github.com/<owner>/<repo>`
- owner/repo: `owner/repo`
- Bare name: `<repo>` (must match a folder under `~/workspaces/github/`)

By default produce a **fast skeleton note** (README + subdirs peek). If `$ARGUMENTS` contains `--deep`, do a deeper exploration (read more files, summarize architecture more thoroughly). Fast is the right default; deep is explicit opt-in.

### Step 1: Parse input and resolve names

Extract:
- `OWNER` — GitHub owner
- `REPO` — repo name (this becomes the note filename, wikilink, and Monitoring List label — case preserved from GitHub)
- `URL` — canonical `https://github.com/<OWNER>/<REPO>`
- `LOCAL_PATH` — `~/workspaces/github/<REPO>`

If only a bare name was given, grep `~/workspaces/github/AGENTS.md` and `Areas/development/research-repos/index.md` for existing entries to resolve owner. If still ambiguous, ask the user.

### Step 2: Dedup check

Grep `Areas/development/research-repos/index.md` for `[[<REPO>]]` (case-insensitive). If already present, **abort** and tell the user the repo is already on the list — offer to refresh / re-snapshot instead (by overwriting the note, keeping Update log history).

Also check if `Areas/development/research-repos/<REPO>.md` exists. If it does but the repo isn't in `index.md`, the note is orphaned — add to index only.

### Step 3: Ensure local clone

Check if `~/workspaces/github/<REPO>` exists.

- If missing: `git clone <URL> ~/workspaces/github/<REPO>`
- If present: verify `git -C ~/workspaces/github/<REPO> remote get-url origin` matches `<URL>`. Mismatch → ask user before proceeding.

After ensuring clone, update `~/workspaces/github/AGENTS.md` (the github-kb index) if the repo isn't already listed there:

```
- **<REPO>** (`<OWNER>/<REPO>`): <one-line summary>
```

One-line summary comes from README first paragraph, ≤ 120 chars, 繁中 or matching existing language in that file.

### Step 4: Gather snapshot material

Read in parallel:
- `~/workspaces/github/<REPO>/README.md` (first ~100 lines)
- Top-level directory listing
- Any obvious subdirs that look like sub-projects (e.g. `*/README.md` one level down)
- `package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` — extract language/stack hint
- Latest commit: `git -C ~/workspaces/github/<REPO> log -1 --format='%h %s'` (included in Update log as commit pin)

If `--deep`: additionally scan `src/` or equivalent, key source files, and produce architecture breakdown.

### Step 5: Read format exemplar

**Before writing**, read an existing note to learn the current format conventions:
```
Read Areas/development/research-repos/openab.md
```

This grounds you in the stable skeleton — don't reinvent section names or ordering.

### Step 6: Write the note

Create `Areas/development/research-repos/<REPO>.md` with this skeleton (繁中 body):

```markdown
# <REPO>

- Repo URL: `<URL>`
- Local Path: `~/workspaces/github/<REPO>`
- Status: Active monitoring
<!-- optional: - Author: ... (if notable / single-maintainer repo) -->

## 這個 repo 是什麼

<2–4 句定位：它是什麼、解決什麼問題、給誰用。從 README 首段提煉，不要照抄。>

## 整體架構 / 子專案

<若為單一產品：寫主要模組或目錄結構。
若為 multi-project repo（如教程倉、monorepo）：列出各子專案並各給一段說明。
Fast mode：從頂層目錄 + 各子 README 首段推斷即可。>

## Tech Stack

<語言、runtime、關鍵依賴，從 package.json / pyproject.toml / Cargo.toml / go.mod 讀到什麼寫什麼。簡短列點。>

## Tracking focus

<3–5 點：後續巡檢時要留意的方向。例如發行節奏、特定 feature 的演進、尚未成熟的模組。這會影響後續 daily repo 巡檢的 signal/noise 比。>

## Update log

- <today>：加入 monitoring list；初始 snapshot（`<short commit pin>`）— <這次 snapshot 的 scope，例如 "README + opc-cli + 02_fnos-init subdirs" 或 "fast skeleton only"）
```

若 `--deep`，在「整體架構 / 子專案」與「近期亮點」處加更多細節（參考 `openab.md` 的「整體架構」章節層級）。

### Step 7: Update `index.md` Monitoring List

Append to the `## Monitoring List` section (after the last existing entry, before the `---` separator):

```
- [[<REPO>]]
  - Repo URL: `<URL>`
  - Local Path: `~/workspaces/github/<REPO>`
```

`Local Path` line is optional for remote-only repos; include it whenever we just cloned to local (which is the normal case for this command).

### Step 8: Commit and push

Per vault-wide auto commit+push rule (see `AGENTS.md` → Git 工作流 section):

```
git add Areas/development/research-repos/<REPO>.md \
        Areas/development/research-repos/index.md \
        ~/workspaces/github/AGENTS.md  # only if updated
git commit -m "docs(research-repos): add <REPO> to monitoring list"
git push
```

Note: `~/workspaces/github/AGENTS.md` is **not** part of the sb repo — don't include it in the sb commit. If it was updated, leave it as-is (that directory isn't a git repo).

If push fails due to remote ahead (common when another session auto-backup commits), run `git pull --rebase && git push`.

### Step 9: Report

Tell the user in ≤ 6 lines:
- Repo added, local path
- Fast skeleton vs `--deep` mode used
- Note sections filled (list the non-empty ones)
- Commit hash pushed
- 1-line suggested next action (e.g. "下次巡檢會自動涵蓋" or "值得 `--deep` 重跑" if the fast skeleton feels thin)
