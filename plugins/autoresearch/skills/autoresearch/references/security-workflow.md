# 安全工作流程（Security Workflow） — /autoresearch:security

使用 autoresearch 迴圈自動執行安全稽核，迭代式地發現、驗證並回報漏洞。將 STRIDE 威脅建模、OWASP Top 10 掃描與紅隊對抗分析整合為單一自主迴圈。

**輸出結果：** 一份按嚴重性排序的安全報告，包含威脅模型、發現結果、緩解措施與迭代日誌。

## 觸發條件（Trigger）

- 使用者執行 `/autoresearch:security`
- 使用者說「security audit」、「run a security sweep」、「threat model this codebase」、「find vulnerabilities」
- 使用者說「red-team this app」、「OWASP audit」、「STRIDE analysis」

## 迴圈支援（Loop Support）

支援無界限與有界限兩種模式：

```
# 無限制 — 持續發現漏洞直到中斷為止
/autoresearch:security

# 有界限 — 精確執行 N 次安全掃描迭代
/loop 10 /autoresearch:security

# 指定目標範圍
/autoresearch:security
Scope: src/api/**/*.ts, src/middleware/**/*.ts
Focus: authentication and authorization flows
```

## 架構（Architecture）

```
┌─────────────────────────────────────────────────────────────┐
│                  SETUP PHASE (once)                         │
│                                                             │
│  1. Scan codebase → identify tech stack, frameworks, APIs   │
│  2. Map assets → data stores, auth, external services       │
│  3. Identify trust boundaries → client/server, API/DB       │
│  4. Generate STRIDE threat model                            │
│  5. Build attack surface map                                │
│  6. Create security-audit-results.tsv log                   │
│  7. Establish baseline (count known issues)                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                  AUTONOMOUS LOOP                            │
│                                                             │
│  Each iteration: pick ONE attack vector from the threat     │
│  model, attempt to find/validate the vulnerability,         │
│  log the result, move to next vector.                       │
│                                                             │
│  LOOP (FOREVER or N times):                                 │
│    1. Review: threat model + past findings + results log    │
│    2. Select: pick next untested attack vector              │
│    3. Analyze: deep-dive into target code for the vector    │
│    4. Validate: construct proof (code path, input, output)  │
│    5. Classify: severity + OWASP category + STRIDE category │
│    6. Log: append to results log                            │
│    7. Repeat                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 設置階段（Setup Phase） — 威脅模型生成

### 步驟一：程式碼庫偵察

掃描專案以建立背景資訊：

```
READ:
  - package.json / requirements.txt / go.mod (dependencies)
  - .env.example / config files (secrets handling)
  - Dockerfile / docker-compose.yml (infrastructure)
  - API route files (attack surface)
  - Auth/middleware files (trust boundaries)
  - Database schemas/models (data assets)
  - CI/CD configs (supply chain)
```

### 步驟二：資產識別（Asset Identification）

列舉所有具有安全相關性的資產：

| 資產類型（Asset Type） | 範例 | 優先級 |
|------------------------|------|--------|
| **資料儲存（Data stores）** | 資料庫、Redis、檔案儲存、cookies、localStorage | 極高（Critical） |
| **身份驗證（Authentication）** | 登入、OAuth、JWT、sessions、API keys | 極高（Critical） |
| **API 端點（API endpoints）** | REST routes、GraphQL resolvers、webhooks | 高（High） |
| **外部服務（External services）** | 支付 API、電子郵件供應商、CDN、分析服務 | 高（High） |
| **使用者輸入介面（User input surfaces）** | 表單、URL 參數、headers、檔案上傳 | 高（High） |
| **設定（Configuration）** | 環境變數、功能標誌、CORS 設定 | 中（Medium） |
| **靜態資源（Static assets）** | 公開檔案、上傳內容、產生的檔案 | 低（Low） |

### 步驟三：信任邊界映射（Trust Boundary Mapping）

識別信任層級發生變化的位置：

```
Trust Boundaries:
  ├── Browser ←→ Server (client-side vs server-side)
  ├── Server ←→ Database (application vs data layer)
  ├── Server ←→ External APIs (internal vs third-party)
  ├── Public routes ←→ Authenticated routes
  ├── User role ←→ Admin role (privilege levels)
  ├── CI/CD ←→ Production (deployment boundary)
  └── Container ←→ Host (infrastructure boundary)
