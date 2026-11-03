# TW Core IG 1.0.0 內部自評表：AI 分流系統

> **這不是官方認證，也不是官方審核表。** TW Core IG 沒有發布統一評分的審核表；本表依 IG 內部文件（Profile 欄位表、Client／Server 能力聲明、驗證教學）整理成專案自評格式。
> 結果只用四種：**通過／不通過／不適用／未測**。不適用都寫理由；**未測不算通過**。

| 項目 | 內容 |
|---|---|
| 基準版本 | `tw.gov.mohw.twcore#1.0.0`（FHIR 4.0.1），以套件檔內的 StructureDefinition 與 CapabilityStatement 為準；0.3.2 只作補充參考 |
| 自評日期 | 2026-10-31（第二版：機構改用 hosp 版、加重複確認與依機構查病人，並納入 Mac 實測結果） |
| 系統角色 | **TW Core Client**（建立並讀取資料）。本系統不是 FHIR Server，資料存在外部的 FHIR Server（預設 `https://twcore.hapi.fhir.tw/fhir`） |
| 程式位置 | 資源組裝與送出前檢查：`AI-Patient-Triage-System/services/twcoreResources.js`；REST 呼叫：`routes/twcore.js`、`routes/triage.js`、`routes/cds-hooks.js` |
| 測試伺服器實際版本 | `twcore.hapi.fhir.tw`：HAPI 7.2.1、FHIR 4.0.1，伺服器上最新的 TW Core 是 **0.3.2**，沒有 1.0.0（見 [實測紀錄](實測紀錄-2026-10-31.md) 第 0 節）。所以伺服器的 `$validate` 只能當 0.3.x 的參考，1.0.0 要用 validator_cli 驗 |
| 範例實例 | `tools/examples/*.json`（由 `node tools/export-examples.js` 從同一套程式產生） |

## 判讀規則（本表怎麼判）

1. **必填看基數，不看 S 標記。** 最小基數 ≥ 1 才是每筆必須出現。
2. **Must Support（S）** 依 TW Core 定義：Client 傳入的項目，Server 必須能接收並儲存。本系統是 Client，S 項目有資料就送；系統不收集的資料不硬塞。
3. **綁定強度分開判：** required 必須用值集內的代碼；extensible 值集有合適代碼時要用；preferred、example 只是建議。
4. **SHALL／SHOULD／MAY 分開判：** TW Core Client 能力聲明裡沒有 SHALL，只有 SHOULD 與 MAY。SHOULD 沒做到記「不通過」並註明等級是 SHOULD，不等於違反強制規定。
5. **資料驗證（A 區）和 REST 能力（B 區）分開記錄**，不拿一筆 JSON 的結果當作系統能力。

---

## A. 資料實例驗證

### A0. 驗證器

| 檢核項目 | 判定依據 | 證據 | 結果 |
|---|---|---|---|
| validator_cli 對 TW Core **1.0.0** 驗證 Error = 0 | 驗證教學：`validator_cli.jar -version 4.0.1 -ig tw.gov.mohw.twcore#1.0.0` | 2026-10-31 第四輪（commit 585c3bb）：Java 17；**8 個檔 Error 0**（Organization、Practitioner、PractitionerRole、Patient、Encounter、Condition、Observation、CodeSystem），Warning 1（Observation `{score}` 註解單位）；報告 `tools/validation-report.html` | 通過 |
| 測試伺服器 `$validate`（TW Core **0.3.x**） | 伺服器上的 Profile | [實測紀錄](實測紀錄-2026-10-31.md) 第 5 節：5 個檔 Error 0；第四輪另驗 Encounter、Condition（No issues）、PractitionerRole（Error 0；Warning：code 不在 0.3.0 的 health-professional-sct-tw、display 應為 Medical doctor → 已改） | 通過（**只代表 0.3.x**，不能取代上一列） |
| 線上 validator.dicom.tw | C 聯測模擬簡報第 17、24 頁 | 把 `tools/examples/*.json` 貼上驗證 | **未測** |

