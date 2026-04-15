---
allowed-tools: Bash(gh:*), Bash(git:*), Bash(ls:*), Bash(cat:*), Bash(date:*), Read, Write, Edit, Glob, Grep
description: 巡檢 research-repos monitoring list，找出各 repo 自上次 snapshot 以來的新變化、更新 note 並產出超短版總結
---

## Context

- Today's date: !`date "+%Y-%m-%d"`
- Monitoring List: !`cat Areas/development/research-repos/index.md 2>/dev/null`
- Research-repo notes: !`ls -1 Areas/development/research-repos/*.md 2>/dev/null | grep -v index.md`

## Your task

Walk the research-repos monitoring list, fetch what's new in each repo since its last snapshot, append an `Update log` entry per repo that actually changed, and produce one short overview.

**Scope**:
- If `$ARGUMENTS` names a repo (bare name or URL), only patrol that repo.
- Otherwise patrol the entire Monitoring List.

**Defaults to fast mode**: one-line-per-repo summary, no deep analysis. If `$ARGUMENTS` contains `--deep`, do per-repo architecture re-reading where something meaningful changed.

### Step 0: Ground rules（讀給自己聽）

Per `Areas/development/research-repos/index.md` 的底部 Notes 段：

- **回報格式：超短版**
- **只講新增功能 / 值得注意的變更**
- **無更新直接回「今天無重要更新」**
- **可加 ⭐ 標記特別值得深入看的 repo**
- **主要精進的是各 repo 的個別 note，不是 `index.md`**（`index.md` 只在導覽結構改變時才動）

這些規則下面每一步都要遵守。

### Step 1: Build repo inventory

Parse `Areas/development/research-repos/index.md` `## Monitoring List` section into:

| Repo | Note path | Repo URL | Local Path |
|---|---|---|---|

Skip entries without URL. Note entries with missing `<Repo>.md` files — flag as orphaned at end.

### Step 2: Determine "since when" per repo

For each repo, open its note and look at `## Update log`. Find the **most recent entry's commit pin** — a SHA inside parentheses or backticks, e.g. `\`7197ead\`` or `(dd981ef)`.

- If a pin exists → diff from that pin (`<pin>..HEAD` after fetch).
- If no pin but the Update log has a date → use that date as the since-boundary (`--since=<date>`).
- If neither → use the repo's add-date from git history of the note file: `git log --diff-filter=A --format=%ad --date=short -- <note>` → use that.
- If `/watch-repo` created the note with the pin-in-parentheses convention, Step 2 is trivial. Falling back to date-based is the robustness path for legacy notes.

### Step 3: Fetch changes (read-only, do not pull)

For each repo with a local clone:

```bash
git -C ~/workspaces/github/<repo> fetch --quiet origin
git -C ~/workspaces/github/<repo> log <pin>..origin/HEAD --oneline --no-decorate | head -30
git -C ~/workspaces/github/<repo> log <pin>..origin/HEAD --format='%h %s%n  %b' --no-decorate | head -80   # for richer context in fast mode
```

**Do not `git pull`** — the user may have WIP in `~/workspaces/github/<repo>`. Read-only fetch is enough; we only need to see what's new upstream.

For repos without a Local Path (remote-only watch), use `gh`:

```bash
gh api "repos/<owner>/<repo>/commits?since=<ISO date>&per_page=30"
gh api "repos/<owner>/<repo>/releases?per_page=5"
gh release list --repo <owner>/<repo> --limit 5
```

Run all per-repo fetches in parallel when possible to stay under 30s on a full-list patrol.

### Step 4: Classify

For each repo, classify into one of:

- **無重要更新** — zero new commits, or only trivial commits (merge commits, chore/dep bumps, typo fixes, CI-only, README tweaks). Say so in the summary but do **not** write an Update log entry.
- **有更新** — at least one non-trivial commit. Draft a **1–2 sentence** summary of new functionality / notable changes. No narration, no commit-by-commit recap. Think: what would this repo's maintainer highlight in a changelog bullet?
- **⭐ 值得深入看** — updates suggest a new architectural direction, a brand-new subsystem, or cross-cut with the user's current work (AML / PowerFlex migration / Claude agent infra / deploy-box 工具鏈). Use sparingly — if everything is ⭐ then nothing is.

### Step 5: Append to Update log (only for "有更新" repos)

For each repo classified as "有更新" or "⭐", prepend (newest-first) a line to `## Update log` in that repo's note:

```markdown
- YYYY-MM-DD：<1–2 sentence summary>（`<new short SHA>`）
```

Requirements:
- Use a real short SHA from the fetch (`git rev-parse --short origin/HEAD` or the latest commit in the diff). This becomes the next patrol's "since" pin.
- Keep the summary terse. No bullet lists inside the entry.
- Do **not** rewrite existing note sections (`這個 repo 是什麼`, `整體架構`, `Tracking focus`). Those are snapshot-style and only change on `/watch-repo --deep` re-run.
- If `--deep` mode AND the changes are architecturally significant, you may also touch `Tracking focus` — but note what you changed in the Update log entry itself.

### Step 6: Produce short overview

Output a single report block, in the `index.md` Notes 偏好格式:

```
## 📡 Repo Patrol — YYYY-MM-DD

### 有更新
- **<repo-a>**：<1 sentence summary> ⭐?
- **<repo-b>**：<1 sentence summary>

### 無重要更新
<repo-c>, <repo-d>, <repo-e>, ...（inline，逗號分隔，不要每個一行）

### ⚠️ 異常
- <orphaned notes, missing local clones, fetch failures, etc.>
```

Skip any section that's empty. If every repo was 無更新, the whole report is literally「今天無重要更新」+ inline list.

### Step 7: Commit and push

Per vault auto commit+push rule. Group all note updates into one commit:

```bash
git add Areas/development/research-repos/*.md
git commit -m "docs(research-repos): patrol YYYY-MM-DD — <N> updates, <M> quiet"
git push
```

If nothing was written (all 無更新), **do not create an empty commit**. Just report the summary inline.

On push conflict, `git pull --rebase && git push`.

### Step 8: Return the overview to the user

Print the Step 6 report. Do not summarize again at the end, do not explain what you did — the report itself is the entire response. Keep total output ≤ 30 lines unless user passed `--deep`.
