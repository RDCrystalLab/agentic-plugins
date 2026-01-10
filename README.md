# Example Skills for Claude Code

A collection of example skills for the Claude Code marketplace.

## Installation

### From Local Directory

```bash
# Add this plugin to Claude Code
/plugin add /path/to/this/directory

# Or install individual skills
/plugin install hello-world@example-skills
```

### From GitHub (after publishing)

```bash
/plugin marketplace add owner/skills
/plugin install hello-world@example-skills
```

## Available Skills

### hello-world

A simple greeting skill that demonstrates basic skill functionality.

**Trigger phrases:**
- "Hello world"
- "Test skill installation"
- "Greet me"

## Creating New Skills

1. Create a new folder in `skills/` directory
2. Add a `SKILL.md` file with YAML frontmatter:

```yaml
---
name: your-skill-name
description: Description of what this skill does and when to trigger it.
---

# Your Skill Name

## Instructions
[Instructions for Claude to follow]

## Examples
[Example usage and responses]

## Guidelines
[Best practices and constraints]
```

3. Update `plugin.json` to include the new skill path

## Directory Structure

```
.
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── skills/
│   └── hello-world/
│       └── SKILL.md         # Skill definition
└── README.md
```

## License

MIT
