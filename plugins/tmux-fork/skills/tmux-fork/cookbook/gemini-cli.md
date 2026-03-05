# Gemini CLI

建立新的 Gemini CLI agent 在 tmux 視窗中執行任務。

## Variables

DEFAULT_MODEL: gemini-3-pro-preview
HEAVY_MODEL: gemini-3-pro-preview
BASE_MODEL: gemini-3-pro-preview
FAST_MODEL: gemini-2.5-flash

## Instructions

- 執行前先跑 `gemini --help` 了解可用選項。
- 一律使用互動模式，`-i` 旗標放在最後、prompt 之前（例如 `gemini --model gemini-2.5-flash -y -i "prompt"`）。
- `--model` 參數：未指定時使用 DEFAULT_MODEL。使用者說「fast」時用 FAST_MODEL，說「heavy」時用 HEAVY_MODEL。
- 一律加上 `--yolo`（或簡寫 `-y`）。

## 執行方式

```bash
uv run tools/fork_tmux.py gemini --model <model> -y -i "<prompt>"
```

視窗標題會自動設為 `gemini`。
