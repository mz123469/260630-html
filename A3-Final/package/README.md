# Demo｜安裝與操作

這是完成版**示範**，用來對照作業。資料夾總覽見上一層的 [README](../README.md)；這裡只教你把系統跑起來。程式在 `Proj/`。

## 1. 準備

- Node.js：**20.19+** 或 **22.12+**（太舊會出現 `EBADENGINE`）。
- 自己的 **Gemini API Key**；`AI-Patient-Triage-System/.env` 只放在電腦裡，**不要上傳**。
- 公開 FHIR 測試站使用**假病人**。本版預設 TW Core 官方測試伺服器 `https://twcore.hapi.fhir.tw/fhir`（內建 TW Core IG 驗證器），連不上時把後端 `.env` 的 `FHIR_BASE_URL` 暫時換回 `https://hapi.fhir.org/baseR4`。

## 2. 啟動後端與前端

> 最快的方式：macOS 雙擊 `start-mac.command`、Windows 雙擊 `start-windows.bat`，會自動安裝、啟動並打開瀏覽器。完整測試步驟見 [測試指南](測試指南.md)。

在 **`Proj/`** 下面開兩個終端機，分別執行：

**後端（終端機 A）**

```bash
cd AI-Patient-Triage-System
npm install
```

把 `.env.example` 複製成 `.env`，填入 `GEMINI_API_KEY`；再執行：

```bash
node server.js
```

**前端（終端機 B）**

```bash
cd Client
npm install
npm run dev
```

打開 <http://localhost:5173>。後端在 <http://localhost:3000>。

> 換 FHIR Server 只要改後端 `.env` 的 `FHIR_BASE_URL`；醫師頁改成經後端 `/api/twcore/patient/:id` 讀病人，前端不用跟著改。

## 2a. 兩種模式（導覽列左邊切換）

| 模式 | 頁面順序 | 用途 |
|---|---|---|
| **一般使用**（預設） | 病人端 → 醫師端 → 醫師查看 | 像真的在用：病人自己填基本資料與感覺，一次送出（後端自動建或沿用病人）；醫師選機構、填姓名與證書字號登入後，看本機構病人的卡片，回診時間可改 |
| **聯測順序** | ① 建立資料 → ② 病人回報 → ③ 醫師查看 → ④ 匯入 JSON | 照 C 聯測模擬第 21 頁的順序逐一建立資源，每一步顯示 HTTP 狀態碼與 id；第 3、4 節講的是這個模式。④ 是聯測松 Track 1：貼上 FHIRfox Simplified JSON，預覽來源與 FHIR 並排 → 官方驗證器 → 上傳（第 6 節第 6 點） |

兩種模式用同一個後端與同一台 FHIR Server。一般使用的病人端不能指定 Patient id、不能掛名醫師、不會覆蓋既有資料（同身分證只沿用）；醫師端同一證書字號要配同一姓名，否則拒絕登入。醫師端沒有密碼，示範用。

## 3. 先建 TW Core 基礎資源（Organization → Practitioner → PractitionerRole → Patient）

打開 <http://localhost:5173/setup>（導覽列「① 建立資料」）。第一次用：按「**填入範例**」→「**建立**」。

