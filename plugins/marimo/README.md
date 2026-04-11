# marimo

[marimo](https://marimo.io) reactive notebook 全方位技能包。合併自 [marimo-team/marimo-pair](https://github.com/marimo-team/marimo-pair) 和 [marimo-team/skills](https://github.com/marimo-team/skills)。

## 包含技能（11 個）

### 核心

| 技能 | 用途 |
|------|------|
| **marimo-notebook** | 教 agent 正確格式撰寫 marimo notebook（`@app.cell`、PEP 723、`marimo check`） |
| **marimo-pair** | 在運行中的 notebook kernel 即時配���程式設計（執行程式碼、建立 cell、操作 reactive graph） |

### 轉換

| 技能 | 用途 |
|------|------|
| **jupyter-to-marimo** | `.ipynb` → marimo `.py` 轉換 |
| **streamlit-to-marimo** | Streamlit app → marimo 轉換 |

### 視覺化

| 技能 | 用途 |
|------|------|
| **anywidget** | 產生 anywidget 互動元件���vanilla JS + CSS） |

### 論文實作

| 技能 | 用途 |
|------|------|
| **implement-paper** | 將研究論文���作為互動式 notebook（與用戶互動） |
| **implement-paper-auto** | 全自動論文實作，無需用戶輸入 |
| **auto-paper-demo** | 自動從論文產生 demo notebook |

### 工具

| 技能 | 用途 |
|------|------|
| **marimo-batch** | 準備 notebook 做排程批次執行（Pydantic + CLI args） |
| **wasm-compatibility** | 檢查 notebook 是否可在 WASM 環境運行 |
| **add-molab-badge** | 加入 "Open in molab" 徽章到 README |

## 在 Jupyter / Colab 中使用 marimo

```bash
uv pip install 'marimo[sandbox]>=0.21.1' marimo-jupyter-extension
```

詳見 `skills/marimo-notebook/references/JUPYTER-EXTENSION.md`。

## 前置條件

- [marimo](https://marimo.io) >= 0.21.1
- [uv](https://docs.astral.sh/uv/) 建議安裝
- `bash`、`curl`、`jq`（marimo-pair 腳本需要）

## 啟動 marimo

```bash
# 專案內
uv run marimo edit notebook.py --no-token

# 獨立使用（sandbox）
uvx marimo@latest edit notebook.py --no-token --sandbox
```