```

### 步驟四：STRIDE 威脅模型

針對每個資產與信任邊界的組合，使用 STRIDE 分析威脅：

| 威脅（Threat） | 問題 | 發現範例 |
|----------------|------|----------|
| **S**poofing（偽冒） | 攻擊者能冒充使用者或服務嗎？ | 弱身份驗證、缺少 CSRF 防護、偽造 JWT |
| **T**ampering（竄改） | 資料在傳輸或儲存時能被修改嗎？ | 缺少輸入驗證、SQL 注入、prototype pollution |
| **R**epudiation（否認） | 行為能在沒有證據的情況下被否認嗎？ | 缺少稽核日誌、未簽署的交易 |
| **I**nformation Disclosure（資訊洩露） | 敏感資料會洩漏嗎？ | 錯誤訊息暴露內部資訊、日誌中的 PII、除錯端點 |
| **D**enial of Service（阻斷服務） | 服務能被中斷嗎？ | 缺少速率限制、正規表達式 DoS、資源耗盡 |
| **E**levation of Privilege（提升權限） | 使用者能獲得未授權的存取嗎？ | IDOR、存取控制失效、路徑穿越 |

在安全報告中以結構化表格輸出威脅模型。

### 步驟五：攻擊面映射（Attack Surface Map）

生成攻擊面映射圖，顯示：

```
Attack Surface:
  ├── Entry Points
  │   ├── GET /api/users/:id          → IDOR risk (user enumeration)
  │   ├── POST /api/auth/login        → Brute force, credential stuffing
  │   ├── POST /api/upload            → File upload, path traversal
  │   ├── WebSocket /ws               → Auth bypass, injection
  │   └── Webhook /api/webhooks/*     → Signature verification
  ├── Data Flows
  │   ├── User input → DB query       → Injection risk
  │   ├── JWT → route handler          → Token validation
  │   └── File upload → storage        → Malicious file execution
  └── Abuse Paths
      ├── Rate limit bypass → account takeover
      ├── IDOR chain → data exfiltration
      └── SSRF → internal service access
```

### 步驟六：基準線（Baseline）

在迴圈開始前計算現有安全問題的數量：
- 執行任何現有的安全靜態分析工具（`npm audit`、`eslint-plugin-security`、`bandit` 等）
- 計算問題數量作為基準線指標
- 在結果日誌中記錄為迭代 #0

## 安全迴圈（The Security Loop）

### 迭代協議（Iteration Protocol）

每次迭代遵循 autoresearch 模式，但針對安全性調整：

#### 第一階段：審查（Review）— 選擇攻擊向量

選擇下一個待測向量的優先順序：

1. **尚未測試的關鍵 STRIDE 威脅**
2. **尚未涵蓋的 OWASP Top 10 類別**
3. **攻擊面映射中的高嚴重性攻擊路徑**
4. **依賴套件漏洞（供應鏈）**
5. **設定弱點**（headers、CORS、CSP）
6. **業務邏輯缺陷**（競態條件、狀態操控）
7. **資訊洩露**（錯誤處理、除錯模式）

在結果日誌中追蹤涵蓋範圍。目標是達到全面覆蓋。

#### 第二階段：分析（Analyze）— 深度挖掘

針對選定的向量：
1. 讀取所有相關程式碼檔案
2. 追蹤從入口點到資料儲存的資料流
3. 識別缺少的驗證、清理或存取檢查
4. 尋找已知的漏洞模式

#### 第三階段：驗證（Validate）— 構建證明

對每個潛在發現，構建證明：

```
Finding Proof Structure:
  ├── Vulnerable code location (file:line)
  ├── Attack scenario (step-by-step)
  ├── Input that triggers the vulnerability
  ├── Expected vs actual behavior
  ├── Impact assessment
  └── Confidence level (Confirmed / Likely / Possible)
```

**驗證規則（Validation Rules）：**
- **Confirmed（確認）** — 程式碼路徑明確允許攻擊，沒有防護（Guard）存在
- **Likely（可能）** — 防護存在但可被繞過或不完整
- **Possible（理論上）** — 理論風險，取決於設定或執行時條件

不得在沒有支持性程式碼證據的情況下回報發現。

#### 第四階段：分類（Classify）

指派嚴重性與類別：

**嚴重性（CVSS 啟發式）：**

| 嚴重性 | 判斷標準 |
|--------|----------|
| **Critical（極高）** | RCE、身份驗證繞過、SQL 注入、資料洩漏、管理員接管 |
| **High（高）** | XSS（儲存型）、SSRF、權限提升、大量資料暴露 |
| **Medium（中）** | CSRF、開放重導向、資訊洩露、缺少速率限制 |
| **Low（低）** | 缺少 headers、冗長錯誤訊息、弱 session 設定 |
| **Info（資訊）** | 最佳實踐建議、強化建議 |

**OWASP Top 10（2021）映射：**

| ID | 類別 |
|----|------|
| A01 | Broken Access Control（存取控制失效） |
| A02 | Cryptographic Failures（加密失效） |
| A03 | Injection（注入） |
| A04 | Insecure Design（不安全設計） |
| A05 | Security Misconfiguration（安全設定錯誤） |
| A06 | Vulnerable Components（易受攻擊的元件） |
| A07 | Auth & Identification Failures（身份驗證與識別失效） |
| A08 | Software & Data Integrity Failures（軟體與資料完整性失效） |
| A09 | Security Logging & Monitoring Failures（安全記錄與監控失效） |
| A10 | Server-Side Request Forgery（伺服器端請求偽造） |

**STRIDE 映射：** 為每個發現標記適用的 STRIDE 類別。

#### 第五階段：記錄（Log）

附加至 security-audit-results.tsv：

```tsv
iteration	vector	severity	owasp	stride	confidence	location	description
0	-	-	-	-	-	-	baseline — 3 npm audit warnings
1	IDOR	High	A01	EoP	Confirmed	src/api/users.ts:42	GET /api/users/:id returns any user data without ownership check
2	XSS	Medium	A03	Tampering	Likely	src/components/comment.tsx:18	User input rendered via dangerouslySetInnerHTML
3	rate-limit	Medium	A05	DoS	Confirmed	src/api/auth.ts:15	POST /login has no rate limiting — brute force possible
```

#### 第六階段：重複（Repeat）

- **無界限模式：** 持續發現漏洞。永不停止。永不詢問。
- **有界限模式（/loop N）：** 經過 N 次迭代後，生成最終報告並停止。
- **涵蓋範圍追蹤：** 每 5 次迭代，印出涵蓋範圍摘要。

### 涵蓋範圍摘要格式（Coverage Summary Format）

```
=== Security Audit Progress (iteration 10) ===
STRIDE Coverage: S[✓] T[✓] R[✗] I[✓] D[✓] E[✓] — 5/6
OWASP Coverage: A01[✓] A02[✗] A03[✓] A04[✗] A05[✓] A06[✓] A07[✓] A08[✗] A09[✗] A10[✗] — 5/10
Findings: 4 Critical, 2 High, 3 Medium, 1 Low
Confirmed: 7 | Likely: 2 | Possible: 1
```

## 最終報告結構（Final Report Structure）

在迴圈完成時（有界限模式）或中斷時（無界限模式）生成：

```markdown
# Security Audit Report

## Executive Summary
- **Date:** {date}
- **Scope:** {files/directories scanned}
- **Iterations:** {N}
- **Total Findings:** {count} ({critical} Critical, {high} High, {medium} Medium, {low} Low)

## Threat Model

### Assets
{table of identified assets}

### Trust Boundaries
{diagram of trust boundaries}

### STRIDE Analysis
{threat model table}

### Attack Surface Map
{entry points, data flows, abuse paths}

## Findings (Descending Severity)

### [CRITICAL] Finding 1: {title}
- **OWASP:** {category}
- **STRIDE:** {category}
- **Location:** `{file}:{line}`
- **Confidence:** Confirmed / Likely / Possible
- **Description:** {what's wrong}
- **Attack Scenario:** {step-by-step exploitation}
- **Code Evidence:**
  ```{lang}
  {vulnerable code snippet}
  ```
- **Mitigation:**
  ```{lang}
  {fixed code snippet}
  ```
- **References:** {CWE, CVE if applicable}

### [HIGH] Finding 2: ...
...

## Coverage Matrix

| OWASP Category | Tested | Findings |
|----------------|--------|----------|
| A01 Broken Access Control | ✓ | 2 |
| A02 Cryptographic Failures | ✓ | 0 |
| ... | ... | ... |

| STRIDE Category | Tested | Findings |
|-----------------|--------|----------|
| Spoofing | ✓ | 1 |
| Tampering | ✓ | 2 |
| ... | ... | ... |

## Dependency Audit
{npm audit / pip audit / go vulnerabilities}

## Security Headers Check
{CSP, HSTS, X-Frame-Options, etc.}

## Recommendations (Priority Order)
1. {Critical fix 1}
2. {Critical fix 2}
...

## Iteration Log
{full TSV content}
```

## OWASP 檢查參考（OWASP Checks Reference）

各 OWASP 類別的詳細檢查項目：

### A01 — Broken Access Control（存取控制失效）
- [ ] 所有參數化路由（`:id`、`:slug`）的 IDOR 檢查
- [ ] 受保護路由缺少授權中介軟體（middleware）
- [ ] 水平權限提升（用戶 A 存取用戶 B 的資料）
- [ ] 垂直權限提升（普通用戶存取管理員功能）
- [ ] 檔案操作中的目錄穿越（Directory traversal）
- [ ] CORS 設定錯誤允許未授權來源
- [ ] 缺少函式層級的存取控制

### A02 — Cryptographic Failures（加密失效）
- [ ] 明文儲存敏感資料（密碼、token、PII）
- [ ] 弱雜湊演算法（用於密碼的 MD5、SHA1）
- [ ] 原始碼中的硬編碼密鑰（secrets）/API keys
- [ ] 缺少靜態或傳輸中的加密
- [ ] 安全 token 使用弱亂數生成
- [ ] 暴露 .env 檔案或含有密鑰的設定檔

### A03 — Injection（注入）
- [ ] 資料庫查詢中的 SQL/NoSQL 注入
- [ ] Shell 執行中的命令注入（exec、spawn）
- [ ] XSS（儲存型、反射型、DOM 型）
- [ ] 模板注入（SSTI）
- [ ] LDAP 注入
- [ ] 檔案操作中的路徑注入
- [ ] Header 注入（CRLF）

### A04 — Insecure Design（不安全設計）
- [ ] 敏感端點缺少速率限制
- [ ] 登入失敗後無帳號鎖定機制
- [ ] 可預測的資源識別符
- [ ] 關鍵操作中的競態條件（Race conditions）
- [ ] 狀態改變操作缺少 CSRF 防護
- [ ] 設計上的不安全直接物件參考

### A05 — Security Misconfiguration（安全設定錯誤）
- [ ] 生產環境啟用除錯模式
- [ ] 預設憑證或管理頁面暴露
- [ ] 冗長錯誤訊息暴露內部資訊
- [ ] 缺少安全 headers（CSP、HSTS、X-Content-Type-Options）
- [ ] 啟用不必要的 HTTP 方法
- [ ] 啟用目錄列表（Directory listing）
- [ ] 錯誤回應中包含 stack traces

### A06 — Vulnerable and Outdated Components（易受攻擊的過時元件）
- [ ] 依賴套件中的已知 CVE（npm audit、pip audit）
- [ ] 有安全修補程式可用的過時框架
- [ ] 無人維護的依賴套件
- [ ] 具有已知 prototype pollution 的依賴套件

### A07 — Identification and Authentication Failures（身份驗證與識別失效）
- [ ] 弱密碼策略
- [ ] 管理員缺少多因素驗證（MFA）
- [ ] Session fixation 漏洞
- [ ] JWT 漏洞（none 演算法、弱密鑰、無過期時間）
- [ ] 不安全的密碼重置流程
- [ ] 登出或密碼更改後缺少 session 失效機制

### A08 — Software and Data Integrity Failures（軟體與資料完整性失效）
- [ ] CI/CD 管線缺少完整性檢查
- [ ] 未簽署或未驗證的更新/依賴套件
- [ ] 不安全的反序列化（Insecure deserialization）
- [ ] 外部腳本缺少 CSP 或 SRI
- [ ] 未簽署的 webhooks / API callbacks

### A09 — Security Logging and Monitoring Failures（安全記錄與監控失效）
- [ ] 安全事件缺少稽核日誌
- [ ] 未記錄失敗的身份驗證嘗試
- [ ] 日誌中包含敏感資料（密碼、token）
- [ ] 對可疑活動缺少警報機制
- [ ] 日誌注入（Log injection）漏洞

### A10 — Server-Side Request Forgery（SSRF，伺服器端請求偽造）
- [ ] 伺服器端請求中未驗證的 URL
- [ ] DNS rebinding 漏洞
- [ ] 外部服務呼叫缺少許可清單（allowlist）
- [ ] 代理/重導向端點沒有驗證

## 紅隊對抗視角（Red-Team Adversarial Lenses）

改編自 plan 紅隊工作流程，適用於安全情境：

### 安全攻擊者（Security Adversary）— 主要視角
**思維方式：** 「我是一個嘗試入侵此系統的駭客」
- 關注點：身份驗證繞過、注入、資料暴露、權限提升
- 方法：追蹤每個輸入到其最終去處，找出缺少的防護（Guard）
- 優先級：可利用的發現優先於理論風險

### 供應鏈攻擊者（Supply Chain Attacker）
**思維方式：** 「我正在破壞依賴套件或建置管線」
- 關注點：依賴套件漏洞、CI/CD 弱點、未簽署的製品
- 方法：稽核依賴樹、檢查 typosquatting、驗證完整性
- 優先級：具有已知 CVE 的依賴套件、建置管線存取

### 內部威脅（Insider Threat）
**思維方式：** 「我是惡意員工或被入侵的帳號」
- 關注點：權限提升、資料外洩、存取控制漏洞
- 方法：檢查低權限用戶能存取什麼，找出橫向移動路徑
- 優先級：管理員繞過、批量資料匯出、缺少稽核追蹤

### 基礎設施攻擊者（Infrastructure Attacker）
**思維方式：** 「我正在攻擊部署環境，而非程式碼」
- 關注點：容器逃逸、暴露的服務、網路分段
- 方法：檢查 Docker 設定、K8s manifests、暴露的連接埠、環境變數
- 優先級：環境中的密鑰、過度寬鬆的設定

## Strix 啟發的模式（Strix-Inspired Patterns）

從 Strix（AI 驅動的安全測試平台）學習而來：

### 概念驗證（Proof-of-Concept）驗證
永遠不在沒有證明的情況下回報發現。對每個漏洞：
1. 識別確切的程式碼路徑
2. 構建具體的利用輸入
3. 追蹤漏洞的執行過程
4. 顯示影響（洩漏的資料、取得的存取權限等）

### 多代理攻擊協作（Multi-Agent Attack Collaboration）
使用 `/loop` 時，每次迭代應基於先前的發現：
- 迭代 1 發現開放端點 → 迭代 2 與 IDOR 串連
- 迭代 3 發現缺少速率限制 → 迭代 4 測試暴力攻擊可行性
- 發現相互疊加。每次迭代讀取過去的發現以尋找串連機會。

### 動態分析驗證（Dynamic Analysis Verification）
在可能的情況下，建議或構建驗證指令：
```bash
# Test for missing rate limiting
for i in {1..100}; do curl -s -o /dev/null -w "%{http_code}" https://app/api/login; done

# Test for IDOR
curl -H "Authorization: Bearer USER_A_TOKEN" https://app/api/users/USER_B_ID

# Test for XSS
curl https://app/search?q=%3Cscript%3Ealert(1)%3C/script%3E
```

### 全面漏洞類別（Comprehensive Vulnerability Categories，源自 Strix）
- **Access Control（存取控制）** — IDOR、權限提升、身份驗證繞過
- **Injection Attacks（注入攻擊）** — SQL、NoSQL、命令注入
- **Server-Side（伺服器端）** — SSRF、XXE、反序列化缺陷
- **Client-Side（客戶端）** — XSS、prototype pollution、DOM 漏洞
- **Business Logic（業務邏輯）** — 競態條件、工作流程操控
- **Authentication（身份驗證）** — JWT 漏洞、session 管理
- **Infrastructure（基礎設施）** — 設定錯誤、暴露的服務

## 迴圈指標（Metric for the Loop）

安全稽核使用**涵蓋範圍 + 發現數量**的複合指標：

```
metric = (owasp_categories_tested / 10) * 50 + (stride_categories_tested / 6) * 30 + min(finding_count, 20)
```

- **方向：** 越高越好（更多涵蓋範圍 + 更多發現 = 更徹底）
- **理論最大值：** 50 + 30 + 20 = 100
- **基準線：** 0（尚未測試任何項目）

這促使迴圈在深入研究任何單一類別之前，先涵蓋所有類別。

## 標誌與模式（Flags & Modes）

### `--diff` — 差異模式（Delta Mode）（v1.0.3）

僅稽核自上次稽核以來更改的檔案。讀取最近的 `security/` 子資料夾以確定已測試的內容。

```
/autoresearch:security --diff
```

**運作方式：**

1. 依資料夾名稱中的時間戳記找到最新的 `security/*/overview.md`
2. 從該資料夾的 `findings.md` 解析先前測試的檔案
3. 執行 `git diff --name-only {last_audit_commit}..HEAD` 找出更改的檔案
4. 將當前稽核範圍限定為僅有那些更改的檔案
5. 在最終報告中，將發現標記為：
   - **New（新增）** — 在更改的檔案中找到，且不在先前的稽核中
   - **Fixed（已修復）** — 曾在先前稽核中，在更改的程式碼中不再存在
   - **Recurring（重複出現）** — 仍來自先前稽核（未更改）

**差異報告新增內容：**

overview.md 新增 `## Delta Summary` 區段：