下面 A1–A5 是**照 1.0.0 Profile 逐條人工對照加上自製結構檢查**的結果，可以作為修正依據，但**不能取代 validator_cli**。

### A1. Organization（`Organization-hosp-twcore`，醫事機構）

| 檢核項目 | 判定依據（Profile 1.0.0） | 證據 | 結果 |
|---|---|---|---|
| 版本與範圍 | `meta.profile` 宣告 `…/StructureDefinition/Organization-hosp-twcore` | `Organization-example.json` | 通過 |
| identifier.type | **1..1**，pattern：v2-0203 `PRN` | `PRN` | 通過 |
| identifier.system | pattern：`…/CodeSystem/organization-identifier-tw` | 一樣 | 通過 |
| identifier.value | **required** 綁定：organization-identifier-tw（1.0.0 共 50 個代碼） | 畫面只能用下拉選單選；後端再檢查一次，不在清單回 400 並指出 `Organization.identifier[0].value`（使用者測試 U04） | 通過 |
| type | pattern：organization-type `prov` | `prov` | 通過 |
| identifier.use | required：identifier-use | `official` | 通過 |
| name、active | Must Support | 名稱自動帶官方清單的機構名稱 | 通過 |
| text（narrative） | dom-6 建議要有 | 自動產生摘要 | 通過 |
| telecom、address | Must Support，非必填 | 畫面沒收集，有值才送 | 不適用（系統不收集此資料） |

### A2. Practitioner（`Practitioner-twcore`）

| 檢核項目 | 判定依據 | 證據 | 結果 |
|---|---|---|---|
| 版本與範圍 | `meta.profile` = `Practitioner-twcore` | `Practitioner-example.json` | 通過 |
| identifier:idCardNumber 切片 | type 1..1、system 1..1 固定 `http://www.moi.gov.tw`、value 1..1 | v2-0203 `NNxxx`、`http://www.moi.gov.tw`、10 碼 | 通過 |
| identifier:medicalLicenseNumber 切片 | type、system、value 各 1..1 | `MD`、system 可用 `.env` 的 `MEDICAL_LICENSE_SYSTEM` 改、證書字號 | 通過 |
| name | tw-core-1：要有 name.text 或 name.family | `use: official`、`text` | 通過 |
| gender | required：administrative-gender | `male` | 通過 |
| text（narrative） | dom-6 建議 | 自動產生摘要 | 通過 |
| telecom、address、birthDate、photo | Must Support，非必填 | 系統不收集 | 不適用（系統不收集此資料） |

### A3. Patient（`Patient-twcore`）

| 檢核項目 | 判定依據 | 證據 | 結果 |
|---|---|---|---|
| 版本與範圍 | `meta.profile` = `Patient-twcore` | `Patient-example.json` | 通過 |
| identifier 基數 | 1..* | 一筆身分證字號 | 通過 |
| identifier:idCardNumber 切片 | type `NNxxx`、system `http://www.moi.gov.tw`、value 符合 `^[A-Za-z][0-9]{9}$` | 送出前檢查（自動去空白、轉大寫） | 通過 |
| gender | **1..1**，required 綁定；不能填 M／F | 畫面只給 男／女／其他／不詳 四個選項 | 通過 |
| birthDate | **1..1** | 畫面必填，擋未來日期與不存在的日期 | 通過 |
| name | tw-core-1；`name:official` 切片 use 1..1 | `use: official`、`text` | 通過 |
| managingOrganization | Must Support；指向 Organization-twcore（hosp 是它的子 Profile） | 指到剛建立的機構 | 通過 |
| generalPractitioner | 非 Must Support；可指向 Practitioner-twcore | 指到剛建立的醫師 | 通過 |
| text（narrative） | dom-6 建議 | 自動產生摘要，不放身分證 | 通過 |
| telecom、address、contact、communication、maritalStatus、photo、extension:age／nationality | Must Support，非必填 | 系統不收集；主訴頁也提醒病人不要寫電話 | 不適用（系統不收集此資料） |

### A4. Observation：AI 分流（`Observation-screening-assessment-twcore`）

