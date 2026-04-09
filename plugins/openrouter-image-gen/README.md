# openrouter-image-gen

透過 [OpenRouter](https://openrouter.ai/) API 生成圖片，支援 Flux、Gemini、GPT-5 Image 等多種模型。

原作者：[Burke Holland](https://github.com/burkeholland/openrouter-image-gen-skill)

## 支援模型

| 模型 | 費用 | 最適合 |
|------|------|--------|
| `google/gemini-2.5-flash-image` | 最便宜 | 通用、快速、品質好 |
| `google/gemini-3.1-flash-image-preview` | 低 | 延伸長寬比、支援 0.5K |
| `google/gemini-3-pro-image-preview` | 中 | 更高品質 Gemini |
| `black-forest-labs/flux.2-pro` | 中 | 寫實攝影風格 |
| `black-forest-labs/flux.2-max` | 中 | 最高品質 Flux |
| `openai/gpt-5-image-mini` | 中高 | GPT 級提示詞理解 |
| `openai/gpt-5-image` | 貴 | 最佳提示詞跟隨 + 推理 |
| `bytedance-seed/seedream-4.5` | 中 | ByteDance 圖像生成 |

## 設定

取得 OpenRouter API 金鑰：[openrouter.ai/keys](https://openrouter.ai/keys)

將金鑰設為環境變數：

```bash
export OPENROUTER_API_KEY=your-key-here
```

## 使用

在 Claude Code 中直接描述你想要的圖片，例如：
- 「幫我生成一張 16:9 的 YouTube 縮圖，主題是...」
- 「建立一張手繪風格的架構圖...」
- 「把這張圖片的天空改成紫色」
