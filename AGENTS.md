# AGENTS.md

This file provides guidance for agentic coding agents working in this repository.

## Repository Overview

This is a Claude Code plugins marketplace containing multiple plugins, each in its own directory under `plugins/`. The repository uses a marketplace structure where plugins can be installed individually or as a collection.

## Plugins

| Name | Category | Components |
|------|----------|------------|
| damage-control | security | skills, hooks |
| drawio | visualization | skills |
| excalidraw | visualization | skills |
| github-kb | productivity | skills |
| playwright-cli | automation | skills |
| tmux-fork | automation | skills, commands |
| gh-tools | development | commands, skills |
| anvil | development | agents |
| autoresearch | productivity | skills, commands |
| tutor-skills | productivity | skills |
| openrouter-image-gen | visualization | skills |
| caveman | productivity | skills, hooks |
| cli-creator | development | skills |
| marimo | development | skills |
| prd | productivity | skills |

## Build/Lint/Test Commands

### Python/UV Environment (Damage Control Plugin)
```bash
# Install UV (Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Test damage control hooks (Python implementation)
uv run test-damage-control.py -i                    # Interactive mode
uv run test-damage-control.py bash Bash "rm -rf /tmp" --expect-blocked  # Test specific command
uv run test-damage-control.py edit Edit "~/.ssh/id_rsa" --expect-blocked  # Test edit hook
```

### TypeScript/Bun Environment (Damage Control Plugin)
```bash
# Install Bun (JavaScript runtime)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun add yaml

# Test damage control hooks (TypeScript implementation)
bun run test-damage-control.ts -i                   # Interactive mode
bun run test-damage-control.ts bash Bash "rm -rf /tmp" --expect-blocked
```

### Running Single Tests
```bash
# Python - Test specific hook types
uv run test-damage-control.py bash Bash "ls -la" --expect-allowed
uv run test-damage-control.py write Write "/tmp/test.txt" --expect-allowed
uv run test-damage-control.py edit Edit "./README.md" --expect-allowed

# TypeScript - Test specific hook types
bun run test-damage-control.ts bash Bash "git status" --expect-allowed
bun run test-damage-control.ts write Write "package.json" --expect-allowed
bun run test-damage-control.ts edit Edit "src/index.ts" --expect-allowed
```

## Code Style Guidelines

### File Structure and Naming
- **Plugin directories**: Use kebab-case (`damage-control`, `gh-tools`)
- **Agent files**: Use kebab-case `.md` files in `agents/` directory
- **Skill files**: Use `SKILL.md` with YAML frontmatter in named subdirectories under `skills/`
- **Command files**: Use kebab-case `.md` files in `commands/` directory
- **Hook implementations**: Use descriptive names with tool prefixes (`bash-tool-damage-control.py`)
- **Configuration files**: Use JSON for settings, YAML for patterns

### YAML Frontmatter (Skills)
All skill files must include YAML frontmatter:
```yaml
---
name: skill-name
description: Brief description of when to use this skill
---
```

### YAML Frontmatter (Agents)
All agent files must include YAML frontmatter:
```yaml
---
name: agent-name
description: When to use this agent and what it does
---
```

### Import Style
- **Python**: Use standard library imports first, then third-party
```python
import json
import sys
import os
from pathlib import Path
from typing import Tuple, List, Dict, Any

import yaml
```

- **TypeScript**: Use ES6 imports, node modules first
```typescript
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { homedir } from "os";
import { parse as parseYaml } from "yaml";
```

### Error Handling
- **Python**: Use descriptive error messages with exit codes
```python
# Exit code 0 = Allow, 2 = Block
print(f"BLOCKED: {reason}", file=sys.stderr)
sys.exit(2)
```

- **TypeScript**: Use process.exit with appropriate codes
```typescript
console.error(`BLOCKED: ${reason}`);
process.exit(2);
```

### Security Patterns
- **Regex patterns**: Use word boundaries (`\b`) for precise matching
- **Path protection**: Support glob patterns (`*.pem`, `.env*`)
- **Command blocking**: Focus on destructive operations (`rm -rf`, `git reset --hard`)

### JSON Output Format
For "ask" patterns, use this specific structure:
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "ask",
    "permissionDecisionReason": "Brief explanation"
  }
}
```

### Documentation Style
- **README files**: Use Traditional Chinese for main repository and plugin READMEs
- **Agent/Skill content**: Use Traditional Chinese for user-facing instructions
- **Code comments**: Be concise, focus on security implications
- **Skill instructions**: Use clear trigger phrases and response patterns

### Testing Guidelines
- **Hook testing**: Test both allowed and blocked scenarios
- **Pattern validation**: Ensure regex patterns match intended commands
- **Path testing**: Verify glob patterns work for sensitive files
- **Exit code verification**: Confirm proper exit codes (0 = allow, 2 = block)

### Plugin Development
- **Plugin metadata**: Include in `.claude-plugin/plugin.json`
- **Marketplace registration**: Add to `.claude-plugin/marketplace.json`
- **Skill triggers**: Use clear, specific trigger phrases
- **Agent triggers**: Use descriptive `description` field with concrete examples
- **Component structure**: Follow standard directories (`commands/`, `agents/`, `skills/`, `hooks/`)

### Security Considerations
- **Zero-access paths**: Completely block access to credentials, secrets
- **Read-only paths**: Allow reading but block modifications (lock files, build artifacts)
- **No-delete paths**: Allow all operations except deletion (documentation, git)
- **Command patterns**: Block destructive operations, allow safe development commands

## Environment Variables
- `$CLAUDE_PROJECT_DIR`: Root directory of the current project
- `$CLAUDE_PLUGIN_ROOT`: Root directory of the current plugin (use for intra-plugin path references)
- Hook scripts should use these for resolving relative paths

## File Permissions
- Hook scripts must be executable (`chmod +x`)
- Pattern files should be readable by all users
- Settings files should be writable only by the user

## Marketplace Structure
```
agentic-plugins/
├── .claude-plugin/marketplace.json    # Registry of all plugins
├── plugins/
│   ├── plugin-name/.claude-plugin/plugin.json
│   ├── plugin-name/agents/agent-name.md      # For agent plugins
│   ├── plugin-name/skills/skill-name/SKILL.md
│   ├── plugin-name/commands/command-name.md
│   └── plugin-name/README.md
└── README.md
```

When creating new plugins, follow this structure exactly and register the plugin in the marketplace.json file.
