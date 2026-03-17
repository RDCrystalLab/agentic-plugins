# 結果記錄協議

每次迭代都需記錄在結構化日誌中。幫助識別模式，避免重複失敗的實驗。

## 日誌格式（TSV）

在工作目錄建立 `autoresearch-results.tsv`（加入 .gitignore）：

```tsv
iteration	commit	metric	delta	guard	status	description
```

### 欄位說明

| 欄位 | 類型 | 說明 |
|------|------|------|
| iteration | int | 從 0（基準線）開始的序號 |
| commit | string | 短 git hash（7 字元），還原後為 "-" |
| metric | float | 驗證測量值 |
| delta | float | 與上次最佳值的差距（「越低越好」的指標，負值表示改善） |
| guard | enum | `pass`、`fail`，或 `-`（未設定防護） |
| status | enum | `baseline`、`keep`、`discard`、`crash` |
| description | string | 一句話描述本次嘗試的內容 |

### 範例

```tsv
iteration	commit	metric	delta	guard	status	description
0	a1b2c3d	85.2	0.0	pass	baseline	初始狀態——測試覆蓋率 85.2%
1	b2c3d4e	87.1	+1.9	pass	keep	新增 auth 中介層邊界情況的測試
2	-	86.5	-0.6	-	discard	重構測試輔助函式（導致 2 個測試失敗）
3	-	0.0	0.0	-	crash	新增整合測試（DB 連線失敗）
4	-	88.9	+1.8	fail	discard	內聯熱路徑函式（防護失敗：3 個測試損壞）
5	c3d4e5f	88.3	+1.2	pass	keep	新增 API 路由錯誤處理的測試
6	d4e5f6g	89.0	+0.7	pass	keep	新增驗證器的邊界值測試
```

**注意：** 當防護失敗時，指標可能有所改善但變更仍被丟棄。防護（guard）欄位在日誌中清楚顯示這一點，讓代理（agent）能學習哪類變更容易造成回歸。

## 日誌管理

- 在設定階段建立（迭代 0 = 基準線）
- 每次迭代後追加（包含崩潰）
- 不要將此檔案 commit 到 git（加入 .gitignore）
- 每次迭代開始時讀取最後 10-20 筆記錄以了解上下文
- 用於識別模式：哪類變更通常會成功？

## 摘要報告

每 10 次迭代（或有界模式的迴圈完成時），印出簡短摘要：

```
=== Autoresearch 進度（迭代 20）===
基準線：85.2% → 目前最佳：92.1%（+6.9%）
保留：8 | 丟棄：10 | 崩潰：2
最後 5 次：keep, discard, discard, keep, keep
```

## 指標方向

在設定階段說明越低還是越高越好：
- **越低越好：** val_bpb、回應時間（ms）、Bundle 大小（KB）、錯誤數
- **越高越好：** 測試覆蓋率（%）、Lighthouse 分數、吞吐量（req/s）

在結果日誌第一行以註解記錄方向：
```
# metric_direction: higher_is_better
```
