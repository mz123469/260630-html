# AI 協作紀錄（ai_log_step1）

- 姓名：利丞鑫
- 使用的 AI 工具：Claude（Claude Code）
- 專案：AI 分流系統（A3-8 改造為 TW Core／聯測松版本），分支 `twcore-connectathon`
- 說明：本紀錄依 11/03 講義的五節格式整理（2026-11-03 更新為一般使用版設計）；內容取自同資料夾的 `版本與決策異動紀錄.md`（決策 D1–D25）、`白帽攻擊紀錄-第二輪-聯測松標準.md`、`TWCore-1.0.0-自評表.md`。本專案已完成講義的第五階段，所以「第一階段只回固定分數」的步驟不重做。

## ① 設計

| 圖 | 檔案 | 內容 |
|---|---|---|
| 架構圖（練習 1） | `design/architecture.png`（畫布版，講義三欄畫法）、`architecture.svg`、`architecture.mmd`（文字版） | 一般使用版 5 個節點、8 條連線：病人端、醫師端、後端服務、Gemini、FHIR Server |
| 架構圖（聯測版） | `design/architecture-connectathon.png`、`.mmd`；完整版 `architecture-full.png` | 課程版 6 節點（病人頁、醫師頁、/api/triage/analyze、CDS 服務、Gemini、FHIR）；完整版多 /api/twcore、OAuth、Keycloak |
| 細部流程圖（練習 2） | `design/flowchart_detail.png`、`.mmd` | 一般使用版「病人端送出基本資料與主訴」：限流 → 兩段輸入檢查 → 查 Patient（有就沿用、沒有就 $validate 後建立）→ 去識別化 → AI → 安全網 → 寫 Encounter→Condition→Observation；每個判斷的「否」都寫狀態碼（429／400／422／502）。聯測版 `flowchart_detail-connectathon` |
| 序列圖（練習 3） | `design/sequence.png`、`.mmd`、四欄位在 `sequence.md` | 一般使用版 26 步：病人端寫入到回覆，再接醫師端開啟病歷、卡片、接受建議建 Task。聯測版 `sequence-connectathon`（15 步） |
| 功能版流程圖／序列圖 | `design/flowchart_system.png`、`sequence_system.png`（各有 .mmd） | 照使用順序 ①建立資料→②病人回報→③醫師查看→接受建議，錯誤收成一格；序列圖含一寫一讀與轉介／回診 |

練習 3 的四個欄位（寫入時要決定的）：

| 欄位 | 本專案的決定 |
|---|---|
| 存放位置 | FHIR Server（twcore.hapi.fhir.tw）上的 Observation，Profile `Observation-screening-assessment-twcore` |
| 資料代碼 | 自訂 CodeSystem `http://example.org/fhir/ai-triage/CodeSystem/ai-triage`，代碼 `urgency-score`（不用 LOINC 80615-8，語意不符） |
| 數值欄位 | `valueQuantity.value` 1–10 整數，單位 UCUM `{score}`；`component` 放情緒與需人工介入 |
| 識別碼格式 | Patient id 英數、連字號、句點，1–64 字（FHIR id 規則）；身分證 1 字母＋9 數字只放在 identifier |

## ② 提問

寫程式前向 AI 提的主要問題與結論：

1. 「老師範例用 LOINC 80615-8 當分數代碼，聯測對方會怎麼解讀？」→ 80615-8 是「Recommended follow-up」，語意不符，改自訂 CodeSystem（決策 D2）。
2. 「AI 分流的 Observation 該用 TW Core 哪個 Profile？」→ 篩檢與評估 Profile，category 必須是 survey（D3）。
3. 「FHIR Server 上已經有同一筆時要怎麼處理？」→ 先問使用者是否更新，沒確認就回 409，不默默覆蓋（D7）；PractitionerRole 例外，直接沿用（D8）。
4. 「什麼叫建立成功？」→ 2xx 還不夠，body 要是同型別且 id 合法；壞伺服器回 HTML 時原本會顯示 ✓（D11）。
5. 「聯測松 Track 1 Level 1 要哪些資源？」→ Patient、Organization、Practitioner、PractitionerRole、Encounter、Condition；一次病人回報寫 Encounter→Condition→Observation 三筆互相參照（D14）。
6. 「聯測主機怎麼認證？」→ 所有賽道 Level I 要 OAuth2 client credentials 向 Keycloak 取 token（D17）。

