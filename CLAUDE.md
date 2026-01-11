# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Claude Code plugins marketplace repository (agentic-plugins). It contains multiple plugins, each in its own directory under `plugins/`.

## Repository Structure

```
agentic-plugins/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace registration
├── plugins/
│   ├── hello-world/              # Example plugin
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   ├── skills/
│   │   │   └── hello-world/
│   │   │       └── SKILL.md
│   │   └── README.md
│   └── damage-control/           # Security hooks plugin
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── skills/
│       │   └── damage-control/
│       │       ├── SKILL.md
│       │       ├── patterns.yaml
│       │       ├── cookbook/
│       │       ├── hooks/
│       │       └── test-prompts/
│       └── README.md
└── README.md
```

## Key Files

- **`.claude-plugin/marketplace.json`**: Registers this repo as a marketplace with all available plugins
- **`plugins/*/plugin.json`**: Individual plugin metadata
- **`plugins/*/skills/*/SKILL.md`**: Skill definitions with YAML frontmatter

## Creating a New Plugin

1. Create a directory under `plugins/` with the plugin name
2. Add `.claude-plugin/plugin.json` with metadata
3. Add components in standard directories (auto-discovered):
   - `commands/` - Slash commands
   - `agents/` - Specialized agents
   - `skills/` - Agent skills
   - `hooks/` - Event handlers
4. Add `README.md` documenting the plugin
5. Register in `.claude-plugin/marketplace.json`

## Damage Control Plugin

The damage-control plugin provides security through PreToolUse hooks:

- **bashToolPatterns**: Regex patterns to block/ask for dangerous bash commands
- **zeroAccessPaths**: Completely blocked paths (secrets, credentials)
- **readOnlyPaths**: Read allowed, modifications blocked
- **noDeletePaths**: All operations except delete

Implementations available in Python (requires UV) and TypeScript (requires Bun).
