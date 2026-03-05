# Prompt

## 對話歷史

這是使用者與 agent 之間的對話歷史。
讀取後用來理解下一步請求的上下文。
包含對話摘要，讓 fork 出去的 agent 能理解先前的脈絡。

<fill_in_conversation_summary_here>
```yaml
- history:
    - user_prompt: <使用者 prompt 摘要>
      agent_response: <agent 回應摘要>
    - user_prompt: <使用者 prompt>
      agent_response: <agent 回應>
    - user_prompt: <使用者 prompt>
      agent_response: <agent 回應>
```
</fill_in_conversation_summary_here>

## 下一步請求

<fill_in_next_user_request_here>
  <完整的使用者請求內容>
</fill_in_next_user_request_here>