| 檢核項目 | 判定依據 | 證據 | 結果 |
|---|---|---|---|
| 版本與範圍 | `meta.profile` = `Observation-screening-assessment-twcore` | `Observation-triage-example.json` | 通過 |
| status | 1..1，required：observation-status | `final` | 通過 |
| category:survey | **1..1** | observation-category `survey` | 通過 |
| code | 1..1；**preferred**：loinc-survey-codes | 專案自訂 CodeSystem `…/ai-triage#urgency-score`（`fhir/CodeSystem-ai-triage.json`）。preferred 允許用值集外的代碼；原本的 LOINC 80615-8 意思不符，已換掉 | 通過 |
| subject | 1..1，可指 Patient-twcore | `Patient/{id}` | 通過 |
| performer | Must Support；可指 Patient-twcore | `Patient/{id}`（內容是病人自述） | 通過 |
| effective[x] | tw-core-3：日期至少到「日」 | 完整 dateTime | 通過 |
| value[x] | tw-core-4：沒有 component／hasMember 時要有 value 或 dataAbsentReason | `valueQuantity` | 通過 |
| Quantity 單位 | tw-core-5：**SHALL** 用 UCUM | `http://unitsofmeasure.org`、`{score}`。驗證器會對大括號註解給 Warning；TW Core 自己的範例也用 `{pack-years}`，所以保留 | 通過 |
| component | obs-7：component.code 不能和 code 相同 | emotion、needs-human-intervention 兩個不同代碼 | 通過 |
| text（narrative） | dom-6 建議 | 自動產生分數與摘要 | 通過 |
| category:twcore | 0..*，required 綁定 | 沒有用到 | 不適用（非必填，且沒有合適分類） |
| dataAbsentReason、hasMember、derivedFrom | Must Support，非必填 | AI 失敗時**不存檔**，所以不會產生缺值的 Observation | 不適用（設計上不會有缺值資料） |

### A5. Level 1 補齊的三種資源（聯測松 Track 1「基本就醫紀錄」）

| 資源 | 檢核項目 | 判定依據（Profile 1.0.0） | 證據 | 結果 |
|---|---|---|---|---|
| PractitionerRole（`PractitionerRole-twcore`） | practitioner、organization、active、code、specialty | 全為 Must Support，無必填；code **extensible** 綁 health-professional-sct-tw（含 SNOMED 223366009 子代）；specialty **preferred** | `PractitionerRole-example.json`：SNOMED 309343006 Medical doctor（223366009 子代）；specialty 用健保科別 00 不分科（不符三個 slice，只是 information） | 通過 |
| PractitionerRole | 同醫師同機構只一筆 | 專案自訂 | `practitioner=&organization=` 查到就沿用（HTTP 200 reused） | 通過 |
| Encounter（`Encounter-twcore`） | status **1..1**（required）、class **1..1**（extensible v3-ActEncounterCode） | Profile | `finished`、`VR`（virtual，遠距回報） | 通過 |
| Encounter | serviceType slice TWMedicalConsultationDepartment（required 綁 TW 健保科別） | Profile | system `…/medical-consultation-department-nhi-tw`、code `00` | 通過 |
| Encounter | subject、participant、period、serviceProvider、reasonCode | Must Support | 病人、主治醫師（ATND）、時間、機構、reasonCode.text | 通過 |
| Encounter | identifier、location、hospitalization | Must Support，非必填 | 系統不收集 | 不適用 |
| Condition（`Condition-twcore`） | clinicalStatus **1..1**、category **1..1**、subject **1..1** | Profile | `active`、`encounter-diagnosis`、病人 | 通過 |
| Condition | code（example binding；ICD／SNOMED slice 都是 0..*） | Profile | 只放 `code.text`（AI 摘要），不給 ICD；verificationStatus `unconfirmed` | 通過（無編碼，見決策 D15） |
| Condition | encounter、onset、recordedDate、asserter | Must Support | 連到同一次 Encounter | 通過 |
| 三者 | 參考資源連結（Track 1 驗證目的 2） | 官網 2.3 節 | Patient→Organization／Practitioner；PractitionerRole→兩者；Encounter→Patient／Practitioner／Organization；Condition、Observation→Encounter | 通過（本機）／未在共用伺服器建立（只 `$validate`） |