```markdown
## Delta Summary (vs {previous_audit_folder})

| Status | Count | Details |
|--------|-------|---------|
| New findings | 3 | Found in changed files |
| Fixed | 2 | No longer present |
| Recurring | 5 | Still present from last audit |
| Files changed | 12 | Since last audit |
| Files audited | 8 | (security-relevant subset) |
```

若不存在先前的稽核資料夾，`--diff` 會回退到完整稽核並顯示警告。

### `--fail-on` — 嚴重性閾值閘門（Severity Threshold Gate）（v1.0.3）

若發現結果達到或超過嚴重性閾值，以非零代碼結束。專為 CI/CD 阻斷而設計。

```
/autoresearch:security --fail-on critical
/autoresearch:security --fail-on high
/autoresearch:security --fail-on medium
```

| 標誌值 | 阻斷條件 |
|--------|----------|
| `critical` | 任何 Critical 發現 |
| `high` | 任何 Critical 或 High 發現 |
| `medium` | 任何 Critical、High 或 Medium 發現 |

**行為：**
- 正常執行完整稽核
- 生成報告後，根據閾值檢查發現結果
- 若達到閾值：印出 `SECURITY GATE FAILED: {N} findings at {severity} or above` 並以非零代碼結束
- 若未達閾值：印出 `SECURITY GATE PASSED` 並以 0 結束

