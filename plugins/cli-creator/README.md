# cli-creator

從 API 文件、OpenAPI spec、curl 範例、SDK 或現有腳本，建立可組合的 CLI 工具。

改編自：[OpenAI Codex Skills](https://github.com/openai/codex)

## 特色

- **Composable commands** — discover → resolve → read → write 的漸進式設計
- **Stable JSON** — 所有命令支援 `--json` 機器可讀輸出
- **Doctor command** — `tool --json doctor` 一鍵檢查設定
- **Auth 三層** — 環境變數 → config 檔 → flag
- **Companion skill** — 自動產生教 AI agent 使用此 CLI 的 SKILL.md

## Runtime 偏好

| 優先順序 | Runtime | 適用場景 |
|----------|---------|---------|
| 1 | **Python (uv single-file)** | 大多數情況。單檔 + inline 依賴，零設定 |
| 2 | **Rust** | 效能要求高、需分發 binary |
| 3 | **TypeScript/Node** | 有官方 SDK 或 browser automation 需求 |

### Python uv single-file 範例

```python
#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["httpx"]
# ///

import argparse, json, sys

def main():
    parser = argparse.ArgumentParser(prog="my-cli")
    parser.add_argument("--json", action="store_true")
    # ...
```

安裝到 PATH：

```bash
cp my-cli.py ~/.local/bin/my-cli
chmod +x ~/.local/bin/my-cli
```

## 使用

```
/cli-creator
```

然後描述你想建的工具和來源即可。