---

### A6. 卡片建議建立的 Task／Appointment（11/03 加分項）

| 項目 | 結果 | 證據／說明 |
|---|---|---|
| TW Core Profile | 不適用 | TW Core 1.0.0 沒有 Task、Appointment 的 Profile（轉介另有 `ServiceRequest-twcore`，講義指定 Task）；資源不帶 `meta.profile`，以 FHIR R4 基本定義組 |
| validator_cli（基本規則） | 通過 | 2026-11-03 實跑：`Task-example.json`、`Appointment-example.json` 各 0 錯 0 警告；第一次跑 identifier.system 用 example.org 被擋（Example URLs are not allowed），改成 `https://www.tph.mohw.gov.tw/ai-triage/follow-up`（可用 `FOLLOW_UP_ID_SYSTEM` 覆寫）後通過。10 檔合計 Error 0、Warning 1（`{score}`） |
| 建立成功判定、重複建立 | 通過 | identifier＝`follow-up|task-{ObservationId}`；If-None-Exist；第二次回 200 `reused`（使用者情境 U29） |

## B. REST 能力（TW Core Client 能力聲明）

TW Core Client 能力聲明對這四種資源：read、vread、search-type 是 **SHOULD**；create、update、delete、patch 是 **MAY**；沒有 SHALL。
「實測」指 [實測紀錄](實測紀錄-2026-10-31.md)：第一輪 commit 91a5bf9，第二輪 commit 42bc71e。

| 資源與操作 | 等級 | 本系統做法 | 證據 | 結果 |
|---|---|---|---|---|
| Organization create／update | MAY | 先用醫事機構代碼查有沒有同一筆；沒有就 `POST`，有就要使用者按「更新這筆」才 `PUT` | 第二輪：已存在回 409，確認後 200 updated | 通過 |
| Practitioner create／update | MAY | 同上，用證書字號判斷同一筆 | 第一輪、第二輪 HTTP 201 | 通過（建立）；更新流程未測 |
| Patient create／update | MAY | 用身分證字號判斷同一筆；有自訂 id 用 `PUT /Patient/{id}`；id 被不同身分證用掉時就算按更新也回 409 | 第二輪：201 → 再送 409 → 確認 200；不同身分證 409 | 通過 |
| Observation create | MAY | `POST /Observation` | 實測第 2.2 節，HTTP 200（後端）／Observation 已建立 | 通過 |
| PractitionerRole／Encounter／Condition create | MAY | 病人回報時 `POST` 三筆（Encounter→Condition→Observation） | 本機 mock 通過；公開伺服器只做過 `$validate`（HTTP 200） | 未測（實際建立） |
| 建立成功的判定 | FHIR http.html：2xx＋資源 | 2xx **且** body 是同型別、id 合法；`Prefer: return=representation`；`If-None-Exist` 條件式建立 | 白帽第二輪 K 區 15 種壞回應都正確回報 | 通過 |
| OAuth 2.0 client credentials（聯測 Level I） | 官網：先向 Keycloak 取 token | `services/oauth.js`：Basic 送 secret、到期前換新、401 重試一次 | 模擬 Keycloak：取 token 1 次、token 不進紀錄；沒 token 回 401 不顯示成功 | 通過（模擬）／大會主機未測 |
| Patient read | SHOULD | `GET /Patient/{id}` | 實測第 4 節讀回 | 通過 |
| Observation search-type | SHOULD | `subject`、`code`（都在能力聲明的查詢參數內）＋`_sort`、`_count` | 實測第 3 節 CDS 卡片 | 通過 |
| Organization／Practitioner／Patient search-type：`identifier` | SHOULD | 建立前查重複 | 第二輪 409 判斷正確 | 通過 |
| Patient search-type：`organization` | 非 TW Core 能力聲明列出的參數（FHIR R4 標準參數） | ③ 醫師查看「本機構的病人」，照 Bundle next 連結翻頁 | 第二輪：97 位、翻 2 頁，含本次病人 | 通過 |
| 四種資源的 vread | SHOULD | 沒有實作 | 程式中無此呼叫 | 不通過（SHOULD 等級，非強制） |
| Patient search-type：`name`、`birthdate`、`gender` | SHOULD | 沒有實作 | 程式中無此呼叫 | 不通過（SHOULD 等級，非強制） |
| transaction／batch／search-system | MAY | 沒有使用 | — | 不適用（MAY，未選用） |
| `$validate` | 驗證教學 | 建立前自動對伺服器 `$validate`，有 Error 就不建立；Warning 一起顯示 | 第一輪手動、第二輪建立時自動，Error 0 | 通過（伺服器是 0.3.x） |
| 格式 | 能力聲明支援 json、xml | 一律 `application/fhir+json` | `services/fhirClient.js` | 通過（使用 json） |

