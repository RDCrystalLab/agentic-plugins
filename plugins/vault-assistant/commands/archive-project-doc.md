---
allowed-tools: Bash(date:*), Bash(ls:*), Bash(mv:*), Bash(mkdir:*), Bash(git:*), Bash(cat:*), Bash(python3:*), Read, Edit, Grep
description: 把 Projects/<project>/<file>.md 搬到 Archives/projects/<project>/，處理 assets 與 wikilinks，並更新 index
---

## Context

- Today's date: !`date "+%Y-%m-%d"`
- Arguments: $ARGUMENTS
- Project files: !`p=$(echo "$ARGUMENTS" | awk '{print $1}'); ls "Projects/$p/" 2>/dev/null`
- Archive dir: !`p=$(echo "$ARGUMENTS" | awk '{print $1}'); ls "Archives/projects/$p/" 2>/dev/null || echo "(will be created)"`
- Git status: !`git status --short`

## Your task

Move one or more project notes (and their orphan assets) from `Projects/<slug>/` to `Archives/projects/<slug>/`, fix all path-form wikilinks vault-wide, and remove the archived notes from the active project index.

**Argument shape**: `$ARGUMENTS` is `<project-slug> <note-slug-1> [note-slug-2 ...]`. Note slugs are bare (no `.md` extension). Pass multiple to archive several in one shot.

### Step 0: Safety gate

For each note slug:

1. Read `Projects/<project-slug>/<note-slug>.md`. Look for `#status/active` or `#status/planning` in the frontmatter.
2. If present, **do not proceed silently** — ask the user to confirm the note is really done. A note in active or planning status is usually not ready for archive.
3. If `$ARGUMENTS` contains `--force`, skip this check.
4. If `$ARGUMENTS` contains `--dry-run`, print the full move plan and stop without executing.

### Step 1: Identify orphan assets

For each note being archived:

1. Grep the note for image embeds: `!\[\[Projects/<project-slug>/assets/[^\]]+\]\]` (path-form) and `!\[\[[^\]]+\.png\]\]` (shortest form).
2. For each referenced asset filename, check whether any **kept** file in `Projects/<project-slug>/` (i.e. files NOT in this archive batch) still references it. Use Grep.
3. Assets referenced only by the archive batch are orphans and will move. Assets still referenced by kept files stay in `Projects/<project-slug>/assets/`.
4. Record the orphan asset list for the move step.

### Step 2: Execute the move

```bash
mkdir -p Archives/projects/<project-slug>/assets
mv Projects/<project-slug>/<note-slug>.md Archives/projects/<project-slug>/
for asset in <orphan-assets>; do
  mv Projects/<project-slug>/assets/$asset Archives/projects/<project-slug>/assets/
done
# If Projects/<project-slug>/assets/ is now empty, rmdir it
[ -z "$(ls -A Projects/<project-slug>/assets 2>/dev/null)" ] && rmdir Projects/<project-slug>/assets
```

### Step 3: Rewrite path-form wikilinks

Path-form wikilinks (`[[Projects/<slug>/xxx]]` and `![[Projects/<slug>/assets/yyy]]`) must become shortest form (`[[xxx]]`, `![[yyy]]`) per AGENTS.md + Quartz compatibility.

Use a Python one-shot to process the affected files in place. The set of files to process:

1. The moved file itself (now in `Archives/projects/<slug>/`)
2. All files vault-wide that contain a path-form wikilink targeting anything in `Projects/<project-slug>/`

Grep to find them first, then feed the list to a Python script using regex substitution:

```python
import re, pathlib, sys
pat_asset = re.compile(r'!\[\[Projects/[^/\]]+/assets/([^\]|]+?)\]\]')
pat_note = re.compile(r'(\!?)\[\[Projects/[^/\]]+/([^\]|/]+?)(\.md|\.canvas)?(\|[^\]]*)?\]\]')
def transform(t):
    t = pat_asset.sub(lambda m: f'![[{m.group(1)}]]', t)
    def note_sub(m):
        bang, name, ext, alias = m.group(1), m.group(2), m.group(3) or '', m.group(4) or ''
        if ext == '.md': ext = ''
        return f'{bang}[[{name}{ext}{alias}]]'
    return pat_note.sub(note_sub, t)
for f in sys.argv[1:]:
    p = pathlib.Path(f)
    new = transform(p.read_text())
    if new != p.read_text():
        p.write_text(new)
        print(f'updated: {f}')
```

### Step 4: Update project index

Edit `Projects/<project-slug>/index.md`:

1. Find the wikilink(s) to the archived note(s) in the active sections and remove them.
2. Find or create a "## 📦 已歸檔" section near the bottom of the document list. Add the archived notes there as wikilinks (shortest form still works — filename is unique).
3. Bump the index's "最後更新" date to today.

### Step 5: Verify

Run:

```bash
grep -rn '\[\[Projects/<project-slug>/' --include='*.md' . | head -20
```

Expected: no matches. If matches remain, investigate before committing — do not leave path-form wikilinks behind.

### Step 6: Commit

- `git add -A` (files are renamed, content patched, index updated — `-A` captures the lot)
- `git commit -m "refactor(<project-slug>): archive <note-slugs>"` with the Co-Authored-By trailer. Body should note asset count and wikilink-fix file count if non-trivial.
- `git push origin main`

### Step 7: Report

Tell the user: which notes were archived, which assets moved alongside, how many files got wikilink fixes, commit SHA. Under 6 lines.

## Rules

- Never delete a file — only move. Archives is git-tracked, the history survives either way.
- Never archive the project's `index.md`. If the whole project is done, the correct move is different (re-flag as completed, eventually rename the project dir under Archives/projects/).
- Never archive a file that has inbound wikilinks the user may still need live — for historical reports / monthly / weekly, the shortest-form link still works after archive since filenames stay unique, so this is safe; but heads-up the user if you see heavy cross-references.
- If multiple projects share a filename, shortest form will become ambiguous after the move — in that case, warn the user and offer path-form disambiguation `[[project-slug/file|display]]`.