- 左邊填表，右邊「建立結果」會照 C 聯測模擬第 21 頁的順序逐項變成 ✓：AI 分流代碼表（CodeSystem）→ 醫療機構 → 醫事人員 → 醫師職務（PractitionerRole，同醫師同機構只會有一筆，已存在就沿用）→ 病人，每一項都顯示 **HTTP 狀態碼與 resource id**。這五種加上第 4 節的 Encounter、Condition、Observation，就是聯測松 Track 1 **Level 1「基本就醫紀錄」**要的資源。
- **醫療機構用下拉選單選**：機構照 `Organization-hosp-twcore`，代碼只能是 TW Core 官方清單裡的 50 家（`AI-Patient-Triage-System/fhir/organization-codes.json`）。
- 按「建立」會**先一次檢查三種資源的所有欄位**，錯的欄位會變紅，右邊列出錯誤**位置**（例如 `Patient.identifier[0].value`）與內容；全部正確才送出。
- 送出前會先請 FHIR Server 用 Profile 做 `$validate`：有 Error 就不建立；Warning、Information 會一起列出。
- **已經有同一筆**（機構看代碼、醫師看證書字號、病人看身分證）：會顯示「FHIR Server 上已經有同一筆」，按「**更新這筆**」才會修改，按「不要更新」就維持錯誤、不動資料。範例的身分證和證書字號每次隨機產生，避免撞到共用測試伺服器上別人的資料。
- 病人會自動掛上剛建立的機構（`managingOrganization`）與醫師（`generalPractitioner`）。
- 已經有病人（例如 FHIRfox 情境或聯測夥伴建好的）：右欄「已經有病人了？直接使用」輸入 Patient ID。

**查詢**：③ 醫師查看右欄「本機構的病人」會用 `Patient?organization=Organization/{id}` 列出同機構所有病人（自動翻頁），點名字就切換；查指定 ID 的病人就是 ③ 左邊的病人資料（`GET /api/twcore/patient/:id`）。

**後端終端機**：每一次對 FHIR Server 的請求都會印一行，例如 `[FHIR] POST /Patient/$validate?profile=… 200`、`[FHIR] PUT /Patient/patient-tw-xxx 201 → Patient/patient-tw-xxx`。查詢參數的值會遮掉（避免印出身分證），完整內容在 `logs/fhir-exchange.jsonl`。

資源一律照 TW Core IG 1.0.0 的 Profile 組（`services/twcoreResources.js`），送出前會先擋掉第 23 頁的常見錯誤（gender 填 M/F、身分證格式、缺 identifier.type）。伺服器回的 OperationOutcome 會直接列在結果框：**Error 一定要修、Warning 看狀況、Information 可先放著**。姓名、身分證都用假的。

## 4. 一寫一讀：照順序驗證

| 步驟 | 操作 | 看到什麼算成功 |
|---|---|---|
| **寫** | ② 病人回報：點第一個範例句再按「送出」 | 右邊出現「請盡快就醫或撥打 119」、分數與 `Encounter/…、Condition/…、Observation/…`（一次回報＝一次遠距就醫，三筆互相參照）；後端印 `[FHIR] 已存檔 Encounter/…` |
| **查** | 開下方 Observation 查詢網址 | JSON 的 `valueQuantity.value` 等於剛才的分數 |
| **讀** | ③ 醫師查看（打開就自動讀） | 有病人資料及分流卡片（8 分以上【緊急】、5–7 分【注意】）；後端印 `[CDS Hook] 找到最新評估` |
| **接受建議** | 卡片上的按鈕：【緊急】→「建立轉介單」、【注意】→「排回診（三天後）」 | 同一行顯示「✓ 已建立 Task/…」或「Appointment/…」；再按一次是「已經有了，沿用」；後端印 `[CDS Hook] feedback` |

把下列網址的 `patient-tw-wangxm` 換成你的 ID，再貼進瀏覽器：

```text
https://twcore.hapi.fhir.tw/fhir/Observation?subject=Patient/patient-tw-wangxm&code=http://example.org/fhir/ai-triage/CodeSystem/ai-triage%7Curgency-score&_sort=-date&_count=1
```

`%7C` 代表 `|`。這筆 Observation 照 TW Core「篩檢與評估」Profile：`category` 是 `survey`，分數在 `valueQuantity`，情緒和需人工介入在 `component`。原本的 LOINC `80615-8` 官方語意是「Recommended follow-up」，跟分數不符，已改成自訂 CodeSystem（`AI-Patient-Triage-System/fhir/CodeSystem-ai-triage.json`）。

**卡片門檻：**1–4 分且不需人工 → info；5–7 分或需人工 → warning；8–10 分 → critical。**低分不代表病人穩定**。

