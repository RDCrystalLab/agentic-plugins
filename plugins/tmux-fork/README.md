# tmux-fork

Fork new tmux windows to spawn parallel AI agents or run CLI commands.

Based on [disler/fork-repository-skill](https://github.com/disler/fork-repository-skill), adapted for tmux with smart window renaming.

## Prerequisites

- [tmux](https://github.com/tmux/tmux) installed and running in a tmux session
- [uv](https://github.com/astral-sh/uv) for running Python scripts

### Optional (for agentic coding tools)

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- [Codex CLI](https://github.com/openai/codex)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli)

## Supported Tools

| Tool | Trigger Examples | Default Model |
|------|-----------------|---------------|
| **Claude Code** | "fork terminal use claude code to..." | `opus` |
| **Codex CLI** | "fork terminal use codex to..." | `gpt-5.3-codex` |
| **Gemini CLI** | "fork terminal use gemini to..." | `gemini-3-pro-preview` |
| **Raw CLI** | "fork terminal run npm run dev" | N/A |

### Model Modifiers

- **default**: Uses the tool's default model
- **"fast"**: Uses a lighter, faster model
- **"heavy"**: Uses the most capable model

## Usage Examples

```
fork terminal use claude code to refactor the auth module
fork terminal use gemini fast to write tests for the API
fork terminal run npm run dev
new terminal: watch -n 2 'ls -la'
fork terminal use claude code to implement the feature, summarize work so far
```

## Smart Window Titles

Windows are automatically titled based on the command:
- `claude` for Claude Code sessions
- `codex` for Codex CLI sessions
- `gemini` for Gemini CLI sessions
- Tool name (e.g., `dev`, `pytest`, `docker`) for CLI commands
