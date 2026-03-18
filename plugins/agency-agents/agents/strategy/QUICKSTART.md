# NEXUS 快速入門指南（NEXUS Quick-Start Guide）

> **5 分鐘內從零到協作多代理人管道。**

---

## 什麼是 NEXUS？

**NEXUS**（專家網路，戰略統一，Network of EXperts, Unified in Strategy）將 The Agency 的 AI 專家轉化為一條協作管道。NEXUS 不是逐一激活代理人然後期望它們能協同工作，而是精確定義誰做什麼、何時做、以及每個步驟的品質如何被驗證。

## 選擇你的模式

| 我想要... | 使用 | 代理人數量 | 時間 |
|----------|-----|---------|------|
| 從頭建構完整產品 | **NEXUS-Full** | 全部 | 12-24 週 |
| 建構功能或 MVP | **NEXUS-Sprint** | 15-25 | 2-6 週 |
| 執行特定任務（修復 bug、活動、稽核） | **NEXUS-Micro** | 5-10 | 1-5 天 |

---

## NEXUS-Full：啟動完整項目

**複製此提示詞以激活完整管道：**

```
Activate Agents Orchestrator in NEXUS-Full mode.

Project: [YOUR PROJECT NAME]
Specification: [DESCRIBE YOUR PROJECT OR LINK TO SPEC]

Execute the complete NEXUS pipeline:
- Phase 0: Discovery (Trend Researcher, Feedback Synthesizer, UX Researcher, Analytics Reporter, Legal Compliance Checker, Tool Evaluator)
- Phase 1: Strategy (Studio Producer, Senior Project Manager, Sprint Prioritizer, UX Architect, Brand Guardian, Backend Architect, Finance Tracker)
- Phase 2: Foundation (DevOps Automator, Frontend Developer, Backend Architect, UX Architect, Infrastructure Maintainer)
- Phase 3: Build (Dev↔QA loops — all engineering + Evidence Collector)
- Phase 4: Harden (Reality Checker, Performance Benchmarker, API Tester, Legal Compliance Checker)
- Phase 5: Launch (Growth Hacker, Content Creator, all marketing agents, DevOps Automator)
- Phase 6: Operate (Analytics Reporter, Infrastructure Maintainer, Support Responder, ongoing)

Quality gates between every phase. Evidence required for all assessments.
Maximum 3 retries per task before escalation.
```

---

## NEXUS-Sprint：建構功能或 MVP

**複製此提示詞：**

```
Activate Agents Orchestrator in NEXUS-Sprint mode.

Feature/MVP: [DESCRIBE WHAT YOU'RE BUILDING]
Timeline: [TARGET WEEKS]
Skip Phase 0 (market already validated).

Sprint team:
- PM: Senior Project Manager, Sprint Prioritizer
- Design: UX Architect, Brand Guardian
- Engineering: Frontend Developer, Backend Architect, DevOps Automator
- QA: Evidence Collector, Reality Checker, API Tester
- Support: Analytics Reporter

Begin at Phase 1 with architecture and sprint planning.
Run Dev↔QA loops for all implementation tasks.
Reality Checker approval required before launch.
```

---

## NEXUS-Micro：執行特定任務

**選擇你的場景並複製提示詞：**

### 修復 Bug
```
Activate Backend Architect to investigate and fix [BUG DESCRIPTION].
After fix, activate API Tester to verify the fix.
Then activate Evidence Collector to confirm no visual regressions.
```

### 執行行銷活動
```
Activate Social Media Strategist as campaign lead for [CAMPAIGN DESCRIPTION].
Team: Content Creator, Twitter Engager, Instagram Curator, Reddit Community Builder.
Brand Guardian reviews all content before publishing.
Analytics Reporter tracks performance daily.
Growth Hacker optimizes channels weekly.
```

### 進行合規稽核
```
Activate Legal Compliance Checker for comprehensive compliance audit.
Scope: [GDPR / CCPA / HIPAA / ALL]
After audit, activate Executive Summary Generator to create stakeholder report.
```

### 調查效能問題
```
Activate Performance Benchmarker to diagnose performance issues.
Scope: [API response times / Page load / Database queries / All]
After diagnosis, activate Infrastructure Maintainer for optimization.
DevOps Automator deploys any infrastructure changes.
```

### 市場研究
```
Activate Trend Researcher for market intelligence on [DOMAIN].
Deliverables: Competitive landscape, market sizing, trend forecast.
After research, activate Executive Summary Generator for executive brief.
```

