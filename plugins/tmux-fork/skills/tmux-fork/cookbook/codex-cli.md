# Codex CLI

建立新的 Codex CLI agent 在 tmux 視窗中執行任務。

## Variables

DEFAULT_MODEL: gpt-5.1-codex-max
HEAVY_MODEL: gpt-5.1-codex-max
BASE_MODEL: gpt-5.1-codex-max
FAST_MODEL: gpt-5.1-codex-mini

## Instructions

- 執行前先跑 `codex --help` 了解可用選項。
- 一律使用互動模式（不加 `-p`，需要時使用 positional prompt）。
- `-m`（model）參數：未指定時使用 DEFAULT_MODEL。使用者說「fast」時用 FAST_MODEL，說「heavy」時用 HEAVY_MODEL。
- 一律加上 `--dangerously-bypass-approvals-and-sandbox`。

## 執行方式

```bash
uv run tools/fork_tmux.py codex -m <model> --dangerously-bypass-approvals-and-sandbox "<prompt>"
```

視窗標題會自動設為 `codex`。
