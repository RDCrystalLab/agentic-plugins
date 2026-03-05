# Claude Code

建立新的 Claude Code agent 在 tmux 視窗中執行任務。

## Variables

DEFAULT_MODEL: opus
HEAVY_MODEL: opus
BASE_MODEL: sonnet
FAST_MODEL: haiku

## Instructions

- 執行前先跑 `claude --help` 了解可用選項。
- 一律使用互動模式（不加 `-p`）。
- `--model` 參數：未指定時使用 DEFAULT_MODEL。使用者說「fast」時用 FAST_MODEL，說「heavy」時用 HEAVY_MODEL。
- 一律加上 `--dangerously-skip-permissions`。

## 執行方式

```bash
uv run tools/fork_tmux.py claude --model <model> --dangerously-skip-permissions "<prompt>"
```

視窗標題會自動設為 `claude`。
