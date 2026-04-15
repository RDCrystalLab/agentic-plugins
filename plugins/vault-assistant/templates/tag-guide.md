# 🏷️ SB Vault 標籤使用指南

#meta #guide #tags #status/active

## 🎯 **標籤的用途**

標籤讓你可以：
- **橫向連結**不同資料夾中的相關內容
- **快速過濾**特定主題的所有筆記
- **建立動態分類**不受資料夾結構限制
- **追蹤專案狀態**和工作進度

## 🏗️ **標籤命名規範**

### 1. **專案標籤**
```
#project/aml                    - AML / Crypto Analysis（主要工作）
#project/agentic-plugins        - AI agent 工具插件
#project/agent-execution-env    - Agent 執行環境（DevContainer + SPIFFE）
#project/k8s-local-dev-demo     - K8s Zero Trust Research
#project/secureminions          - SecureMinions 安全架構
#project/vai-inference-service  - VAI 推論服務（暫停）
#project/ai-detective-assistant - AI 偵探助手
#project/iof                    - IoF 森林監控（歸檔）
#project/mbo                    - 績效管理（歸檔）
```

### 2. **領域標籤** 
```
#infrastructure/proxmox
#infrastructure/kubernetes
#infrastructure/networking
#development/ai
#development/devops
#development/frontend
#development/backend
```

### 3. **工具標籤**
```
#tool/docker
#tool/kubernetes
#tool/git
#tool/ansible
#tool/terraform
```

### 4. **文件類型標籤**
```
#architecture
#design-document
#setup-guide
#reference
#troubleshooting
#meeting-notes
#tutorial
```

### 5. **狀態標籤**
```
#status/active        - 進行中
#status/planning      - 規劃中
#status/on-hold       - 暫停
#status/completed     - 已完成
#status/archived      - 已封存
#status/deprecated    - 已棄用
```

### 6. **重要性標籤**
```
#priority/high        - 高優先級
#priority/medium      - 中優先級
#priority/low         - 低優先級
#urgent              - 緊急
#important           - 重要
```

## 🔍 **如何使用標籤搜尋**

### 1. **基本搜尋**
在搜尋框中輸入：
```
tag:#project/vai-inference-service
tag:#infrastructure/proxmox
tag:#status/active
```

### 2. **組合搜尋**
```
tag:#project/vai-inference-service tag:#status/active
tag:#development/ai tag:#architecture
tag:#infrastructure tag:#setup-guide
```

### 3. **排除搜尋**
```
tag:#project/vai-inference-service -tag:#status/archived
```

### 4. **使用標籤面板**
- **開啟標籤面板**：`Ctrl+P` → 搜尋 "Tags: Show tag pane"
- **點擊標籤**：直接點擊標籤名稱查看所有使用該標籤的筆記
- **階層瀏覽**：展開 `#project` 查看所有專案子標籤

## 📝 **在筆記中使用標籤**

### 1. **檔案開頭使用**（推薦）
```markdown
# 檔案標題

#project/vai-inference-service #architecture #design-document #status/active

內容開始...
```

### 2. **檔案結尾使用**
```markdown
...內容結束

---
*Tags: #project/vai-inference-service #architecture #design-document #status/active*
```

### 3. **內容中使用**
```markdown
這個功能需要 #docker 容器化，並部署到 #infrastructure/kubernetes 叢集上。
```

## 🎨 **標籤最佳實務**

### ✅ **好的做法**
- **使用階層結構**：`#project/vai-inference-service/backend`
- **保持一致性**：統一命名規則
- **適度使用**：每個檔案 3-8 個標籤
- **定期整理**：刪除不再使用的標籤

### ❌ **避免的做法**
- **過度細分**：`#project/vai-inference-service/backend/api/v1/auth`
- **重複分類**：同時使用 `#ai` 和 `#artificial-intelligence`
- **標籤過多**：一個檔案超過 10 個標籤
- **含空格**：使用 `#ai-development` 而非 `#ai development`

## 🔄 **標籤管理工作流程**

### 1. **新增標籤時**
- 先檢查是否已有類似標籤
- 遵循既定的命名規範
- 考慮標籤的層級結構

### 2. **定期維護**
- 每月檢視標籤使用情況
- 合併重複或相似的標籤
- 移除不再使用的標籤

### 3. **標籤重構**
```markdown
# 舊標籤 → 新標籤
#vai-inference → #project/vai-inference-service
#k8s → #infrastructure/kubernetes
#docker-guide → #tool/docker #setup-guide
```

## 🚀 **實用搜尋查詢**

### **找到所有進行中的專案**
```
tag:#status/active tag:#project
```

### **查看所有設定指南**
```
tag:#setup-guide
```

### **找出需要更新的文件**
```
tag:#status/deprecated OR tag:#status/outdated
```

### **查看特定專案的所有架構文件**
```
tag:#project/vai-inference-service tag:#architecture
```

### **找出所有故障排除文件**
```
tag:#troubleshooting
```

## 🎯 **標籤使用建議**

1. **從小開始**：先使用基本標籤，再逐步增加
2. **保持簡單**：標籤名稱要簡潔明瞭
3. **規律使用**：養成為新筆記加標籤的習慣
4. **善用搜尋**：利用標籤組合搜尋找到精確內容
5. **定期檢視**：定期檢查和清理標籤系統

---

## 📋 **當前 Vault 標籤清單**

### 專案標籤
- `#project/aml`
- `#project/agentic-plugins`
- `#project/agent-execution-env`
- `#project/k8s-local-dev-demo`
- `#project/secureminions`
- `#project/vai-inference-service`
- `#project/ai-detective-assistant`
- `#project/iof`
- `#project/mbo`

### 基礎設施標籤
- `#infrastructure/proxmox`
- `#infrastructure/kubernetes`
- `#infrastructure/networking`

### 開發標籤
- `#development/ai`
- `#development/devops`
- `#development/frontend`
- `#development/backend`

### 工具標籤
- `#tool/docker`
- `#tool/kubernetes`
- `#tool/git`
- `#tool/ansible`

### 狀態標籤
- `#status/active`
- `#status/planning`
- `#status/pending`
- `#status/completed`
- `#status/archived`

### 文件類型標籤
- `#architecture`
- `#design-document`
- `#setup-guide`
- `#reference`
- `#tutorial`

---
*這個指南本身也使用了標籤：#meta #guide #tags #status/active*