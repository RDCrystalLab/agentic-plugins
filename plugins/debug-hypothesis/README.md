# debug-hypothesis

> 假設驅動除錯法 — 用科學方法迴圈讓 agent 停止亂猜、開始推理。

把除錯從「亂試 fix 然後祈禱」變成有紀律的調查流程。每個階段都有目標、硬規則，以及一張預先反駁 agent 偷懶藉口的 rationalization 表。

核心原則：**沒有證據證明假設正確之前，不准寫 fix 程式碼。** 用猜的不叫 debug。

## 為什麼需要這個 skill

AI 除錯的第一大失敗模式：

> agent 形成一個理論 → 寫 150 行 fix → 沒用 → 又寫 150 行往同一個錯誤理論更深處鑽。

這個 skill 就是為了攔下這種 bulldozer 行為而存在。

## 四階段迴圈

```
OBSERVE  ──▶  HYPOTHESIZE  ──▶  EXPERIMENT  ──▶  CONCLUDE
   │              │                  │               │
   ▼              ▼                  ▼               ▼
收集症狀、     列 3-5 個         單一最小            根本原因
穩定重現      可能原因 +         實驗驗證            確認 / 回圈
              支持 / 反證        每次最多改 5 行
   │              │                  │               │
   └──────────────┴──────────────────┴───────────────┘
              全部寫進 DEBUG.md
```

四條硬規則：

1. **所有東西寫進 `DEBUG.md`**。Context compaction 會吃掉只存在於對話裡的推理。
2. Observe / Hypothesize / Experiment 階段**不准寫 fix 程式碼**。
3. **不准跳過 Hypothesize**。「我大概知道是什麼」也是假設 — 寫下來、跟其他假設一起測。
4. **每次實驗最多改 5 行**。如果需要更多，代表假設太模糊 — 拆開。

## 何時觸發

- 測試掛了、原因不明顯
- 同一個 bug 已經「修好」兩次又跑回來
- agent 試過一個 fix 沒用 — 攔住它別再亂試
- 沒看過的 crash 或錯誤訊息
- 沒有明顯成因的 performance regression
- 環境差異（本地 vs CI、dev vs prod）
- agent 卡在迴圈裡反覆套用同一個錯誤 fix

## 何時**不要**用

- typo、漏 import、語法錯誤 — 直接修
- build 錯誤訊息已經明確指出單一行成因
- 你已經知道根本原因、只差寫 fix

## 觸發詞

**English:** debug, hypothesis, scientific method, debugging loop, root cause, can't fix this bug, same bug came back

**繁體中文：** 這個 bug 怎麼修、為什麼測試會掛、一直修不好、同一個 bug 又出現、科學方法除錯、不要亂猜、debug 卡住了、本地會過 CI 卻掛

## 來源

移植自 [LichAmnesia/lich-skills](https://github.com/LichAmnesia/lich-skills/tree/main/skills/debug-hypothesis)，原作者 LichAmnesia，MIT 授權。

本插件除了加入中文觸發詞與繁體中文 README 外，未對 SKILL.md 內容做任何修改。
