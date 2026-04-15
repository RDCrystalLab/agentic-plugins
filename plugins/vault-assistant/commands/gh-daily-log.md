---
allowed-tools: Bash(gh:*), Bash(date:*), Read, Edit
description: 查詢 GitHub 活動並更新 daily note 的 Logs 區
---

## Context

- Today's date: !`date "+%Y-%m-%d"`
- Recent daily notes (last 5 days): !`for i in 0 1 2 3 4; do d=$(date -v-${i}d "+%Y-%m-%d"); f="0-inbox/daily/$d.md"; echo "=== $d ==="; if [ -f "$f" ]; then grep -A 20 "^# Logs" "$f" | head -20; else echo "File not found"; fi; done`

## Your task

Fetch the user's GitHub activity and update daily note Logs sections — including recent days that may be missing logs.

### Step 1: Determine which days to process

Check the last 5 days of daily notes (shown in Context above). Process a day if:
- The daily note exists

**Always fetch activity regardless of whether Logs already has content** — there may be new activity since the last update (e.g. evening commits). If the user specifies a date (e.g. "yesterday", "03/11"), only process that date.

### Step 2: Fetch GitHub activity

Use **date range queries** to minimize API calls (GitHub Search API limit: 30 req/min). Determine the date range from the oldest to newest date being processed (e.g. `2026-03-08..2026-03-12`). Run all 6 queries in parallel:

**Personal repos** (one query covers all dates):
```
gh api "search/commits?q=author:ricky1698+committer-date:{start}..{end}&sort=committer-date&per_page=100"
```

**Organization repos** (one query per org, covers all dates):
```
gh api "search/commits?q=org:RDCrystalLab+author:ricky1698+committer-date:{start}..{end}&sort=committer-date&per_page=100"
gh api "search/commits?q=org:gorilla-ai+author:ricky1698+committer-date:{start}..{end}&sort=committer-date&per_page=100"
gh api "search/commits?q=org:sq-icctv+author:ricky1698+committer-date:{start}..{end}&sort=committer-date&per_page=100"
gh api "search/commits?q=org:sq-postevent+author:ricky1698+committer-date:{start}..{end}&sort=committer-date&per_page=100"
```

**Issues/PRs** (one query covers all dates):
```
gh api "search/issues?q=author:ricky1698+updated:{start}..{end}&sort=updated&per_page=100"
```

Then **filter client-side** by date when assigning activity to each day.

Exclude vault backup commits (repo: `ricky1698/sb`, message starts with "vault backup").

### Step 3: Summarize per date

For each date with activity, group by repo and summarize:
- Focus on **intent** behind commits, not raw commit messages
- Combine related commits into one bullet point
- Note issues/PRs created or updated

If a date has no activity, note it briefly.

### Step 4: Present and confirm

Show the user a summary table of what was found across all dates, then ask for confirmation before updating.

### Step 5: Update daily notes

For each confirmed date, update `0-inbox/daily/YYYY-MM-DD.md`:
- Read the existing `# Logs` content first
- **Deduplicate**: skip any repo/activity already mentioned in the existing logs
- Append only the **new entries** not yet recorded
- If logs are empty (only `-`), replace the placeholder with the new entries
- Use concise bullet points with repo name in backticks
- Group by theme/purpose, not by individual commit

If a daily note does not exist, skip it and warn the user.
