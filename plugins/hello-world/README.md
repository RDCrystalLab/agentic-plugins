# Hello World Plugin

A simple example skill that demonstrates basic Claude Code plugin structure and functionality.

## Installation

```bash
claude /plugin add /path/to/hello-world
```

## Skills

### hello-world

A greeting skill that responds to hello world messages.

**Trigger phrases:**
- "Hello world"
- "Test skill installation"
- "Greet me"

## Structure

```
hello-world/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── hello-world/
│       └── SKILL.md
└── README.md
```

## License

MIT