**CI/CD 使用方式：**
```bash
# In GitHub Actions or CI scripts
/loop 10 /autoresearch:security --fail-on critical
# Exit code 1 if any Critical findings → blocks the pipeline
```

### `--fix` — 自動修復模式（Auto-Remediation Mode）（v1.0.3）

完成稽核後，切換到標準的 autoresearch 修改→驗證迴圈來修復已確認的發現。以安全稽核報告作為目標。

```
/autoresearch:security --fix
/loop 10 /autoresearch:security --fix
```

**運作方式：**

1. 執行完整的安全稽核（設置 + 迴圈 + 報告）
2. 篩選發現結果：僅限**已確認（Confirmed）**且嚴重性為 **Critical** 和 **High** 的發現
3. 切換到標準 autoresearch 迴圈：
   - **目標：** 修復所有已確認的 Critical 和 High 發現
   - **範圍：** 發現結果中參考的檔案（file:line 位置）
   - **指標：** 剩餘已確認發現的數量（越低越好）
   - **驗證：** 重新執行找到每個漏洞的安全檢查
4. 對每次修復迭代：
   - 選取嚴重性最高的未修復發現
   - 套用 `recommendations.md` 中的緩解措施
   - 提交修復
   - 重新驗證：漏洞是否仍然存在？
   - 若已修復 → 保留 commit，在報告中將發現標記為「Fixed」
   - 若仍有漏洞 → 還原，嘗試不同方法
   - 若引入新發現 → 立即還原