## ③ 檢查

| 檢查 | 做法 | 結果 |
|---|---|---|
| 實作方式先說明再寫程式 | 每個功能先列會改哪些檔案與原因（`版本與決策異動紀錄.md` 第 2 節） | 20 條決策都有原因與相關檔案 |
| 錯誤輸入 | 聯測順序 30 項（空白、生日未來、身分證格式、重複送出、病人被清掉、重按建議只沿用…）＋一般使用 19 項（沒填就送、偷帶 id、冒用身分證、冒名登入、回診時間過去…） | 30／30、19／19 通過 |
| 白帽攻擊 | 第一輪 30 項、第二輪 F–K 共 40 項＋壞伺服器 15 種、第三輪癱瘓與個資、第四輪一般使用模式 N／O／P | 第二輪修 12 處、第三輪修 3 處、第四輪修 1 處（冒名登入），修後全部正確回報 |
| 資源格式 | HL7 validator_cli 對 TW Core 1.0.0 | 10 個檔（含 Task、Appointment）Error 0，1 則 Warning（`{score}`） |
| 核對表（接上資料儲存後） | 存的分數＝畫面分數；讀回的 identifier、name、gender、birthDate、managingOrganization 一致 | 通過（自評表 C 區） |

## ④ 執行結果

- 建立：Organization／Practitioner／PractitionerRole／Patient 各回 HTTP 201（已存在回 409，確認後 200），畫面顯示狀態碼與 id。
- 寫入：`POST /api/triage/analyze` 回 200，body 有 `urgency_score`、`fhir_reference`（Observation id）、`encounter_id`、`condition_id`。
- 讀取：`POST /cds-services/patient-triage-service` 回卡片；8 分以上 critical、5–7 warning、其他 info。
- 公開伺服器實測：`notes/實測紀錄-2026-10-31.md`（三輪）；證據檔 `Proj/AI-Patient-Triage-System/logs/fhir-exchange.jsonl`。
- 聯測匯入（v14）：`POST /api/fhirfox/upload` 範例 12 筆 → validator_cli TW Core 1.0.0 Error 0 → transaction 201 × 12；圖 `design/flowchart_detail-import`、`sequence-import`；AI 協作時先找到官方 FHIRfox 原始碼，改用官方 CSV 規則而不是自己定格式（D29）。
- 截圖：`screenshots/app/` 共 40 張（23–30 一般使用、31–38 聯測匯入）；課堂 12 張 `screenshots/step0_*`、`warmup`、`step1–7`。

## ⑤ 程式說明（挑三行）

| 程式 | 檔案 | 用途 | 移除後的影響 |
|---|---|---|---|
| `if (!patient) return res.status(patient === null ? 404 : 502).json(...)` | `routes/triage.js` | 呼叫 AI 之前先確認病人存在，且伺服器回的真的是 Patient | 病人不存在也會花 AI 額度，壞伺服器回 HTML 會被當成病人存在 |
| `const created = (r, type) => r.data?.resourceType === type && tw.FHIR_ID.test(String(r.data.id \|\| ''))` | `routes/twcore.js` | 定義「建立成功」：回來的要是同型別、id 合法的資源 | 伺服器回 HTML、空 body、Bundle 時畫面會顯示 ✓ 已建立 |
| `token(system, value)`：把搜尋值裡的 `\|`、`,`、`$` 加上反斜線跳脫，再組成 `system\|value` | `services/fhirClient.js` | FHIR 搜尋 token 值的跳脫 | 證書字號含 `\|` 或 `,` 時查重複會查錯，可能建出重複資料 |