## C. Must Support 的 Server 端接收與儲存

| 檢核項目 | 判定依據 | 證據 | 結果 |
|---|---|---|---|
| Patient 的 S 項目存下來了 | TW Core 對 Must Support 的定義是 Server 端責任 | 實測第 4 節：identifier、name、gender、birthDate、managingOrganization 讀回一致 | 通過 |
| Observation 的 S 項目存下來了 | 同上 | 實測第 4 節：status、category、code、subject、performer、effective、value、component 讀回一致 | 通過 |
| Organization（hosp）、Patient.generalPractitioner | 同上 | 第二輪讀回：hosp profile、type prov、PRN identifier、text、generalPractitioner 都在 | 通過 |
| Practitioner 的 S 項目 | 同上 | 只確認讀得到（HTTP 200），沒有逐欄比對 | 未測 |

## D. 專案自訂的嚴格驗收標準

> 以下是**本專案自訂**的門檻，**不是 TW Core 官方評分**。

1. validator_cli 對 `tw.gov.mohw.twcore#1.0.0`：七種資源與 CodeSystem **Error = 0**。
2. 每一則 Warning 都要在本表或實測紀錄寫明原因與處理方式（目前：NNxxx 不在核心 IdentifierType 值集，是 TW Core 的寫法；`{score}` 是 UCUM 註解單位，與 TW Core 範例一致）。
3. 每一個建立、更新、查詢步驟都有請求與回應證據（`logs/fhir-exchange.jsonl`），而且終端機有一行紀錄。
4. 只用虛構資料；身分證、電話不送 AI、不印在終端機。
5. 已存在的資料一律先問使用者是否更新，沒確認就回錯誤，不默默覆蓋。
6. 錯誤一律回報**位置**（FHIRPath）與**內容**。

## E. 結論與待辦

- **資料結構：** validator_cli 對 TW Core 1.0.0：8 個檔 **Error 0**（含 Level 1 新增的 PractitionerRole、Encounter、Condition），只有 1 則 Warning（`{score}` 註解單位，原因已在 A4 說明），符合 D 區第 1、2 項。測試伺服器（0.3.x）`$validate` 也是 Error 0。
- **聯測松對照：** Level 1 六種資源都能產出並互相參照；Level 2／3（AllergyIntolerance、Procedure、vital signs、DiagnosticReport、Medication…）未做；Track 1 正式考法是 Simplified JSON 轉換器，本系統是 App 類型（見 `版本與決策異動紀錄.md` D20）。
- **REST：** 建立、更新確認、讀取、identifier 與 organization 查詢、Observation 查詢都已在測試伺服器實測通過。剩下 vread 與 name／birthdate／gender 查詢（SHOULD）沒有實作。
- **注意：** 機構代碼只能用官方清單，共用測試伺服器上多半已經有人建過；按「更新這筆」會改到那筆共用資料（第二輪更新的是伺服器上原有的 `org-hosp-example`）。
- **下一步：**
  1. （可選）把 `{score}` 改成 UCUM `1`，連這 1 則 Warning 也消掉。
  2. Practitioner 讀回逐欄比對、Practitioner 更新流程。