**修復報告新增內容：**

修復完成後，更新稽核資料夾：
- `findings.md` 新增 `Status` 欄：`Open` / `Fixed` / `Fix attempted`
- `recommendations.md` 在已套用的修復上新增勾選標記
- 新檔案：`fix-log.md`，包含迭代詳情

**安全規則：**
- 絕不自動修復 Low 或 Info 發現（太主觀）
- 絕不修改測試檔案（修復不得破壞現有測試）
- 每次修復後執行現有測試 — 若任何測試失敗則還原
- 每個發現最多嘗試 3 次修復，之後跳過
- 使用者可結合 `--fail-on` 進行閘門修復：先修復，再設閘

### 組合標誌（Combining Flags）

標誌可以組合使用：

```
# Delta audit + auto-fix critical/high + block on remaining criticals
/loop 15 /autoresearch:security --diff --fix --fail-on critical

# Quick delta check in CI
/loop 5 /autoresearch:security --diff --fail-on high
```

**組合時的執行順序：**
1. `--diff` 縮小範圍
2. 安全稽核執行（若使用 `--diff` 則範圍縮小）
3. `--fix` 對已確認的 Critical/High 執行修復迴圈
4. `--fail-on` 根據閾值檢查剩餘（未修復）的發現

### CI/CD GitHub Action 模板

