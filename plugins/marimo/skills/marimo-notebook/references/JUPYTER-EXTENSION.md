# 在 Jupyter / Colab 中使用 marimo

如果用戶想在 JupyterLab、JupyterHub 或 Google Colab 中使用 marimo，推薦安裝 **marimo-jupyter-extension**。

來源：[marimo-team/marimo-jupyter-extension](https://github.com/marimo-team/marimo-jupyter-extension)

## 快速安裝

```bash
uv pip install 'marimo[sandbox]>=0.21.1' marimo-jupyter-extension
```

啟動 JupyterLab 後，launcher 裡會出現 marimo 圖示。

## Google Colab 使用方式

Colab 基於 Jupyter，可以透過安裝 extension 來使用 marimo：

```python
# 在 Colab cell 中執行
!pip install 'marimo[sandbox]>=0.21.1' marimo-jupyter-extension
```

安裝後重啟 runtime，即可在 Colab 環境中使用 marimo 的 reactive notebook 功能。

## 功能

| 功能 | 說明 |
|------|------|
| Launcher 整合 | marimo 出現在 JupyterLab launcher |
| 檔案類型支援 | 雙擊 `_mo.py` 直接在 marimo 中開啟 |
| Sidebar 面板 | 監控 server 狀態、管理 session |
| Venv 選擇 | 建立 notebook 時選擇 Python 環境（PEP 723） |
| 右鍵選單 | `.py` 用 marimo 編輯、`.ipynb` 轉換為 marimo |
| JupyterHub 相容 | 支援現有 authenticator 和 spawner |
| Sandbox 模式 | 用 uvx 在隔離環境中執行 |

## 安裝場景

### 單一環境（最簡單）

```bash
uv pip install 'marimo[sandbox]>=0.21.1' marimo-jupyter-extension
```

### 多環境（JupyterHub）

| 套件 | 安裝位置 | 原因 |
|------|----------|------|
| `marimo` | 用戶環境 | 存取用戶的套件 |
| `marimo-jupyter-extension` | Jupyter 環境 | Jupyter 需要 import 它 |

## 設定

### Standalone JupyterLab

```bash
# 一次性（CLI 參數）
jupyter lab --MarimoProxyConfig.no_sandbox=True

# 永久設定（jupyter_server_config.py）
jupyter --config-dir  # 找到設定目錄
```

在 `jupyter_server_config.py` 中：

```python
c.MarimoProxyConfig.no_sandbox = True
```

### JupyterHub

在 `jupyterhub_config.py` 中：

```python
# 指定 marimo 路徑
c.MarimoProxyConfig.marimo_path = "/opt/bin/marimo"

# 或用 uvx 模式（sandbox）
c.MarimoProxyConfig.uvx_path = "/usr/local/bin/uvx"

# 啟動逾時（預設 60 秒）
c.MarimoProxyConfig.timeout = 120

# Debug 模式
c.MarimoProxyConfig.debug = True
```

## 疑難排解

| 問題 | 解法 |
|------|------|
| marimo 圖示沒出現 | 確認 `marimo-jupyter-extension` 裝在 Jupyter 的環境裡 |
| 圖示出現但無法啟動 | 確認 marimo 在 PATH 中，或設定 `MarimoProxyConfig.marimo_path` |
| 找不到已安裝模組 | 確認 marimo 和模組在同一環境 |
| Sandbox 內套件失效 | 設定 `no_sandbox=True` 或確保套件在 PEP 723 metadata 中 |
| "No such option: --base-url" | 升級 marimo 至 >= 0.21.1 |

## 從 jupyter-marimo-proxy 遷移

```bash
pip uninstall jupyter-marimo-proxy
pip install marimo-jupyter-extension
```

設定相容，直接替換。
