# 原始 CLI 命令

在新的 tmux 視窗中執行原始 CLI 命令。

## Instructions

- 執行前先跑 `<command> --help` 了解命令及其選項。
- 可用 `--title` 指定視窗標題，否則會自動從命令推斷。

## 執行方式

```bash
uv run tools/fork_tmux.py <command>
```

## 範例

```bash
# 啟動開發伺服器
uv run tools/fork_tmux.py npm run dev

# 監看檔案變更
uv run tools/fork_tmux.py "watch -n 2 'ls -la'"

# 指定視窗標題
uv run tools/fork_tmux.py --title "db" docker compose up postgres
```