當 `/autoresearch:security` 偵測到 `.github/workflows/` 目錄時，提供生成安全工作流程的選項：

```
AskUserQuestion:
  question: "I see you use GitHub Actions. Want me to generate a security audit workflow?"
  header: "CI/CD"
  options:
    - label: "Yes, generate it (Recommended)"
      description: "Creates .github/workflows/security-audit.yml"
    - label: "No, skip"
      description: "Continue without CI/CD setup"
```

**生成的工作流程：** `.github/workflows/security-audit.yml`

```yaml
name: Security Audit

on:
  pull_request:
    branches: [main, master]
  schedule:
    - cron: '0 2 * * 1'  # Weekly Monday 2am UTC

permissions:
  contents: read
  pull-requests: write

jobs:
  security-audit:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for delta mode

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Install Autoresearch Skill
        run: |
          git clone https://github.com/uditgoenka/autoresearch.git /tmp/autoresearch
          cp -r /tmp/autoresearch/skills/autoresearch .claude/skills/autoresearch

      - name: Run Security Audit
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          # Delta mode on PRs, full audit on schedule
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            claude -p "/loop 5 /autoresearch:security --diff --fail-on critical"
          else
            claude -p "/loop 15 /autoresearch:security --fail-on high"
          fi

      - name: Upload Security Report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: security-audit-report
          path: security/
          retention-days: 90

      - name: Comment PR with Summary
        if: github.event_name == 'pull_request' && always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const glob = require('glob');
            const overviews = glob.sync('security/*/overview.md');
            if (overviews.length > 0) {
              const latest = overviews.sort().pop();
              const content = fs.readFileSync(latest, 'utf-8');
              const summary = content.split('## Summary')[1]?.split('##')[0] || 'See full report in artifacts.';
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: `## 🔒 Security Audit Results\n\n${summary}\n\n> Full report available in workflow artifacts.`
              });
            }