**AI 穩定性：**規則以 YAML 寫在 systemInstruction，評分錨點對照衛福部急診五級檢傷（TTAS）列急診常見主訴，加 3 個範例，`temperature: 0`；後端另有關鍵字安全網（胸痛、呼吸困難、昏倒…）至少 8 分並標需人工，終端機會印 `[AI] 安全網`。

**curl 驗收（講義練習 5／6）：**後端跑著時執行 `tools/check-api.sh <patientId>`，三條：合法 200、空 body 400、識別碼錯 400。

[舊版一寫一讀證據](../archive/一寫一讀實測-舊版/)放在 `archive/一寫一讀實測-舊版/`（TW Core 改版前跑的，現在的實測紀錄看 [notes/實測紀錄](../notes/實測紀錄-2026-10-31.md)）：`2_` API 回應、`3_` Observation、`4_` CDS 卡、`5_` 日誌、`6_` 醫師畫面、`7_` 病人畫面。這是**示範證據，不可當作自己的截圖**。

## 5. 改成你的情境

1. 先看 [三個案例與 JSON 結果](../archive/換情境範例/結果.md)，用 `archive/換情境範例/cases.js` 測你改過的 Prompt。
2. 把情境寫進 `AI-Patient-Triage-System/services/aiService.js` 的 Prompt。
3. **Prompt 與 `responseSchema` 要一起修改**。`urgency_score` 必須是 **1–10 整數**；`needs_human_intervention`、`summary` 這三個共用欄位名稱要保留。
4. 重新完成一次「寫 → 查 → 讀」，確認卡片顯示的是**你的**情境。

## 6. 聯測前自我驗證（C 聯測模擬）

1. **資源驗到全綠**：在 `Proj/` 執行 `node tools/export-examples.js`，產生後端實際送出格式的範例到 `tools/examples/`（12 個檔，含聯測匯入範例 Bundle；Task／Appointment 沒有 TW Core Profile，照 FHIR 基本規則驗）；再執行 `tools/validate.sh`（Windows 把 json 拖到 `tools/validate.bat`），用 HL7 官方 `validator_cli.jar` 對 `tw.gov.mohw.twcore#1.0.0` 驗證，目標 **Error = 0**。需要 Java 11 以上；也可以把 JSON 貼到 <https://validator.dicom.tw/app/>。
2. **伺服器端驗證**：`POST http://localhost:3000/api/twcore/validate`，body 放一個資源，後端會呼叫 FHIR 標準操作 `[type]/$validate`，只驗證不存檔。
3. **保留證據**：後端每一次對 FHIR Server 的請求與回應（HTTP header + JSON body）都寫在 `AI-Patient-Triage-System/logs/fhir-exchange.jsonl`，聯測時挑對應那筆上傳給 Monitor。這個資料夾不進版控。
4. **CDS Hooks**：Discovery 有宣告 `patient` 與 `triageObservation` 兩個 prefetch；EHR 沒給 prefetch 時，服務會用請求裡的 `fhirServer`（須在 `.env` 的信任清單）自己查。可用 <https://sandbox.cds-hooks.org/> 加 `http://localhost:3000/cds-services` 測。
5. **聯測主機要 token**：聯測松 Level I 規定先用 OAuth 2.0 Client Credentials 向大會 Keycloak 取 token。在 `.env` 填 `OAUTH_TOKEN_URL`、`OAUTH_CLIENT_ID`（`OAUTH_CLIENT_SECRET` 預設 `secret`、`OAUTH_SCOPE` 預設 `twcore`），後端每個 FHIR 請求就會自動帶 `Authorization: Bearer …`，到期前自動換新；留空就不啟用。token 不會印在終端機或證據檔。
6. **匯入聯測 JSON（Track 1）**：「④ 匯入 JSON」或 `POST /api/fhirfox/convert｜validate｜upload`。轉換規則是官方 FHIRfox 的 CSV（`AI-Patient-Triage-System/fhir/fhirfox/`），支援 Level 1–3；上傳前後端會呼叫 `tools/validator_cli.jar` 照 TW Core 1.0.0 驗證，Error 0 才以 transaction 上傳（需要 Java 17，先跑一次 `tools/validate.sh` 下載 jar；後端找不到 Java 就在 `.env` 設 `JAVA_HOME`）。上傳後第 5 步的網址可以貼到 FHIRfox 的驗證紀錄。

