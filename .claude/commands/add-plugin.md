Integrate a new plugin into this agentic-plugins repository.

## Input

The user provides: $ARGUMENTS

This can be either:
- **A local path** to a directory containing skill files
- **A GitHub URL** (e.g. `https://github.com/user/repo` or `https://github.com/user/repo/tree/branch/subdir`)

## Steps

Follow these steps precisely:

### 1. Resolve the source

#### If the input is a GitHub URL:

1. Parse the URL to extract owner, repo, and optional subdirectory/branch.
2. Clone the repo to `/tmp/agentic-plugins-import/<repo-name>` using `git clone --depth 1`. If the directory already exists, remove it first with `rm -rf` before cloning.
3. If the URL contains a subdirectory path (e.g. `/tree/main/some/path`), note that subdirectory as the effective source root.
4. Set the resolved local path to the cloned location (or its subdirectory).

#### If the input is a local path:

Use it directly as the resolved source path.

### 2. Discover available skills

- Search the resolved source path recursively for all `SKILL.md` files.
- For each `SKILL.md` found, read its YAML frontmatter to extract `name` and `description`.
- Present the discovered skills to the user as a list and ask which one(s) they want to import.
- If only one skill is found, confirm with the user before proceeding.
- Wait for the user's selection before continuing.

### 3. For each selected skill, perform the integration

For each skill the user selected, execute steps 3a through 3e:

#### 3a. Copy content to plugins directory

- Determine the plugin name from the skill's `name` field in SKILL.md frontmatter, or fall back to the parent directory name.
- Copy the skill directory (the folder containing `SKILL.md` and its siblings like `references/`) into `plugins/<plugin-name>/skills/<skill-name>/`.
- If the source contains other plugin-level files (hooks/, commands/, README.md, etc.), copy those to `plugins/<plugin-name>/` as well.
- If the source is already under this repo's `plugins/` directory, skip copying.

#### 3b. Create `.claude-plugin/plugin.json` (if missing)

Create `plugins/<plugin-name>/.claude-plugin/plugin.json` following this template:

```json
{
  "name": "<plugin-name>",
  "version": "1.0.0",
  "description": "<extracted from SKILL.md description field>",
  "author": {
    "name": "Ricky",
    "email": "moiamond@gmail.com"
  },
  "repository": "https://github.com/ricky1698/agentic-plugins",
  "license": "MIT",
  "keywords": ["<relevant>", "<keywords>"]
}
```

#### 3c. Create `README.md` (if missing)

Create `plugins/<plugin-name>/README.md` with:

- Plugin name as title
- Brief description of what the plugin does
- Prerequisites (if any tools need to be installed)
- Usage overview
- Link to the SKILL.md for full reference

#### 3d. Register in marketplace.json

Add the plugin entry to `.claude-plugin/marketplace.json` in the `plugins` array:

```json
{
  "name": "<plugin-name>",
  "description": "<short description>",
  "version": "1.0.0",
  "author": {
    "name": "Ricky",
    "email": "moiamond@gmail.com"
  },
  "source": "./plugins/<plugin-name>",
  "category": "<appropriate category>"
}
```

Choose category from: `example`, `security`, `visualization`, `automation`, `testing`, `development`, or propose a new one if none fits.

#### 3e. Verify

- List the final directory structure of the new plugin.
- Confirm all required files exist: `plugin.json`, `SKILL.md`, `README.md`.
- Confirm the marketplace.json is valid JSON.

### 4. Cleanup

- If a GitHub repo was cloned to `/tmp`, inform the user that the temp clone is at `/tmp/agentic-plugins-import/<repo-name>` and can be removed.

### 5. Summary

Report what was done:
- Plugin(s) imported
- Source (local path or GitHub URL)
- Files created/modified
- Category assigned per plugin
- Any issues or manual steps needed