```

**模板僅生成一次** — 初始建立後，即為使用者可自訂的檔案。

### 歷史比較（Historical Comparison）

當 `security/` 中存在先前的稽核結果時，當前執行會自動生成比較區段。

**偵測方式：** 設置時，依日期排序掃描 `security/` 中現有的稽核資料夾。

**比較邏輯：**

```
For each finding in current audit:
  Search previous audit findings.md for same location (file:line) or same description
  If found → mark as "Recurring"
  If not found → mark as "New"

For each finding in previous audit:
  Search current audit findings for same location or description
  If not found → mark as "Fixed"
```

**overview.md 的輸出：**

```markdown
## Historical Comparison

**Previous audit:** security/260310-1430-stride-owasp-full-audit/ (5 days ago)

### Trend
| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Critical | 3 | 1 | ↓ -2 (improved) |
| High | 4 | 5 | ↑ +1 (regressed) |
| Medium | 2 | 3 | ↑ +1 |
| Total | 9 | 9 | → 0 |
| OWASP coverage | 6/10 | 8/10 | ↑ +2 |
| STRIDE coverage | 4/6 | 5/6 | ↑ +1 |

### Finding Status
| Status | Count | Details |
|--------|-------|---------|
| Fixed since last audit | 4 | JWT algo, CORS, 2 XSS |
| New findings | 4 | SSRF, rate limit, 2 IDOR |
| Recurring (unfixed) | 5 | See findings.md |

### Regression Alert
⚠️ 4 new findings detected since last audit. Review [findings.md](./findings.md) for details.
```

**findings.md 新增內容：**

每個發現附加 `History` 標籤：
- `🆕 New（新增）` — 首次偵測到
- `🔄 Recurring（重複出現）` — 先前稽核中也有
- `✅ Fixed（已修復）` （僅在先前稽核的情境中）— 不再存在

## 錯誤恢復（Error Recovery）

| 錯誤 | 恢復方式 |
|------|----------|
| 無法確定技術棧 | 詢問使用者框架/語言 |
| 未找到 API 路由 | 掃描所有具有類 HTTP 模式的匯出函式 |
| 依賴套件稽核失敗 | 跳過，在報告中記錄，繼續程式碼分析 |
| 程式碼太大超出上下文 | 專注於符合攻擊面的檔案（API、auth、DB） |
| 懷疑為誤報（False positive） | 標記為「Possible」信心度，附上說明 |

## 反模式（Anti-Patterns）

- **不得在沒有程式碼證據的情況下回報理論風險** — 每個發現都需要 file:line 參考
- **不得跳過類別** — 迴圈應以 100% OWASP + STRIDE 涵蓋為目標
- **不得自動修復漏洞** — 僅回報，由使用者決定修復方式
- **不得針對生產環境進行測試** — 靜態分析程式碼，建議動態測試方式
- **不得重複回報相同發現** — 記錄前先檢查結果日誌中的重複項目
- **不得以數量換品質** — 5 個已確認的 critical 問題 > 50 個理論上的 low 問題

## 報告輸出 — 結構化資料夾（Report Output — Structured Folder）

每次執行 `/autoresearch:security` 都會在專案根目錄的 `security/` 目錄內建立專用資料夾。

### 資料夾結構（Folder Structure）

```
{project_root}/
└── security/
    ├── 260315-0945-stride-owasp-full-audit/
    │   ├── overview.md                    ← 執行摘要 + 所有報告的連結
    │   ├── threat-model.md                ← STRIDE 威脅模型（資產、邊界、威脅）
    │   ├── attack-surface-map.md          ← 入口點、資料流、濫用路徑
    │   ├── findings.md                    ← 按嚴重性排序的所有發現（Critical → Low）
    │   ├── owasp-coverage.md              ← OWASP Top 10 涵蓋矩陣 + 各類別結果
    │   ├── dependency-audit.md            ← npm audit / pip audit / go vuln 結果
    │   ├── recommendations.md             ← 附有程式碼片段的優先緩解措施
    │   └── security-audit-results.tsv     ← 迭代日誌（每個已測試的向量）
    │
    ├── 260320-1430-auth-api-focused-audit/
    │   ├── overview.md
    │   ├── threat-model.md
    │   ├── ...
    │   └── security-audit-results.tsv
    │
    └── ...                                ← 每次稽核執行一個子資料夾