## 7. 自評表與聯測資源

- [TW Core 1.0.0 內部自評表](../notes/TWCore-1.0.0-自評表.md)：逐項列出通過／不通過／不適用／未測與證據。**不是官方認證。**
- [實測紀錄 2026-10-31](../notes/實測紀錄-2026-10-31.md)：在 twcore 測試伺服器與真的 Gemini 上跑過的結果。
- [簡報資源對照與實測計畫](../notes/簡報資源對照與實測計畫.md)：簡報中每個資源（FHIRfox 沙盒、TW Core 測試伺服器、驗證器、CDS Hooks Sandbox、Gemini…）在專案裡怎麼用、怎麼實測。
- [版本與決策異動紀錄](../notes/版本與決策異動紀錄.md)：每一版改了什麼、20 條設計決策的原因，接手先看這份。架構圖見 [design/architecture-full.png](../design/architecture-full.png)（課程版 6 節點在 `design/architecture.png`）。
- [白帽攻擊紀錄（第二輪，聯測松標準）](../notes/白帽攻擊紀錄-第二輪-聯測松標準.md)：搜尋跳脫、紀錄偽造、CDS 規格、壞伺服器 15 種行為的攻擊結果與修正。
- [白帽攻擊紀錄（第三輪，癱瘓與個資）](../notes/白帽攻擊紀錄-第三輪-癱瘓與個資.md)：建立與 CDS 端點限流、限流表清理、錯誤回應不漏堆疊；證據檔明文與讀取端點無認證列為已知風險。
- 聯測松官網擷取（軌道規則、23 隊名單）：`notes/twcat/摘要.md`。

## 常見問題

| 現象 | 先查什麼 |
|---|---|
| `400` | 照畫面列出的欄位修；Patient ID 只能用英數、連字號、句點 |
| `409 這個 Patient ID 已經有人用了` | 換一個病人代號，或留白讓伺服器編號 |
| `409 FHIR Server 上已經有同一筆` | 要修改就按「更新這筆」；不是的話改填不同的資料 |
| `422 FHIR Server 驗證沒過` | 照列出的位置修正；這台測試伺服器用的是 TW Core 0.3.2 |
| `429 送出太頻繁` | 每台電腦每分鐘最多送 10 次，等一分鐘 |
| ② 顯示「找不到病人」 | 伺服器資料被清掉了，回 ① 重新建立 |
| `401/403` 或金鑰無效 | `.env` 的 `GEMINI_API_KEY` |
| `404 model not found` | 預設模型是 A3-8 指定的 `gemini-3.5-flash-lite`；要換就在 `.env` 加 `GEMINI_MODEL=…`，用 A3-7 `check.js` 查可用名稱 |
| `429` | API 額度；可能是分鐘或每日限制，**別連續重試** |
| `502 AI 分析失敗` | AI 呼叫／JSON 驗證失敗，不會寫入 0 分 |
| `502 FHIR` | Server 連線或寫入／查詢失敗 |
| 寫入 Observation 回 `400`／`412` | Patient 還沒在同一台 FHIR Server 建好（先做第 3 節） |
| 建立資源回 `422` 或結果框有紅色 error | 照訊息裡的欄位修，對照 TW Core Profile 文件 <https://twcore.mohw.gov.tw/ig/twcore/profiles-and-extensions.html> |
| 剛寫入卻查不到 | Patient ID、FHIR URL、Observation code 是否一致；必要時稍後再查 |

程式改動原因看 [版本與決策異動紀錄](../notes/版本與決策異動紀錄.md)。期末提案請用 [9 頁範本](../archive/提案簡報草稿_範本.md)。