### 使用者體驗改善
```
Activate UX Researcher to identify usability issues in [FEATURE/PRODUCT].
After research, activate UX Architect to design improvements.
Frontend Developer implements changes.
Evidence Collector verifies improvements.
```

---

## 策略文件

| 文件 | 用途 | 位置 |
|------|------|------|
| **主策略** | 完整 NEXUS 準則 | `strategy/nexus-strategy.md` |
| **第 0 階段劇本** | 發現與情報 | `strategy/playbooks/phase-0-discovery.md` |
| **第 1 階段劇本** | 策略與架構 | `strategy/playbooks/phase-1-strategy.md` |
| **第 2 階段劇本** | 基礎與腳手架 | `strategy/playbooks/phase-2-foundation.md` |
| **第 3 階段劇本** | 建構與迭代 | `strategy/playbooks/phase-3-build.md` |
| **第 4 階段劇本** | 品質與強化 | `strategy/playbooks/phase-4-hardening.md` |
| **第 5 階段劇本** | 發布與成長 | `strategy/playbooks/phase-5-launch.md` |
| **第 6 階段劇本** | 運營與演進 | `strategy/playbooks/phase-6-operate.md` |
| **激活提示詞** | 即用型代理人提示詞 | `strategy/coordination/agent-activation-prompts.md` |
| **交接範本** | 標準化交接格式 | `strategy/coordination/handoff-templates.md` |
| **初創 MVP 操作手冊** | 4-6 週 MVP 建構 | `strategy/runbooks/scenario-startup-mvp.md` |
| **企業功能操作手冊** | 企業功能開發 | `strategy/runbooks/scenario-enterprise-feature.md` |
| **行銷活動操作手冊** | 多渠道活動 | `strategy/runbooks/scenario-marketing-campaign.md` |
| **事件響應操作手冊** | 生產事件處理 | `strategy/runbooks/scenario-incident-response.md` |

---

## 30 秒掌握關鍵概念

1. **品質關卡（Quality Gates）**——沒有以證據為基礎的審批，任何階段都不能推進
2. **開發↔QA 迴圈（Dev↔QA Loop）**——每個任務先建構後測試；通過（PASS）繼續，失敗（FAIL）重試（最多 3 次）
3. **交接（Handoffs）**——代理人之間的結構化上下文傳遞（絕不冷啟動）
4. **現實核查員（Reality Checker）**——最終品質權威；預設為「需要改進（NEEDS WORK）」
5. **代理人協作者（Agents Orchestrator）**——管理整個流程的管道控制器
6. **以證據代替聲明（Evidence Over Claims）**——截圖、測試結果和資料——而非斷言

---

## 代理人一覽

```
ENGINEERING         │ DESIGN              │ MARKETING
Frontend Developer  │ UI Designer         │ Growth Hacker
Backend Architect   │ UX Researcher       │ Content Creator
Mobile App Builder  │ UX Architect        │ Twitter Engager
AI Engineer         │ Brand Guardian      │ TikTok Strategist
DevOps Automator    │ Visual Storyteller  │ Instagram Curator
Rapid Prototyper    │ Whimsy Injector     │ Reddit Community Builder
Senior Developer    │ Image Prompt Eng.   │ App Store Optimizer
                    │                     │ Social Media Strategist
────────────────────┼─────────────────────┼──────────────────────
PRODUCT             │ PROJECT MGMT        │ TESTING
Sprint Prioritizer  │ Studio Producer     │ Evidence Collector
Trend Researcher    │ Project Shepherd    │ Reality Checker
Feedback Synthesizer│ Studio Operations   │ Test Results Analyzer
                    │ Experiment Tracker  │ Performance Benchmarker
                    │ Senior Project Mgr  │ API Tester
                    │                     │ Tool Evaluator
                    │                     │ Workflow Optimizer
────────────────────┼─────────────────────┼──────────────────────
SUPPORT             │ SPATIAL             │ SPECIALIZED
Support Responder   │ XR Interface Arch.  │ Agents Orchestrator
Analytics Reporter  │ macOS Spatial/Metal │ Data Analytics Reporter
Finance Tracker     │ XR Immersive Dev    │ LSP/Index Engineer
Infra Maintainer    │ XR Cockpit Spec.    │ Sales Data Extraction
Legal Compliance    │ visionOS Spatial    │ Data Consolidation
Exec Summary Gen.   │ Terminal Integration│ Report Distribution
```

---

<div align="center">

**選擇模式。遵循劇本。信任管道。**

`strategy/nexus-strategy.md` — 完整準則

</div>