```

### 資料夾命名慣例（Folder Naming Convention）

```
security/{YYMMDD}-{HHMM}-{audit-type-slug}/
```

| 組成部分 | 來源 | 範例 |
|----------|------|------|
| `YYMMDD` | 當前日期 | `260315` |
| `HHMM` | 當前時間（24 小時制） | `0945` |
| `audit-type-slug` | 從範圍/焦點推斷 | `stride-owasp-full-audit` |

**Slug 生成規則：**
- 未指定範圍/焦點 → `stride-owasp-full-audit`
- 範圍與 auth 相關 → `auth-authorization-audit`
- 範圍與 API 相關 → `api-security-audit`
- 範圍與基礎設施相關 → `infrastructure-security-audit`
- 使用者提供焦點字串 → 轉為 kebab-case（例如「payment flow」→ `payment-flow-audit`）

### 檔案說明（File Descriptions）

#### overview.md
```markdown
# Security Audit — {audit-type}

**Date:** {YYYY-MM-DD HH:MM}
**Scope:** {files/directories}
**Focus:** {user-provided focus or "comprehensive"}
**Iterations:** {N completed} ({bounded or unlimited})
**Duration:** {approximate time}

## Summary

- **Total Findings:** {count}
  - Critical: {n} | High: {n} | Medium: {n} | Low: {n} | Info: {n}
- **STRIDE Coverage:** {n}/6 categories tested
- **OWASP Coverage:** {n}/10 categories tested
- **Confirmed:** {n} | Likely: {n} | Possible: {n}

## Top 3 Critical Findings

1. [{title}]({findings.md#finding-1}) — {one-line description}
2. [{title}]({findings.md#finding-2}) — {one-line description}
3. [{title}]({findings.md#finding-3}) — {one-line description}

## Files in This Report

- [Threat Model](./threat-model.md) — STRIDE analysis, assets, trust boundaries
- [Attack Surface Map](./attack-surface-map.md) — entry points, data flows, abuse paths
- [Findings](./findings.md) — all findings ranked by severity
- [OWASP Coverage](./owasp-coverage.md) — per-category test results
- [Dependency Audit](./dependency-audit.md) — known CVEs in dependencies
- [Recommendations](./recommendations.md) — prioritized mitigations
- [Iteration Log](./security-audit-results.tsv) — raw data from every iteration
```

### 建立協議（Creation Protocol）

1. 在 `/autoresearch:security` **開始時**，建立資料夾：
   ```
   mkdir -p security/{YYMMDD}-{HHMM}-{slug}
   ```

2. 在**設置階段**，寫入：
   - `threat-model.md`（完成 STRIDE 分析後）
   - `attack-surface-map.md`（完成攻擊面映射後）
   - `security-audit-results.tsv`（標頭列 + 基準線迭代）

3. 在**迴圈**期間，附加至：
   - `security-audit-results.tsv`（每次迭代後）

4. 在**完成時**（有界限迴圈結束或中斷），寫入：
   - `findings.md`（所有發現彙整）
   - `owasp-coverage.md`（涵蓋矩陣）
   - `dependency-audit.md`（工具輸出）
   - `recommendations.md`（優先緩解措施）
   - `overview.md`（執行摘要 — **最後**撰寫，連結至所有其他檔案）

5. 向使用者印出資料夾路徑：
   ```
   Security audit complete. Report saved to:
   security/260315-0945-stride-owasp-full-audit/overview.md
   ```

### Gitignore

新增至 `.gitignore`（若尚未存在）：
```
security-audit-results.tsv
```

`.tsv` 迭代日誌是工作用檔案。`.md` 報告則應提交並共享。
