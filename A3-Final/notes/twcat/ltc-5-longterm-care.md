<!-- source: https://twcat.dicom.org.tw/track-list/ltc/5 -->
2026 台灣聯測松

[/main] [/] 最新消息[/introduction] 簡介[/specification] 規格與資源[/track-list] 賽道
證書資訊
[/certificate] 證書申請[/product-confirm] 證書發放[/official-result] 聯測結果[/member] 督察員[/track-list/ltc/5] 長照聯測松[/recruit] 招募
歷史活動
[https://twcat.dicom.org.tw/ihe] 2026 亞太聯測松[https://twcat.dicom.org.tw/main] 2026 台灣聯測松[https://mitw.dicom.org.tw/2025/] 2025 亞太 IHE 聯合聯測松[https://mitw.dicom.org.tw/2024/] 2024年 MI-TW 聯測工作坊[https://mitw.dicom.org.tw/2023/] 2023年 MI-TW 聯測工作坊[https://mitw.dicom.org.tw/2022/] 2022年 MI-TW 聯測工作坊[https://mitw.dicom.org.tw/2021/] 2021年 MI-TW 聯測工作坊[https://mitw.dicom.org.tw/2020/] 2020年 MI-TW 聯測工作坊[https://ievents.iii.org.tw/JoinPNew.aspx?t=0&id=3493] 長照聯測報名

長照賽道 #5
#5 TW HAH
[#track-section-0] OAuth2 存取認證
- [#track-section-0-detail-0] 說明
- [#track-section-0-detail-1] 檢核項目
- [#track-section-0-detail-2] 各系統角色
- [#track-section-0-detail-3] 通過條件
- [#track-section-0-detail-4] 情境 (Scenarios)
- [#track-section-0-detail-5] 交易 (Transactions)
- [#track-section-0-detail-6] 官方規格與參考資料
[#track-section-1] 長照共通資料交換
[#track-section-2] 居家照護資料交換
[#track-section-3] 長照服務費用支付審核
[#track-section-4] 在宅急症照護資料交換

OAuth2 存取認證▼←

# #5 長照資料交換

## OAuth2 存取認證

### 說明

為確保參測單位資料交換的安全性，各系統間必須先進行 OAuth2 存取認證，取得 Token 後，才能進行資料交換。
OAuth 為 FHIR R4 建議使用的標準認證機制。依 FHIR R4 規範指出，對於網路環境建議使用適當的身份驗證協定來驗證終端使用者的身份，當應用程式需要識別終端使用者時，建議使用 OAuth 來驗證與授權客戶端和使用者。OAuth 2.0 為 SMART on FHIR 的基礎認證機制，客戶端應用程式能夠在基於 FHIR 的資料系統中進行授權、身份驗證和整合。
本主題採用 OAuth 2.0 認證機制，確保參測單位在進行資料交換時的安全性。參測單位需要先向大會申請並取得有效的 Token，才能存取其他賽道的測試資源。Token 具有一定的有效期限，過期後需重新申請。本主題為共通前置主題，參測單位必須先通過本主題並取得 Token，才能參與其他業務主題。
同時，本主題訂定各賽道適用之共通資料交換規則如下：
- 端點基底 [base] 為大會公告之 FHIR endpoint，各項資料交換均採用 FHIR R4 JSON 格式，並攜帶有效的 OAuth2 Bearer Token。
- 資源查詢（GET search）與資源讀取（GET read）成功時，伺服器回傳 HTTP 200 OK。條件查詢之標準回應為 Bundle.type=searchset，此為合法之搜尋結果。單筆讀取之標準回應為單筆 Resource 物件。
- 各賽道之單筆資源建立（POST create）成功時，伺服器回傳 HTTP 201 Created，參測單位可由 Location 標頭或回傳內容取得伺服器建立的實際資源 ID。
- 資料內容須符合所選 Profile 的欄位結構、型別、代碼系統與單位規範，各情境指定之核對欄位亦應完整呈現。
- 資源參照使用大會事前預載或交易當次建立之實際 ID，聚焦於單一資源內部欄位與參照識別碼之正確性。

### 檢核項目

- 參測單位應向大會申請取得 OAuth2 Token（LTC-011）
- 參測單位應以 Token 存取受保護資源並驗證缺少 Token 時之錯誤回應機制（LTC-012）

### 各系統角色於本主題之作用

 | Keyword | 名稱 | 說明
 | OAuth2 Client | OAuth2 Client | 負責向大會驗證主機取得 Access Token 後，即可向 LTC Repository 進行資料交換。
 | LTC_REPOSITORY | LTC Repository | 負責提供資料交換功能，包括長照共通資料的交換、儲存與管理，並具備驗證 Token 有效性與存取權限的能力。

### 通過條件

- 參測單位必須通過情境 1 的所有要求項目，包含成功取得 Token 與通過受保護資源之存取驗證，才算通過本主題。

### 情境 (Scenarios)

 | 情境 ID | 說明
 | SC1 | 授權與存取驗證

### 情境 1：授權與存取驗證

授權與存取驗證情境適用於所有參測系統。系統於進行資料交換前，必須先透過 OAuth2 取得 Token，才能進行後續資料交換。參加者具備 OAuth 2.0 RFC 6749 標準實作能力，在存取 FHIR 聯測主機前，先以 Authorization code flow 向大會授權主機依照指定的帳號密碼登入，取得 Access Token 後，即可使用 Token 存取 FHIR 聯測主機。
本情境授權流程步驟如下：
- 1. 用戶端（Client）引導使用者至大會授權伺服器進行身分驗證。
- 2. 使用者於授權頁面成功登入並同意授權。
- 3. 大會授權伺服器發送授權碼（Authorization Code）至指定之重新導向 URI（Redirection URI）。
- 4. 用戶端以授權碼向大會授權伺服器換取存取權杖（Access Token）。
- 5. 用戶端於後續 FHIR API 請求中攜帶 Bearer Token，向 LTC Repository 存取受保護資源。
本情境各系統角色應具備以下核心功能：

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 具備驗證 OAuth2 Bearer Token 有效性之能力。
- 對於攜帶有效 Token 且具備權限之請求，允許存取受保護之 FHIR 資源端點，並回傳 HTTP 200 OK 或 HTTP 201 Created。
- 對於缺少 Token 或提供無效、過期 Token 之請求，拒絕存取並回傳 HTTP 401 Unauthorized。

### 授權與存取驗證功能（OAuth2 Client 角色）

LTC-011：取得 OAuth2 Token
- 參測單位作為 Client，向大會授權服務發起 Authorization Code Flow 授權請求。
- 大會提供 client 設定、redirect URI、scope 與測試帳號，Token 請求與回應遵循標準 OAuth2 協定格式。
- 參測單位成功取得 Access Token，以供後續向 LTC Repository 存取受保護資源。
LTC-012：驗證 Token 與資料存取
- 參測單位以取得之 Bearer Token 向大會指定且受保護之資源端點（例如 Patient/{id}）發起 GET 請求。
- 持有效且具備權限之 Token 時，必須能正常讀取受保護資源，伺服器回傳 HTTP 200 OK。
- 同時必須驗證缺少 Token 之請求，確認伺服器正確拒絕存取並回傳 HTTP 401 Unauthorized。

### 交易 (Transactions)

 | 交易 ID | 說明 | 發送方 (From) | 接收方 (To)
 | LTC-011 | 取得 OAuth2 Token | 參測單位 (OAuth2 Client) | 大會授權服務
 | LTC-012 | 驗證 Token 與資料存取 | 參測單位 (OAuth2 Client) | 大會交換中心 (LTC_REPOSITORY)

### 官方規格與參考資料

資料來源：臺灣長期照顧實作指引（TW LTC IG），發布單位為經濟部產業發展署；本頁依 2026 年賽道頁面（STU 1.1.0，產生日期 2026-09-29）整理，核對日期為 2026-10-09。
依官方原始專案所列 [https://creativecommons.org/licenses/by/4.0/] CC BY 4.0 授權轉載賽道內容，並調整章節、清單及表格格式以配合 TW CAT 網站版型；未改動測試要求。
- [https://ltc-ig.fhir.tw/2026-track0.html] OAuth2 存取認證 官方完整規格
- [https://ltc-ig.fhir.tw/2026-connectathon-table.html] 2026 情境、角色與交易列表
- [https://ltc-ig.fhir.tw/2026-connectathon.html] 2026 長照專案聯測說明
- [https://github.com/Lorex/TWLongTermCare_IG_Build/] TW LTC IG 原始專案與授權

## 長照共通資料交換

### 說明

長照共通資料交換為跨居家照護、住宿機構、日間照護與在宅醫療共用的基礎資料層，涵蓋病人基本資料、機構基本資料、生理量測、用藥紀錄、健康問題、照護目標、照護計畫、服務請求與照護執行紀錄。參測單位透過標準建立、查詢與單筆讀取機制，驗證長照共通核心資源之新增、交換與呈現能力。

### 檢核項目

- 參測單位應依所選角色實作病人基本資料建立或查讀（情境 1，必測）
- 參測單位應依所選角色實作機構基本資料建立或查讀（情境 2，必測）
- 參測單位應依所選角色實作生理量測上傳或查讀（情境 3，必測）
- 參測單位應依所選角色實作用藥紀錄上傳或查讀（情境 4，必測）
- 參測單位可依產品支援能力與所選角色選測健康問題、照護目標、照護計畫、服務請求或照護執行紀錄之建立或查讀（情境 5 至情境 9，選測）

### 各系統角色於本主題之作用

 | Keyword | 名稱 | 說明
 | LTC_CONSUMER | LTC Consumer | 長照資料查詢端，負責向 LTC Repository 發起條件查詢與單筆讀取請求，並正確解析與呈現指定欄位內容。
 | LTC_MANAGEMENT | LTC Creator | 長照資料建立端，負責向 LTC Repository 發起單筆新增請求（POST），建立符合 Profile 規範之長照共通資源。
 | LTC_REPOSITORY | LTC Repository | 長照資料儲存端，負責儲存與維護長照共通資源，接收並處理新增、查詢與單筆讀取請求，回傳標準格式之回應。

### 通過條件

- 參測單位必須完成情境 1（SC1 病人基本資料）、情境 2（SC2 機構基本資料）、情境 3（SC3 生理量測）與情境 4（SC4 用藥紀錄）四個必測情境。情境 5 至情境 9（SC5–SC9）為選測項目，參測單位可依產品支援能力自由加選。
- 參測單位依所選之 LTC_MANAGEMENT、LTC_CONSUMER 或 LTC_REPOSITORY 角色完成所測情境之交易項目與欄位核對，由配對系統共同完成情境流程。
- 報名 LTC_MANAGEMENT 角色者完成所測情境之 POST 建立並取得實際 ID。
- 報名 LTC_CONSUMER 角色者完成所測情境之條件查詢與單筆讀取，確認資源 ID 與 Creator 當次建立的 ID 相同，並核對指定欄位與上傳內容一致。
- 報名 LTC_REPOSITORY 角色者支援所測情境之 POST 建立、條件查詢與單筆讀取。
- 每個情境皆可獨立使用大會指定之測試資料與識別碼，必要參照由大會事前備妥，受測主要資源由 Creator 當次建立。

### 情境 (Scenarios)

 | 情境 ID | 說明 | 測試類別
 | SC1 | 病人基本資料 | 必測
 | SC2 | 機構基本資料 | 必測
 | SC3 | 生理量測 | 必測
 | SC4 | 用藥紀錄 | 必測
 | SC5 | 健康問題 | 選測
 | SC6 | 照護目標 | 選測
 | SC7 | 照護計畫 | 選測
 | SC8 | 服務請求 | 選測
 | SC9 | 照護執行紀錄 | 選測

### 情境 1：病人基本資料

病人基本資料情境模擬各類長照與醫療系統建立與查詢個案基本資料的流程。維護端上傳個案基本資料，查詢端透過個案識別碼檢索個案主檔，確認個案身分，並取得姓名、出生日期、聯絡方式與緊急聯絡人資料。
本情境使用 Patient 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-LTCPatient.html] LTCPatient Profile 規範。大會提供固定合成案例、JSON 範本與指派之本輪唯一識別碼，必要參照已由大會事前備妥。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 儲存並維護符合 LTCPatient 規範之個案資料。
- 支援以 POST 方式建立個案資料，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢個案資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取個案資料，成功時回傳 HTTP 200 OK 與單筆 Patient 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-111：建立病人基本資料
- 發送 POST [base]/Patient，符合 [https://ltc-ig.fhir.tw/StructureDefinition-LTCPatient.html] LTCPatient Profile。
- 伺服器建立成功回傳 HTTP 201 Created，由 Location 標頭取得伺服器實際資源 ID 供配對端。
- 依大會合成案例填寫以下欄位內容：
- 機構身分識別碼 identifier[member]，其中 use 為 official，代碼系統 type.coding.system 為 http://terminology.hl7.org/CodeSystem/v2-0203，代碼 type.coding.code 為 PRN，system 為機構網址，value 填入大會指派之本輪唯一識別碼。
- 個案姓名（name），中文姓名填入 use = usual 與 text，英文姓名填入 use = official 與 text，依測試案例填寫。
- 出生日期（birthDate，格式為 YYYY-MM-DD）。
- 聯絡電話（telecom.value）。
- 居住地址（address，填入 use = home 與完整地址 text）。
- 緊急聯絡人（contact），包含關係（relationship）、姓名（name.text）與聯絡電話（telecom.value）。
- 所屬機構參照（managingOrganization，填入大會預載之機構 ID）。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-112：病人基本資料查詢與讀取
- 第一步條件查詢：發送 GET [base]/Patient?identifier={system}|{value}，使用大會指派之本輪唯一識別碼查詢，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：自查詢清單中選取 LTC-111 當次建立之個案 ID，發送 GET [base]/Patient/{id}，伺服器回傳 HTTP 200 OK 與單筆 Patient 資源。
- 核對指定欄位內容：
- 機構身分識別碼 identifier[member].system 與 identifier[member].value 比對測試案例，其 identifier[member].type.coding.code 為 PRN。
- 個案姓名（name）。
- 出生日期（birthDate）。
- 聯絡電話（telecom）。
- 居住地址（address）。
- 緊急聯絡人（contact）之姓名、關係與電話。

### 情境 2：機構基本資料

機構基本資料情境模擬系統建立與查詢長照服務機構、醫院或診所之組織資訊的流程。維護端上傳機構基本資料，查詢端依機構代碼檢索機構主檔，取得機構名稱、類別、地址與聯絡管道。
本情境使用 Organization 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-Organization-twltc.html] LTCOrganization Profile 規範。大會提供長照機構與醫療院所測資及指派之本輪唯一代碼。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 儲存並維護符合 LTCOrganization 規範之機構資料。
- 支援以 POST 方式建立機構資料，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢機構資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取機構資料，成功時回傳 HTTP 200 OK 與單筆 Organization 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-121：建立機構基本資料
- 發送 POST [base]/Organization，符合 [https://ltc-ig.fhir.tw/StructureDefinition-Organization-twltc.html] LTCOrganization Profile。
- 伺服器建立成功回傳 HTTP 201 Created，由 Location 標頭取得伺服器實際資源 ID 供配對端。
- 依大會測資填寫以下欄位內容：
- 機構代碼（identifier.system 填入大會指定的識別碼系統，identifier.value 填入本輪唯一機構代碼）。
- 使用狀態（active，設為 true）。
- 機構類型（type，填入機構類型代碼）。
- 機構名稱（name）。
- 聯絡電話（telecom.value）。
- 機構地址（address.text）。
- 聯絡人資訊（contact，包含聯絡人姓名與聯絡電話）。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-122：機構基本資料查詢與讀取
- 第一步條件查詢：發送 GET [base]/Organization?identifier={system}|{value}，使用大會指派之本輪唯一代碼查詢，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：自查詢清單中選取 LTC-121 當次建立之機構 ID，發送 GET [base]/Organization/{id}，伺服器回傳 HTTP 200 OK 與單筆 Organization 資源。
- 核對指定欄位內容：
- 機構代碼（identifier）。
- 使用狀態（active）。
- 機構類型（type）。
- 機構名稱（name）。
- 聯絡電話（telecom）。
- 機構地址（address）。
- 聯絡人資訊（contact，按測資內容）。

### 情境 3：生理量測

生理量測情境模擬各照護場域上傳與查閱個案日常生理指標數據的流程。維護端上傳血壓量測紀錄，查詢端依個案識別碼與檢驗代碼查詢近期量測紀錄，掌握生命徵象變化。
本情境使用 Observation 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-LTCObservationVitalSigns.html] LTCObservationVitalSigns Profile 規範。大會事前預載必要個案與醫事人員參照。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 儲存並維護符合 LTCObservationVitalSigns 規範之生理量測資料。
- 支援以 POST 方式建立生理量測資料，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢生理量測資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取生理量測資料，成功時回傳 HTTP 200 OK 與單筆 Observation 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-131：上傳生理量測
- 發送 POST [base]/Observation，符合 [https://ltc-ig.fhir.tw/StructureDefinition-LTCObservationVitalSigns.html] LTCObservationVitalSigns Profile。
- 伺服器建立成功回傳 HTTP 201 Created，由 Location 標頭取得伺服器實際資源 ID 供配對端。
- 填寫單筆血壓量測紀錄，內容包含：
- 量測狀態（status，填入 final）。
- 分類代碼（category，代碼系統 http://terminology.hl7.org/CodeSystem/observation-category，代碼 vital-signs）。
- 檢驗項目代碼（code，LOINC 代碼 85354-9，名稱 Blood pressure panel with all children optional）。
- 個案參照（subject，填入大會預載之 Patient ID）。
- 量測時間（effectiveDateTime，包含時區之日期時間）。
- 量測人員參照（performer，填入大會預載之醫事人員 ID）。
- 量測組件（component），包含收縮壓與舒張壓兩項：
- 收縮壓組件代碼為 LOINC 8480-6，數值填入 component.valueQuantity.value，單位系統為 http://unitsofmeasure.org，單位代碼為 mm[Hg]。
- 舒張壓組件代碼為 LOINC 8462-4，數值填入 component.valueQuantity.value，單位系統為 http://unitsofmeasure.org，單位代碼為 mm[Hg]。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-132：生理量測查詢與讀取
- 第一步條件查詢：發送 GET [base]/Observation?subject=Patient/{id}&code=http://loinc.org|85354-9，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：自查詢清單中選取 LTC-131 當次建立之量測 ID，發送 GET [base]/Observation/{id}，伺服器回傳 HTTP 200 OK 與單筆 Observation 資源。
- 核對指定欄位內容：
- 狀態（status）。
- 分類（category）。
- 檢驗項目代碼（code）。
- 個案參照（subject）。
- 量測時間（effectiveDateTime）。
- 量測組件（component）：收縮壓代碼 8480-6 與舒張壓代碼 8462-4。
- 組件數值與單位：component.valueQuantity.value 數值與 UCUM 單位代碼 mm[Hg]。

### 情境 4：用藥紀錄

用藥紀錄情境模擬照護團隊登錄與查閱個案實際用藥執行情形的流程。維護端上傳單筆給藥紀錄，查詢端依個案識別碼查詢給藥紀錄，掌握用藥品項、劑量與給藥時間。
本情境使用 MedicationAdministration 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-LTCMedicationAdministration.html] LTCMedicationAdministration Profile 規範。大會事前預載必要個案與醫事人員參照。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 儲存並維護符合 LTCMedicationAdministration 規範之用藥紀錄。
- 支援以 POST 方式建立用藥紀錄，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢用藥紀錄，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取用藥紀錄，成功時回傳 HTTP 200 OK 與單筆 MedicationAdministration 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-141：上傳用藥紀錄
- 發送 POST [base]/MedicationAdministration，符合 [https://ltc-ig.fhir.tw/StructureDefinition-LTCMedicationAdministration.html] LTCMedicationAdministration Profile。
- 伺服器建立成功回傳 HTTP 201 Created，由 Location 標頭取得伺服器實際資源 ID 供配對端。
- 依大會合成測資填寫以下欄位內容：
- 用藥狀態（status，填入 completed）。
- 藥品品項代碼與名稱（medicationCodeableConcept，填入大會測資之藥品代碼、代碼系統與名稱）。
- 個案參照（subject，填入大會預載之 Patient ID）。
- 給藥時間（effectiveDateTime，包含時區之日期時間）。
- 給藥途徑（dosage.route，填入給藥途徑代碼與文字）。
- 給藥劑量（dosage.dose，填入劑量數值與單位）。
- 給藥人員參照識別碼（performer.actor，填入大會預載之醫事人員 ID）。
- 附註說明（note，按測資內容）。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-142：用藥紀錄查詢與讀取
- 第一步條件查詢：發送 GET [base]/MedicationAdministration?subject=Patient/{id}，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：自查詢清單中選取 LTC-141 當次建立之紀錄 ID，發送 GET [base]/MedicationAdministration/{id}，伺服器回傳 HTTP 200 OK 與單筆 MedicationAdministration 資源。
- 核對指定欄位內容：
- 用藥狀態（status）。
- 個案參照（subject）。
- 藥品品項代碼與名稱（medicationCodeableConcept，直接包含藥品代碼與名稱）。
- 給藥時間（effectiveDateTime）。
- 給藥途徑（dosage.route）。
- 給藥劑量數值與單位（dosage.dose）。
- 給藥人員參照識別碼（performer.actor）。

### 情境 5：健康問題

健康問題情境模擬照護團隊建立與查閱個案目前確診疾病或慢性健康問題的流程。維護端上傳健康問題資料，查詢端依個案識別碼查詢健康問題清單，以高血壓等常見健康問題展示紀錄內容。
本情境使用 Condition 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-LTCCondition.html] LTCCondition Profile 規範。大會事前預載必要個案與醫事人員參照。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 儲存並維護符合 LTCCondition 規範之健康問題資料。
- 支援以 POST 方式建立健康問題資料，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢健康問題資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取健康問題資料，成功時回傳 HTTP 200 OK 與單筆 Condition 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-151：建立健康問題
- 發送 POST [base]/Condition，符合 [https://ltc-ig.fhir.tw/StructureDefinition-LTCCondition.html] LTCCondition Profile。
- 伺服器建立成功回傳 HTTP 201 Created，由 Location 標頭取得伺服器實際資源 ID 供配對端。
- 依大會合成測資填寫以下欄位內容：
- 臨床狀態（clinicalStatus，代碼系統 http://terminology.hl7.org/CodeSystem/condition-clinical，代碼 active）。
- 驗證狀態（verificationStatus，代碼系統 http://terminology.hl7.org/CodeSystem/condition-ver-status，代碼 confirmed）。
- 問題分類（category，填入分類代碼）。
- 問題代碼與文字描述（code，填入疾病診斷代碼與名稱，例如高血壓）。
- 個案參照（subject，填入大會預載之 Patient ID）。
- 發生時間（onset[x]，例如 onsetDateTime）。
- 記錄人員參照（recorder，填入大會預載之醫事人員 ID）。
- 備註說明（note，按測資內容）。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-152：健康問題查詢與讀取
- 第一步條件查詢：發送 GET [base]/Condition?subject=Patient/{id}，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：自查詢清單中選取 LTC-151 當次建立之問題 ID，發送 GET [base]/Condition/{id}，伺服器回傳 HTTP 200 OK 與單筆 Condition 資源。
- 核對指定欄位內容：
- 個案參照（subject）。
- 問題代碼與文字描述（code）。
- 臨床狀態（clinicalStatus）。
- 驗證狀態（verificationStatus）。
- 發生時間（onset[x]）。
- 備註說明（note，按測資內容）。

### 情境 6：照護目標

照護目標情境模擬照護團隊建立與查閱個案照護目標與預期成果的流程。維護端上傳照護目標項目，查詢端依個案識別碼查詢目標項目，呈現目標描述、執行進度與目標期限。
本情境使用 Goal 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-LTCGoal.html] LTCGoal Profile 規範。大會事前預載必要個案與醫事人員參照。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 儲存並維護符合 LTCGoal 規範之照護目標資料。
- 支援以 POST 方式建立照護目標資料，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢照護目標資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取照護目標資料，成功時回傳 HTTP 200 OK 與單筆 Goal 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-161：建立照護目標
- 發送 POST [base]/Goal，符合 [https://ltc-ig.fhir.tw/StructureDefinition-LTCGoal.html] LTCGoal Profile。
- 伺服器建立成功回傳 HTTP 201 Created，由 Location 標頭取得伺服器實際資源 ID 供配對端。
- 依大會合成測資填寫以下欄位內容：
- 生命週期狀態（lifecycleStatus，填入 active）。
- 目標描述（description.coding 與 description.text，填入目標項目代碼與描述文字）。
- 個案參照（subject，填入大會預載之 Patient ID）。
- 起始日期（startDate）。
- 目標指標（target.measure）與預期成果（target.detailString），依大會測試案例填寫。
- 目標期限（target.dueDate）。
- 提出者參照（expressedBy，填入大會預載之醫事人員 ID）。
- 附註說明（note，按測資內容）。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-162：照護目標查詢與讀取
- 第一步條件查詢：發送 GET [base]/Goal?subject=Patient/{id}，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：自查詢清單中選取 LTC-161 當次建立之目標 ID，發送 GET [base]/Goal/{id}，伺服器回傳 HTTP 200 OK 與單筆 Goal 資源。
- 核對指定欄位內容：
- 個案參照（subject）。
- 生命週期狀態（lifecycleStatus）。
- 目標描述代碼與文字（description.coding 與 description.text）。
- 起始日期（startDate）。
- 目標指標（target.measure）與預期成果（target.detailString），依大會測試案例填寫。
- 目標期限（target.dueDate）。

### 情境 7：照護計畫

照護計畫情境模擬跨專業團隊建立與查閱個案整體照護方針與活動規劃的流程。維護端上傳照護計畫，查詢端依個案識別碼查詢照護計畫，讀取計畫類別、執行期程與內嵌活動描述。
本情境使用 CarePlan 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-LTCCarePlan.html] LTCCarePlan Profile 規範。大會事前預載必要個案與關聯參照。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 儲存並維護符合 LTCCarePlan 規範之照護計畫資料。
- 支援以 POST 方式建立照護計畫資料，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢照護計畫資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取照護計畫資料，成功時回傳 HTTP 200 OK 與單筆 CarePlan 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-171：建立照護計畫
- 發送 POST [base]/CarePlan，符合 [https://ltc-ig.fhir.tw/StructureDefinition-LTCCarePlan.html] LTCCarePlan Profile。
- 伺服器建立成功回傳 HTTP 201 Created，由 Location 標頭取得伺服器實際資源 ID 供配對端。
- 依大會合成測資填寫以下欄位內容：
- 計畫狀態（status，填入 active）。
- 計畫意圖（intent，填入 plan 或 order）。
- 計畫類別（category）。
- 個案參照（subject，填入大會預載之 Patient ID）。
- 執行期程（period.start 與 period.end）。
- 計畫提出者（author，填入大會預載之醫事人員或機構 ID）。
- 活動明細（activity.detail.status、activity.detail.code、activity.detail.description）。
- 關聯問題與目標參照識別碼（addresses、goal，填入大會預載之 Condition 與 Goal ID）。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-172：照護計畫查詢與讀取
- 第一步條件查詢：發送 GET [base]/CarePlan?subject=Patient/{id}，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：自查詢清單中選取 LTC-171 當次建立之計畫 ID，發送 GET [base]/CarePlan/{id}，伺服器回傳 HTTP 200 OK 與單筆 CarePlan 資源。
- 核對指定欄位內容：
- 個案參照（subject）。
- 計畫狀態（status）。
- 計畫意圖（intent）。
- 計畫類別（category）。
- 執行期程（period）。
- 活動明細（activity.detail.status、activity.detail.code、activity.detail.description）。
- 關聯問題與目標參照識別碼（addresses、goal）。

### 情境 8：服務請求

服務請求情境模擬長照服務項目之開立與查閱流程。維護端上傳服務請求資料，查詢端依個案識別碼查詢照護服務請求，掌握服務項目、預計執行時間與開立單位。
本情境使用 ServiceRequest 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-LTCServiceRequest.html] LTCServiceRequest Profile 規範。大會事前預載必要個案與醫事人員參照。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 儲存並維護符合 LTCServiceRequest 規範之服務請求資料。
- 支援以 POST 方式建立服務請求資料，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢服務請求資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取服務請求資料，成功時回傳 HTTP 200 OK 與單筆 ServiceRequest 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-181：建立服務請求
- 發送 POST [base]/ServiceRequest，符合 [https://ltc-ig.fhir.tw/StructureDefinition-LTCServiceRequest.html] LTCServiceRequest Profile。
- 伺服器建立成功回傳 HTTP 201 Created，由 Location 標頭取得伺服器實際資源 ID 供配對端。
- 依大會合成測資填寫以下欄位內容：
- 請求狀態（status，填入 active）。
- 請求意圖（intent，填入 order）。
- 服務類別（category）。
- 服務項目代碼（code，填寫臺灣長照服務項目代碼，code.coding[ltcServiceItem].system 為 http://ltc-ig.fhir.tw/CodeSystem/cs-tw-ltc-service-item，代碼如 BA07 等）。
- 個案參照（subject，填入大會預載之 Patient ID）。
- 預計執行時間（occurrence[x]，例如 occurrenceDateTime）。
- 開立時間（authoredOn，包含時區之日期時間）。
- 請求者參照識別碼（requester，填入大會預載之人員或機構 ID）。
- 執行者參照識別碼（performer，填入大會預載之人員或機構 ID）。
- 備註說明（note，按測資內容）。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-182：服務請求查詢與讀取
- 第一步條件查詢：發送 GET [base]/ServiceRequest?patient=Patient/{id}，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：自查詢清單中選取 LTC-181 當次建立之請求 ID，發送 GET [base]/ServiceRequest/{id}，伺服器回傳 HTTP 200 OK 與單筆 ServiceRequest 資源。
- 核對指定欄位內容：
- 個案參照（subject）。
- 請求狀態（status）。
- 請求意圖（intent）。
- 服務項目代碼（code）。
- 預計執行時間（occurrence[x]）。
- 開立時間（authoredOn）。
- 請求者參照識別碼（requester）。
- 執行者參照識別碼（performer）。
- 備註說明（note）。

### 情境 9：照護執行紀錄

照護執行紀錄情境模擬照護人員登錄實際完成之照護活動處置紀錄，以及查詢端查閱處置紀錄的流程。維護端上傳已完成之照護處置紀錄，查詢端依個案識別碼查詢處置紀錄，確認單次已完成之照護項目與執行時間。
本情境使用 Procedure 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-LTCProcedureCareActivity.html] LTCProcedureCareActivity Profile 規範。大會事前預載必要個案與醫事人員參照。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 儲存並維護符合 LTCProcedureCareActivity 規範之照護活動處置紀錄。
- 支援以 POST 方式建立照護執行紀錄，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢照護執行紀錄，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取照護執行紀錄，成功時回傳 HTTP 200 OK 與單筆 Procedure 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-191：上傳照護執行紀錄
- 發送 POST [base]/Procedure，符合 [https://ltc-ig.fhir.tw/StructureDefinition-LTCProcedureCareActivity.html] LTCProcedureCareActivity Profile。
- 伺服器建立成功回傳 HTTP 201 Created，由 Location 標頭取得伺服器實際資源 ID 供配對端。
- 依大會合成測資填寫以下欄位內容：
- 執行狀態（status，填入 completed）。
- 照護活動代碼與名稱（code，填寫臺灣長照服務項目代碼，code.coding[ltcServiceItem].system 為 http://ltc-ig.fhir.tw/CodeSystem/cs-tw-ltc-service-item，代碼如 BA07，名稱為協助沐浴及洗頭）。
- 個案參照（subject，填入大會預載之 Patient ID）。
- 執行時間（performed[x]，例如 performedDateTime）。
- 執行人員參照識別碼（performer.actor，填入大會預載之醫事人員或照服員 ID）。
- 處置結果（outcome，按測資內容）。
- 附註說明（note，按測資內容）。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-192：照護執行紀錄查詢與讀取
- 第一步條件查詢：發送 GET [base]/Procedure?subject=Patient/{id}，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：自查詢清單中選取 LTC-191 當次建立之紀錄 ID，發送 GET [base]/Procedure/{id}，伺服器回傳 HTTP 200 OK 與單筆 Procedure 資源。
- 核對指定欄位內容：
- 個案參照（subject）。
- 執行狀態（status）。
- 照護活動代碼與名稱（code）。
- 執行時間（performed[x]）。
- 執行人員參照識別碼（performer.actor）。
- 處置結果或備註（outcome、note，按測資內容）。

### 交易 (Transactions)

 | 交易 ID | 說明 | 發送方 (From) | 接收方 (To) | 類別
 | LTC-111 | 建立病人基本資料 | 長照資料維護端 (LTC_MANAGEMENT) | 長照資料儲存端 (LTC_REPOSITORY) | 必測
 | LTC-112 | 病人基本資料查詢與讀取 | 長照資料查詢端 (LTC_CONSUMER) | 長照資料儲存端 (LTC_REPOSITORY) | 必測
 | LTC-121 | 建立機構基本資料 | 長照資料維護端 (LTC_MANAGEMENT) | 長照資料儲存端 (LTC_REPOSITORY) | 必測
 | LTC-122 | 機構基本資料查詢與讀取 | 長照資料查詢端 (LTC_CONSUMER) | 長照資料儲存端 (LTC_REPOSITORY) | 必測
 | LTC-131 | 上傳生理量測 | 長照資料維護端 (LTC_MANAGEMENT) | 長照資料儲存端 (LTC_REPOSITORY) | 必測
 | LTC-132 | 生理量測查詢與讀取 | 長照資料查詢端 (LTC_CONSUMER) | 長照資料儲存端 (LTC_REPOSITORY) | 必測
 | LTC-141 | 上傳用藥紀錄 | 長照資料維護端 (LTC_MANAGEMENT) | 長照資料儲存端 (LTC_REPOSITORY) | 必測
 | LTC-142 | 用藥紀錄查詢與讀取 | 長照資料查詢端 (LTC_CONSUMER) | 長照資料儲存端 (LTC_REPOSITORY) | 必測
 | LTC-151 | 建立健康問題 | 長照資料維護端 (LTC_MANAGEMENT) | 長照資料儲存端 (LTC_REPOSITORY) | 選測
 | LTC-152 | 健康問題查詢與讀取 | 長照資料查詢端 (LTC_CONSUMER) | 長照資料儲存端 (LTC_REPOSITORY) | 選測
 | LTC-161 | 建立照護目標 | 長照資料維護端 (LTC_MANAGEMENT) | 長照資料儲存端 (LTC_REPOSITORY) | 選測
 | LTC-162 | 照護目標查詢與讀取 | 長照資料查詢端 (LTC_CONSUMER) | 長照資料儲存端 (LTC_REPOSITORY) | 選測
 | LTC-171 | 建立照護計畫 | 長照資料維護端 (LTC_MANAGEMENT) | 長照資料儲存端 (LTC_REPOSITORY) | 選測
 | LTC-172 | 照護計畫查詢與讀取 | 長照資料查詢端 (LTC_CONSUMER) | 長照資料儲存端 (LTC_REPOSITORY) | 選測
 | LTC-181 | 建立服務請求 | 長照資料維護端 (LTC_MANAGEMENT) | 長照資料儲存端 (LTC_REPOSITORY) | 選測
 | LTC-182 | 服務請求查詢與讀取 | 長照資料查詢端 (LTC_CONSUMER) | 長照資料儲存端 (LTC_REPOSITORY) | 選測
 | LTC-191 | 上傳照護執行紀錄 | 長照資料維護端 (LTC_MANAGEMENT) | 長照資料儲存端 (LTC_REPOSITORY) | 選測
 | LTC-192 | 照護執行紀錄查詢與讀取 | 長照資料查詢端 (LTC_CONSUMER) | 長照資料儲存端 (LTC_REPOSITORY) | 選測

### 官方規格與參考資料

資料來源：臺灣長期照顧實作指引（TW LTC IG），發布單位為經濟部產業發展署；本頁依 2026 年賽道頁面（STU 1.1.0，產生日期 2026-09-29）整理，核對日期為 2026-10-09。
依官方原始專案所列 [https://creativecommons.org/licenses/by/4.0/] CC BY 4.0 授權轉載賽道內容，並調整章節、清單及表格格式以配合 TW CAT 網站版型；未改動測試要求。
- [https://ltc-ig.fhir.tw/2026-track1.html] 長照共通資料交換 官方完整規格
- [https://ltc-ig.fhir.tw/2026-connectathon-table.html] 2026 情境、角色與交易列表
- [https://ltc-ig.fhir.tw/2026-connectathon.html] 2026 長照專案聯測說明
- [https://github.com/Lorex/TWLongTermCare_IG_Build/] TW LTC IG 原始專案與授權

## 居家照護資料交換

### 說明

居家照護資料交換主要針對居家照護場域之個案管理流程進行標準化資料交換，涵蓋個案基本資料、全人評估、照護計畫與共照記錄等結構化資料。居家護理人員收案建檔、執行健康習慣等全人評估、擬定照護計畫並於到宅訪視後填寫共照記錄，上傳至長照資料庫，後續提供照護團隊及相關單位查詢調閱。本主題可銜接長照共通資料交換主題 之病人基本資料查讀能力（LTC-112）與共通資料定位，並依居家照護專用 Profile 進行獨立業務測試。參測單位應依照上述需求實作相關功能，以滿足居家照護資料交換需求。

### 檢核項目

- 參測單位應依所選角色實作居護個案基本資料建立或查讀（情境 1，必測）
- 參測單位可依產品支援能力與所選角色選測居護全人評估建立或查讀（情境 2，選測）
- 參測單位可依產品支援能力與所選角色選測居護照護計畫建立或查讀（情境 3，選測）
- 參測單位可依產品支援能力與所選角色選測居護共照記錄建立或查讀（情境 4，選測）

### 各系統角色於本主題之作用

 | Keyword | 名稱 | 說明
 | LTC_MANAGEMENT | LTC Creator | 負責上傳居護個案基本資料、全人評估、照護計畫與共照記錄至 LTC Repository。
 | LTC_CONSUMER | LTC Consumer | 負責向 LTC Repository 查詢與讀取居護個案基本資料、全人評估、照護計畫與共照記錄。
 | LTC_REPOSITORY | LTC Repository | 負責提供資料交換與儲存功能，包括居家照護表單與計畫資源之儲存、條件查詢與單筆讀取。

### 通過條件

- 參測單位必須完成情境 1（SC1 居護個案基本資料管理，必測），並自情境 2（SC2 居護全人評估管理）、情境 3（SC3 居護照護計畫管理）與情境 4（SC4 居護共照記錄管理）中至少選測一項，由配對系統共同完成情境流程。
- LTC_MANAGEMENT 角色須完成 SC1 之 LTC-211 上傳居護個案基本資料，並自 LTC-221、LTC-231 或 LTC-241 中至少完成一項上傳交易，由 Location 標頭取得實際建立之資源 ID。
- LTC_CONSUMER 角色須完成 SC1 之 LTC-212 查詢與取得居護個案基本資料，並自 LTC-222、LTC-232 或 LTC-242 中至少完成一項查讀交易，確認讀取之資料為 Creator 當次建立之資源並核對指定欄位內容。
- LTC_REPOSITORY 角色須支援上述所測情境之 POST 建立，以及條件查詢（Search）與單筆讀取（Read）。
- 各情境使用大會指定之測試案例與預載參照資料，由 Creator 建立受測資源，再交由配對的 Consumer 查詢與讀取。

### 情境 (Scenarios)

 | 情境 ID | 說明 | 測試類別
 | SC1 | 居護個案基本資料管理 | 必測
 | SC2 | 居護全人評估管理 | 選測
 | SC3 | 居護照護計畫管理 | 選測
 | SC4 | 居護共照記錄管理 | 選測

### 情境 1：居護個案基本資料管理

居護個案基本資料管理情境模擬居家護理所為新收案個案建立完整個案基本資料表單，並將表單上傳至長照資料庫，後續供照護團隊查詢與調閱的流程。表單涵蓋收案來源、家庭社會背景、主要照顧者、聯絡人與主要決策者等資訊。
本情境使用 QuestionnaireResponse 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HNBaseDataResponse.html] HNBaseDataResponse Profile 規範，相關範例可參考[https://ltc-ig.fhir.tw/QuestionnaireResponse-hn-basedata-example.html] 個案基本資料範例。大會事前預載 HNPatient、HNEpisodeOfCare 與其相依資料、Questionnaire 定義、JSON 範例及 ID 清單，參測者沿用大會預載之參照目標。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 能夠接收來自居家照護端之個案基本資料表單，遵循 FHIR R4 QuestionnaireResponse 資源格式儲存並提供查詢功能。
- 支援以 POST 方式建立資料，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取資料，成功時回傳 HTTP 200 OK 與單筆 QuestionnaireResponse 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-211：上傳居護個案基本資料
- 必須能以 POST 方式上傳單筆個案基本資料表單至 [base]/QuestionnaireResponse，符合 [https://ltc-ig.fhir.tw/StructureDefinition-HNBaseDataResponse.html] HNBaseDataResponse Profile。
- 表單根層級屬性要求：
- status 固定填入 completed。
- authored 填入填表時間（包含時區之 dateTime，例如 2026-09-29T09:00:00+08:00）。
- subject 參照大會提供之 HNPatient 資源。
- questionnaire 固定填入 http://ltc-ig.fhir.tw/Questionnaire/hn-basedata。
- extension 必須包含 ExtHNEpisode（url 為 http://ltc-ig.fhir.tw/StructureDefinition/ExtHNEpisode），其 valueReference 參照大會提供之 HNEpisodeOfCare 資源。
- 表單欄位填寫說明（依大會固定一般居護案例填寫）：
- 1. 個案識別與收案：
- CaseID：個案身分證字號，valueString（對應預載 Patient 之身分證字號）。
- EndDate：收案日期，valueDate（格式 YYYY-MM-DD，對應預載 EpisodeOfCare.period.start）。
- CaseName：個案姓名，valueString（例如「陳明慧」）。
- Sex：性別群組，子項 Sex.Value 之 valueCoding 填入性別代碼（例如男 c4e79758a9900）。
- CaseType：個案類別，valueCoding 填入大會案例指定的服務類別代碼。
- Birthdate：出生日期，valueDate（例如 1945-03-15）。
- 2. 聯絡方式與社會背景：
- PhoneNumber：個案電話，valueString（例如 02-23456789）。
- Address：居住地址群組，包含子項 Address.City（縣市）、Address.Area（行政區）與 Address.Lane（街道門牌）。
- Education：教育程度群組，子項 Education.Value 之 valueCoding 填入代碼（例如不識字 c58a2fa9a6b3c）。
- Marriage：婚姻狀況群組，子項 Marriage.Value 之 valueCoding 填入代碼（例如未婚 c3c50b689dbd7）。
- Religion：宗教信仰群組，子項 Religion.Value 之 valueCoding 填入代碼（例如無 cda5930e53d54）。
- ExJob：過去職業群組，子項 ExJob.Value 之 valueCoding 填入代碼（例如無 cda5930e53d54）。
- Economic：經濟狀況群組，子項 Economic.Value 之 valueCoding 填入代碼（例如富裕 cf97d0d5a4c90）。
- HasWelfare：福利身分，valueCoding 填入代碼（例如無 cda5930e53d54）。
- 3. 收案來源與照顧者：
- CaseSource：收案來源群組，子項 CaseSource.Value 之 valueCoding 填入來源代碼（例如簽約醫院轉介 ca3185e6b3427）。
- CaregiverID：主要照顧者身分，valueCoding 填入代碼（例如自己 cfb43354d2aae）。
- CaregiverName：主要照顧者姓名，valueString。
- CaregiverAddress：主要照顧者地址群組，包含子項 CaregiverAddress.City、CaregiverAddress.Area 與 CaregiverAddress.Lane。
- CaregiverTel：主要照顧者電話，valueString。
- 4. 緊急聯絡人與主要決策者：
- EgyContactRelation：緊急聯絡人關係，valueCoding 填入代碼（例如配偶 c0fd6889156f2）。
- EgyContactName：緊急聯絡人姓名，valueString。
- EgyContactTel1：緊急聯絡人電話，valueString。
- DecisionMakerRelation：主要決策者關係群組，子項 DecisionMakerRelation.Value 之 valueCoding 填入代碼（例如自己 cfb43354d2aae）。
- MEvent：重大生活事件，valueCoding 填入代碼（例如無 cda5930e53d54）。
- 5. 訪視與機構資訊：
- NurseID：主責護理師身分證字號，valueString（例如 B123456789）。
- CreateID：建立機構代碼，valueString（例如 3501010011）。 - 選項之代碼系統均使用 http://ltc-ig.fhir.tw/CodeSystem/hn-answer。
- 伺服器建立成功回傳 HTTP 201 Created，上傳端由 Location 標頭取得實際建立之資源 ID。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-212：查詢與取得居護個案基本資料
- 必須能以 GET 方式查詢個案基本資料，查詢格式為： GET [base]/QuestionnaireResponse?subject=Patient/{id}&questionnaire=http://ltc-ig.fhir.tw/Questionnaire/hn-basedata 伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 消費端解析查詢結果，依據 LTC-211 當次建立之 QuestionnaireResponse ID 發起單筆讀取： GET [base]/QuestionnaireResponse/{id} 伺服器回傳 HTTP 200 OK 與單筆 QuestionnaireResponse 資源。
- 核對 subject 與 episode Extension 參照大會指定的個案與收案資料，並確認表單中的個案身分證字號與收案日期相符。
- 消費端系統介面能正確顯示個案身分、收案日期、收案來源、家庭社會背景、主要照顧者與緊急聯絡人資料，確認資料與 LTC-211 提交內容完全一致。

### 情境 2：居護全人評估管理

居護全人評估管理情境模擬居家護理師到宅執行全人評估，以「健康紀錄評估」表單驗證全人評估表單之交換流程。表單記錄生活習慣（吸菸、飲酒、嚼食檳榔）、過敏史（食物過敏、藥物過敏）與預防接種紀錄，並將表單上傳至長照資料庫，後續供照護團隊查詢與調閱。
本情境使用 QuestionnaireResponse 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HNHealthyHabitsResponse.html] HNHealthyHabitsResponse Profile 規範，相關範例可參考[https://ltc-ig.fhir.tw/QuestionnaireResponse-hn-healthyhabits-example.html] 健康紀錄評估範例。大會事前預載 HNPatient、HNEpisodeOfCare 與其相依資料、Questionnaire 定義、JSON 範例及 ID 清單，參測者沿用大會預載之參照目標。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 能夠接收來自居家照護端之全人評估表單，遵循 FHIR R4 QuestionnaireResponse 資源格式儲存並提供查詢功能。
- 支援以 POST 方式建立資料，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取資料，成功時回傳 HTTP 200 OK 與單筆 QuestionnaireResponse 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-221：上傳居護全人評估
- 必須能以 POST 方式上傳單筆健康紀錄評估表單至 [base]/QuestionnaireResponse，符合 [https://ltc-ig.fhir.tw/StructureDefinition-HNHealthyHabitsResponse.html] HNHealthyHabitsResponse Profile。
- 表單根層級屬性要求：
- status 固定填入 completed。
- authored 填入填表時間（包含時區之 dateTime，例如 2026-09-29T09:15:00+08:00）。
- subject 參照大會提供之 HNPatient 資源。
- questionnaire 固定填入 http://ltc-ig.fhir.tw/Questionnaire/hn-healthyhabits。
- extension 必須包含 ExtHNEpisode（url 為 http://ltc-ig.fhir.tw/StructureDefinition/ExtHNEpisode），其 valueReference 參照大會提供之 HNEpisodeOfCare 資源。
- 表單欄位填寫說明（依大會固定一般居護案例填寫）：
- 1. Date：紀錄日期，valueDate 填入評估日期（例如 2026-09-29）。
- 2. NurseID：護理人員身分證字號，valueString 填入身分證字號（例如 B123456789）。
- 3. IsSmoking：吸菸狀態，answer.valueCoding 填入代碼 ce7db7791df8d（不吸菸）。
- 4. IsAlcohol：飲酒狀態，answer.valueCoding 填入代碼 ca7ee52d8897f（不喝酒）。
- 5. IsBetelNut：嚼食檳榔狀態，answer.valueCoding 填入代碼 c9ff7aa9a2829（不嚼）。
- 6. IsAllergy：食物過敏，answer.valueCoding 填入代碼 cda5930e53d54（無）。
- 7. IsAllergyDrug：藥物過敏，answer.valueCoding 填入代碼 cda5930e53d54（無）。
- 8. Vaccination：疫苗紀錄群組，包含子項 Vaccination.Answer，其 answer.valueCoding 填入代碼 cda5930e53d54（無）。
- 選項之代碼系統均使用 http://ltc-ig.fhir.tw/CodeSystem/hn-answer。
- 伺服器建立成功回傳 HTTP 201 Created，上傳端由 Location 標頭取得實際建立之資源 ID。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-222：查詢與取得居護全人評估
- 必須能以 GET 方式查詢全人評估表單，查詢格式為： GET [base]/QuestionnaireResponse?subject=Patient/{id}&questionnaire=http://ltc-ig.fhir.tw/Questionnaire/hn-healthyhabits 伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 消費端解析查詢結果，依據 LTC-221 當次建立之 QuestionnaireResponse ID 發起單筆讀取： GET [base]/QuestionnaireResponse/{id} 伺服器回傳 HTTP 200 OK 與單筆 QuestionnaireResponse 資源。
- 核對 subject 與 episode Extension 參照大會指定的個案與收案資料。
- 消費端系統介面能正確顯示紀錄日期、護理人員識別、生活習慣狀態、過敏紀錄與預防接種情形，確認資料與 LTC-221 提交內容完全一致。

### 情境 3：居護照護計畫管理

居護照護計畫管理情境模擬居家護理師依據全人評估與照護需求擬定照護計畫，設定照護目標與護理措施明細，並將計畫上傳至長照資料庫，後續供照護團隊查詢與調閱的流程。
本情境使用 CarePlan 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HNCarePlan.html] HNCarePlan Profile 規範，相關範例可參考[https://ltc-ig.fhir.tw/CarePlan-hn-careplan-example.html] 照護計畫範例。大會事前預載 HNPatient、HNEpisodeOfCare、HNGoal、HNTargetsResponse、HNMeasuresResponse 與其相依資料、JSON 範例及 ID 清單。預載目標與來源表單的內容對應本次計畫及護理措施，參測者依清單填寫參照。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 能夠接收來自居家照護端之照護計畫資料，遵循 FHIR R4 CarePlan 資源格式儲存並提供查詢功能。
- 支援以 POST 方式建立資料，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取資料，成功時回傳 HTTP 200 OK 與單筆 CarePlan 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-231：建立居護照護計畫
- 必須能以 POST 方式上傳單筆照護計畫至 [base]/CarePlan，符合 [https://ltc-ig.fhir.tw/StructureDefinition-HNCarePlan.html] HNCarePlan Profile。
- 計畫屬性要求：
- status 固定填入 active。
- intent 固定填入 plan。
- category 使用 TWCore 之 assess-plan 代碼系統 https://twcore.mohw.gov.tw/ig/twcore/CodeSystem/careplan-category-tw，code 為 assess-plan。
- subject 參照大會提供之 HNPatient 資源。
- period 填入計畫執行期間，包含 period.start（例如 2026-09-29）。
- author 參照大會提供之護理人員 Practitioner 資源。
- goal 參照大會預載之 HNGoal 資源。
- extension 必須包含 ExtHNEpisode（url 為 http://ltc-ig.fhir.tw/StructureDefinition/ExtHNEpisode），其 valueReference 參照大會提供之 HNEpisodeOfCare 資源。
- extension 必須包含 ExtHNSourceForm（url 為 http://ltc-ig.fhir.tw/StructureDefinition/ExtHNSourceForm），其 valueReference 參照大會預載之來源表單（如 HNTargetsResponse 或 HNMeasuresResponse）。
- activity：必須使用 activity.detail 表達一項進行中的護理措施明細：
- activity.detail.status 固定填入 in-progress。
- activity.detail.description 填入本次護理措施文字說明（例如「每日指導個案個別移位防跌措施」）。
- activity.detail.goal 參照指向與 CarePlan.goal 相同之預載 HNGoal 資源。
- 伺服器建立成功回傳 HTTP 201 Created，上傳端由 Location 標頭取得實際建立之資源 ID。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-232：查詢與取得居護照護計畫
- 必須能以 GET 方式查詢照護計畫，查詢格式為： GET [base]/CarePlan?subject=Patient/{id} 伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 消費端解析查詢結果，依據 LTC-231 當次建立之 CarePlan ID 發起單筆讀取： GET [base]/CarePlan/{id} 伺服器回傳 HTTP 200 OK 與單筆 CarePlan 資源。
- 核對 subject、author、episode Extension 與 sourceForm Extension 參照大會指定資料。
- 核對計畫狀態（status 為 active）、意圖（intent 為 plan）、執行期間（period）、類別（category 為 assess-plan）、照護目標參照（goal 與 activity.detail.goal 一致指向預載 HNGoal），以及措施明細狀態與說明文字（activity.detail.description），確認資料與 LTC-231 提交內容完全一致。

### 情境 4：居護共照記錄管理

居護共照記錄管理情境模擬居家護理師到宅提供照護後，記錄共照團隊成員訪視內容與照護說明，並將共照記錄表單上傳至長照資料庫，後續供照護團隊查詢與調閱的流程。
本情境使用 QuestionnaireResponse 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HNCaseDescResponse.html] HNCaseDescResponse Profile 規範，相關範例可參考[https://ltc-ig.fhir.tw/QuestionnaireResponse-hn-casedesc-example.html] 共照紀錄範例。大會事前預載 HNPatient、HNEpisodeOfCare 與其相依資料、Questionnaire 定義、JSON 範例及 ID 清單，參測者沿用大會預載之參照目標。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 能夠接收來自居家照護端之共照記錄資料，遵循 FHIR R4 QuestionnaireResponse 資源格式儲存並提供查詢功能。
- 支援以 POST 方式建立資料，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取資料，成功時回傳 HTTP 200 OK 與單筆 QuestionnaireResponse 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-241：上傳居護共照記錄
- 必須能以 POST 方式上傳單筆共照記錄至 [base]/QuestionnaireResponse，符合 [https://ltc-ig.fhir.tw/StructureDefinition-HNCaseDescResponse.html] HNCaseDescResponse Profile。
- 本次測試案例為單一護理師執行一次居家照護，照護時段為 09:00:00 至 09:30:00，照護紀錄內容填入「已向家屬說明翻身及日常照護注意事項」。
- 表單必須填寫以下八項 item 欄位（以 linkId 區分）：
- 1. CaseID：個案身分證字號（最長 10 個字元）。
- 2. EndDate：收案日期，格式為 YYYY-MM-DD。
- 3. Date：照護日期，格式為 YYYY-MM-DD。
- 4. Time：開始時間，FHIR time 格式，填入 09:00:00。
- 5. Time2：結束時間，FHIR time 格式，填入 09:30:00。
- 6. MedicalName：共照成員姓名，填入護理師姓名（最長 50 個字元）。
- 7. Title：共照成員職稱，子項 Title.Value 之 valueCoding 填入護理師，system 為 http://ltc-ig.fhir.tw/CodeSystem/hn-answer，code 為 cdbb50d002e8b。
- 8. Statement：照護紀錄，填入「已向家屬說明翻身及日常照護注意事項」（最長 200 個字元）。
- 表單根層級屬性要求：
- status 固定填入 completed。
- authored 填入填表時間（包含時區之 dateTime，例如 2026-09-29T09:30:00+08:00）。
- subject 參照大會提供之 HNPatient 資源。
- questionnaire 固定填入 http://ltc-ig.fhir.tw/Questionnaire/hn-casedesc。
- extension 必須包含 ExtHNEpisode（url 為 http://ltc-ig.fhir.tw/StructureDefinition/ExtHNEpisode），其 valueReference 參照大會提供之 HNEpisodeOfCare 資源。
- 伺服器建立成功回傳 HTTP 201 Created，上傳端由 Location 標頭取得實際建立之資源 ID。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-242：查詢與取得居護共照記錄
- 必須能以 GET 方式查詢共照記錄，查詢格式為： GET [base]/QuestionnaireResponse?subject=Patient/{id}&questionnaire=http://ltc-ig.fhir.tw/Questionnaire/hn-casedesc 伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 消費端解析查詢結果，依據 LTC-241 當次建立之 QuestionnaireResponse ID 發起單筆讀取： GET [base]/QuestionnaireResponse/{id} 伺服器回傳 HTTP 200 OK 與單筆 QuestionnaireResponse 資源。
- 核對 subject 與 episode Extension 參照大會指定的個案與收案資料，並確認表單中的身分證字號與收案日期相符。
- 消費端系統介面能正確顯示個案身分、收案日期、照護日期、開始與結束時間、共照人員姓名、職類及照護紀錄，確認資料與 LTC-241 提交內容完全一致。

### 交易 (Transactions)

 | 交易 ID | 說明 | 發送方 (From) | 接收方 (To)
 | LTC-211 | 上傳居護個案基本資料 | 居家照護端 (LTC_MANAGEMENT) | 長照資料交換中心 (LTC_REPOSITORY)
 | LTC-212 | 查詢與取得居護個案基本資料 | 長照使用端 (LTC_CONSUMER) | 長照資料交換中心 (LTC_REPOSITORY)
 | LTC-221 | 上傳居護全人評估 | 居家照護端 (LTC_MANAGEMENT) | 長照資料交換中心 (LTC_REPOSITORY)
 | LTC-222 | 查詢與取得居護全人評估 | 長照使用端 (LTC_CONSUMER) | 長照資料交換中心 (LTC_REPOSITORY)
 | LTC-231 | 建立居護照護計畫 | 居家照護端 (LTC_MANAGEMENT) | 長照資料交換中心 (LTC_REPOSITORY)
 | LTC-232 | 查詢與取得居護照護計畫 | 長照使用端 (LTC_CONSUMER) | 長照資料交換中心 (LTC_REPOSITORY)
 | LTC-241 | 上傳居護共照記錄 | 居家照護端 (LTC_MANAGEMENT) | 長照資料交換中心 (LTC_REPOSITORY)
 | LTC-242 | 查詢與取得居護共照記錄 | 長照使用端 (LTC_CONSUMER) | 長照資料交換中心 (LTC_REPOSITORY)

### 官方規格與參考資料

資料來源：臺灣長期照顧實作指引（TW LTC IG），發布單位為經濟部產業發展署；本頁依 2026 年賽道頁面（STU 1.1.0，產生日期 2026-09-29）整理，核對日期為 2026-10-09。
依官方原始專案所列 [https://creativecommons.org/licenses/by/4.0/] CC BY 4.0 授權轉載賽道內容，並調整章節、清單及表格格式以配合 TW CAT 網站版型；未改動測試要求。
- [https://ltc-ig.fhir.tw/2026-track2.html] 居家照護資料交換 官方完整規格
- [https://ltc-ig.fhir.tw/2026-connectathon-table.html] 2026 情境、角色與交易列表
- [https://ltc-ig.fhir.tw/2026-connectathon.html] 2026 長照專案聯測說明
- [https://github.com/Lorex/TWLongTermCare_IG_Build/] TW LTC IG 原始專案與授權

## 長照服務費用支付審核

### 說明

長照服務費用支付審核主要針對長照特約服務單位送出個案長照服務費用申報資料，以及查詢與取得審核結果進行標準化資料交換。大會提供模擬審核服務，依本次申報產生審核結果。本主題可銜接長照共通資料交換主題 之病人基本資料（LTC-112）與機構基本資料（LTC-122）查讀能力及其共通資料定位，並依支付審核專用之 Claim 與 ClaimResponse Profile 進行獨立業務測試。參測單位應依照上述需求實作相關功能，以滿足長照支付審核資料交換需求。相關業務說明可參考[https://ltc-ig.fhir.tw/fee-audit.html] 支付主題。

### 檢核項目

- 參測單位應實作單筆服務申報與審核結果查詢功能（情境 1）

### 各系統角色於本主題之作用

 | Keyword | 名稱 | 說明
 | LTC_MANAGEMENT | LTC Management System | 負責送出長照服務費用申報資料（Claim）至 LTC Repository。
 | LTC_CONSUMER | LTC Consumer | 負責向 LTC Repository 查詢與取得長照服務費用審核結果（ClaimResponse）。
 | LTC_REPOSITORY | LTC Repository | 負責提供資料交換與儲存功能，接收申報資料，與大會模擬審核服務銜接，並支援審核結果之查詢與讀取。

### 通過條件

- 參測之申報系統承接 LTC_MANAGEMENT 與 LTC_CONSUMER 兩角色，須完成情境 1 內之 LTC-311 送出服務費用申報與 LTC-312 查詢與取得審核結果。
- LTC_REPOSITORY 角色須支援 LTC-311 之 POST 申報接收，並支援 LTC-312 之條件查詢（Search）與單筆讀取（Read）。
- 審核結果由大會模擬審核服務依當次申報產生，參測端完成 LTC-311 與 LTC-312 兩項交易並核對指定欄位無誤即認定通過。

### 情境 (Scenarios)

 | 情境 ID | 說明
 | SC1 | 單筆服務申報與審核結果查詢

### 情境 1：單筆服務申報與審核結果查詢

單筆服務申報與審核結果查詢情境模擬長照特約服務單位向主管機關提出長照服務費用申報，並於後續查詢審核通過結果的流程。大會提供模擬審核服務，依本次申報產生審核結果。本次測試採用固定審核通過案例。
本情境使用 Claim 與 ClaimResponse 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-LTCClaimFeeApply.html] LTCClaimFeeApply 與 [https://ltc-ig.fhir.tw/StructureDefinition-LTCClaimResponseFeeAudit.html] LTCClaimResponseFeeAudit Profile 規範。大會於會前預載 Patient、Organization、Practitioner、Coverage（含所需給付與主管機關資料），參測者沿用大會預載之參照目標。

### 資料儲存、管理功能（LTC_REPOSITORY 角色）

- 能夠接收來自長照申報端之服務費用申報資料，遵循 FHIR R4 Claim 資源格式儲存。
- 支援以 POST 方式接收申報資料，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際 Claim ID。
- 銜接大會模擬審核服務，依當次申報 Claim 自動產生對應之 LTCClaimResponseFeeAudit 資源。
- 支援以 GET [base]/ClaimResponse?request=Claim/{id} 條件查詢審核結果，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET [base]/ClaimResponse/{id} 單筆讀取審核結果，成功時回傳 HTTP 200 OK 與單筆 ClaimResponse 資源。

### 資料上傳功能（LTC_MANAGEMENT 角色）

LTC-311：送出服務費用申報
- 必須能以 POST 方式送出單筆服務費用申報至 [base]/Claim，符合 [https://ltc-ig.fhir.tw/StructureDefinition-LTCClaimFeeApply.html] LTCClaimFeeApply Profile。
- 本次測試案例為一位個案、一筆 BA07（協助沐浴及洗頭）服務、一位服務人員（照顧服務員）、數量 1 次，補助類別為補助（item.category.coding.code = 1）。服務單價、申報金額依大會測資填寫。
- 申報資源各欄位填寫要求：
- status 固定填入 active。
- type.coding 填入 Profile 指定的代碼系統與 professional 代碼。
- use 固定填入 claim。
- created 填入申報建立時間（包含時區之 dateTime，例如 2026-09-29T10:00:00+08:00）。
- priority.coding 填入處理優先順序代碼系統與 normal 代碼。
- patient 參照大會預載之 LTCPatient 資源。
- provider 參照大會預載之特約服務單位 LTCOrganization 資源。
- insurance 至少一筆，填入序號 sequence = 1、focal = true，coverage 參照大會預載之 Coverage 資源。
- identifier 包含三個識別碼 Slice：
- 1. identifier[objid]：服務紀錄識別碼，由申報單位產生之唯一碼（最長 20 個字元）。
- 2. identifier[transNo]：交易序號（最長 10 個字元）。
- 3. identifier[yyyymm]：支審年月，6 碼西元年月，格式為 yyyyMM（例如 202609）。
- careTeam 包含提供服務之照顧服務員，sequence = 1，provider 參照大會預載之 LTCPractitioner 資源。
- item 填寫單筆服務明細，sequence = 1：
- 1. productOrService.coding 填入照顧組合代碼系統與 BA07 代碼。
- 2. category.coding 填入服務類別代碼系統與 1（補助）代碼。
- 3. quantity.value 填入數量 1。
- 4. servicedPeriod 填入服務起訖時間（包含時區之 Period）。
- 5. unitPrice 填入服務單價（Money，幣別固定為 TWD）。
- 6. net 填入小計金額（單價乘以數量，Money，幣別固定為 TWD）。
- total 填入本筆服務紀錄之申報總金額（Money，幣別固定為 TWD）。
- 伺服器建立成功回傳 HTTP 201 Created，上傳端由 Location 標頭取得實際建立之 Claim ID。

### 資料查詢功能（LTC_CONSUMER 角色）

LTC-312：查詢與取得審核結果
- 必須能以 GET 方式查詢審核結果，查詢格式為： GET [base]/ClaimResponse?request=Claim/{id} 其中 {id} 為 LTC-311 當次建立之 Claim ID。伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 消費端解析查詢結果，依據回傳之 ClaimResponse ID 發起單筆讀取： GET [base]/ClaimResponse/{id} 伺服器回傳 HTTP 200 OK 與單筆 [https://ltc-ig.fhir.tw/StructureDefinition-LTCClaimResponseFeeAudit.html] LTCClaimResponseFeeAudit 資源。
- 審核結果與原申報資料之關聯與核對要求：
- request 必須參照本次申報建立之 Claim 資源（Claim/{id}）。
- patient 必須與原申報個案一致。
- identifier[caseNo] 包含主管機關分案案號。
- outcome 填入 complete，表示申報已完成處理。
- disposition 包含承辦人員審核意見。
- total 明確呈現各項金額，包含申請核銷金額（submitted）與核定金額（approveFee），幣別均為 TWD。
- item 包含審核通過之服務明細，其 item.extension[recordRef].extension[objid].valueString 與原 Claim 之 identifier[objid] 一致，item.adjudication 分別呈現核定單價（price）與個案自付額（copayment）。
- 接收端系統介面能正確解析並清楚呈現審核處理狀態、分案案號、核定金額、自付額及審核意見，確認各項資料與原申報內容完全對應。

### 交易 (Transactions)

 | 交易 ID | 說明 | 發送方 (From) | 接收方 (To)
 | LTC-311 | 送出服務費用申報 | 長照申報端 (LTC_MANAGEMENT) | 長照資料交換中心 (LTC_REPOSITORY)
 | LTC-312 | 查詢與取得審核結果 | 長照申報端 (LTC_CONSUMER) | 長照資料交換中心 (LTC_REPOSITORY)

### 官方規格與參考資料

資料來源：臺灣長期照顧實作指引（TW LTC IG），發布單位為經濟部產業發展署；本頁依 2026 年賽道頁面（STU 1.1.0，產生日期 2026-09-29）整理，核對日期為 2026-10-09。
依官方原始專案所列 [https://creativecommons.org/licenses/by/4.0/] CC BY 4.0 授權轉載賽道內容，並調整章節、清單及表格格式以配合 TW CAT 網站版型；未改動測試要求。
- [https://ltc-ig.fhir.tw/2026-track3.html] 長照服務費用支付審核 官方完整規格
- [https://ltc-ig.fhir.tw/2026-connectathon-table.html] 2026 情境、角色與交易列表
- [https://ltc-ig.fhir.tw/2026-connectathon.html] 2026 長照專案聯測說明
- [https://github.com/Lorex/TWLongTermCare_IG_Build/] TW LTC IG 原始專案與授權

## 在宅急症照護資料交換

### 說明

在宅急症照護資料交換依據[https://www.nhi.gov.tw/ch/cp-15112-18d97-3660-1.html] 全民健康保險在宅急症照護試辦計畫之「住院替代服務」（Hospital-at-Home, HAH）模式，聚焦於急症感染個案之跨系統資訊整合與資料流轉。臨床流程涵蓋初次訪視與收案、持續訪視與急症治療，以及後續照護安排與交班三階段。醫療端與長照端透過標準單一資源之建立、條件查詢與單筆讀取機制，驗證在宅急症跨專業協同與轉銜之資訊互通能力。相關在宅行政與臨床資源可參考[https://ltc-ig.fhir.tw/hah.html] 在宅專題說明。

### 檢核項目

- 參測單位依所選角色實作初次訪視與收案之資料建立或查讀（情境 1，必測）
- 參測單位依所選角色與臨床職責實作持續訪視與急症治療之資料建立或查讀（情境 2，包含本次訪視與生理量測必測，並自處方給藥或在宅處置中擇一完成，檢驗為選測）
- 參測單位依所選角色實作後續照護安排與交班之資料建立或查讀（情境 3，包含照護計畫與照護交班必測，訪視工作指派為選測）

### 各系統角色於本主題之作用

 | Keyword | 名稱 | 說明
 | HAH_MANAGEMENT | HAH Creator | 在宅照護資料建立端，負責在各項在宅急症業務流程中發起單筆 FHIR 資源建立請求（POST），產出符合 HAH Profile 規範之收案、就診、診斷、評估、量測、處方、給藥、處置、計畫、任務與交班資源。
 | HAH_CONSUMER | HAH Consumer | 接續與協同照護端，負責向儲存端發起條件查詢（Search）與單筆讀取（Read）請求，檢索並核對指定個案之各階段臨床資料、訪視歷程與跨資源引用關聯。
 | HAH_REPOSITORY | HAH Repository | 在宅急症資料儲存端，負責接收來自 Creator 之 POST 請求，執行結構與條件驗證，回傳 HTTP 201 Created 與 Location 標頭，並支援 Consumer 進行條件查詢（HTTP 200 OK 與 searchset Bundle）及單筆讀取。

### 通過條件

- 參測單位依報名角色與臨床職責配對共同完成流程，大會逐交易與逐 Resource 記錄實作能力。
- 必測項目：
- 情境 1（SC1 初次訪視與收案）：必須完成 HAH-411 至 HAH-414，確立收案療程、整段照護脈絡與初次實地到宅訪視紀錄。
- 情境 2（SC2 持續訪視與治療）：必須完成 HAH-421 與 HAH-422（新訪視與生理量測），並自「HAH-423 與 HAH-424（處方與給藥紀錄）」或「HAH-427 與 HAH-428（在宅處置紀錄）」中至少擇一組完成。
- 情境 3（SC3 後續照護安排與交班）：必須完成 HAH-431 與 HAH-432（後續照護計畫）以及 HAH-435 與 HAH-436（照護交班紀錄）。
- 選測項目：
- HAH-415 與 HAH-416（初訪評估與急症診斷）：適用具備結構化醫師評估與診斷紀錄之系統。
- HAH-425 與 HAH-426（床側檢驗結果與報告）：適用配備即時檢驗儀器介接或檢驗資訊模組之系統。
- HAH-433 與 HAH-434（指派與查讀下一次訪視工作）：適用具備跨專業行動派案與工作排程管理之系統。
- 操作順序：初訪完成並決定收案後，先上傳療程與整段照護，再上傳記載實際初訪時間的訪視紀錄。
- 大會事前備妥 Patient、Organization、Practitioner、PractitionerRole 等基本資料及參照清單，本次測試主要受測資源由配對端新建。Creator 完成所選建立交易，Consumer 完成對應查詢與讀取，Repository 支援兩端操作。建立端每次請求送出單一 Resource JSON，由 Location 標頭取得伺服器實際資源 ID。查詢端以指定參數發起 Search 取得 searchset Bundle，再以本輪實際 ID 發起 Read 單筆資源，核對指定欄位與跨資源參照。

### 情境 (Scenarios)

 | 情境 ID | 說明 | 測試類別
 | SC1 | 初次訪視與收案 | 必測
 | SC2 | 持續訪視與治療 | 必測
 | SC3 | 後續照護安排與交班 | 必測

### 情境 1：初次訪視與收案

初次訪視與收案情境模擬個案出現急症狀況後，在宅醫療團隊前往個案家中進行初次訪視與評估。經醫師臨床判斷符合在宅急症收案標準並取得同意後，系統正式建立收案療程與在宅住院整段照護就診脈絡，接續上傳記載實際到離時間之初訪紀錄，以及醫師之初訪臨床評估與急症診斷。
本情境使用 EpisodeOfCare、Encounter、Condition 與 ClinicalImpression 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHEpisodeOfCare.html] HAHEpisodeOfCare、[https://ltc-ig.fhir.tw/StructureDefinition-HAHAdmissionEncounter.html] HAHAdmissionEncounter、[https://ltc-ig.fhir.tw/StructureDefinition-HAHVisitEncounter.html] HAHVisitEncounter、[https://ltc-ig.fhir.tw/StructureDefinition-HAHCondition.html] HAHCondition 及 [https://ltc-ig.fhir.tw/StructureDefinition-HAHClinicalImpression.html] HAHClinicalImpression Profile 規範。大會事前預載符合 [https://ltc-ig.fhir.tw/StructureDefinition-HAHPatient.html] HAHPatient、[https://ltc-ig.fhir.tw/StructureDefinition-Organization-twltc.html] HAHOrganization、[https://ltc-ig.fhir.tw/StructureDefinition-LTCPractitioner.html] HAHPractitioner 與 [https://ltc-ig.fhir.tw/StructureDefinition-LTCPractitionerRole.html] HAHPractitionerRole 之基本資料與參照清單。

### 資料儲存、管理功能（HAH_REPOSITORY 角色）

- 能夠接收來自在宅醫療端之收案療程、整段照護、訪視、診斷與臨床評估資源，遵循 FHIR R4 格式儲存並提供查詢。
- 支援以 POST 方式建立單筆資源，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取資料，成功時回傳 HTTP 200 OK 與單筆資源。

### 資料建立與查讀功能

HAH-411：建立收案與整段照護（HAH_MANAGEMENT 角色）
- 初訪完成並決定收案後，建立端依序發送兩筆 POST 請求建立行政基礎架構：
- 1. 發送 POST [base]/EpisodeOfCare，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHEpisodeOfCare.html] HAHEpisodeOfCare Profile。填寫 status（active）、type（代碼 acute-home，系統為 http://ltc-ig.fhir.tw/CodeSystem/hah-activity）、patient（參照預載 HAHPatient）、managingOrganization（參照預載 HAHOrganization）、療程識別碼 identifier.system 與 identifier.value，以及收案開始時間 period.start。伺服器建立成功回傳 HTTP 201 Created，由 Location 標頭取得實際 EpisodeOfCare ID。
- 2. 發送 POST [base]/Encounter，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHAdmissionEncounter.html] HAHAdmissionEncounter Profile。填寫 status（in-progress）、class（系統 http://terminology.hl7.org/CodeSystem/v3-ActCode，代碼 IMP）、type（代碼 acute-home）、subject（參照相同 HAHPatient）、serviceProvider（服務機構）、participant.individual（醫事人員）、實際照護開始時間 period.start，且 episodeOfCare 參照上一步取得之實際 EpisodeOfCare ID。伺服器建立成功回傳 HTTP 201 Created，由 Location 標頭取得實際 AdmissionEncounter ID。
HAH-412：查詢與讀取收案與整段照護（HAH_CONSUMER 角色）
- 查詢端檢索確認個案收案身分與在宅急症整段住院脈絡：
- 1. 條件查詢療程：發送 GET [base]/EpisodeOfCare?patient=Patient/{id}，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 2. 單筆讀取療程：選取 HAH-411 當次建立之 EpisodeOfCare ID，發送 GET [base]/EpisodeOfCare/{id}，核對個案、管理機構、status（active）、type（acute-home）與 period.start。
- 3. 條件查詢整段照護：發送 GET [base]/Encounter?subject=Patient/{id}&class=IMP，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 4. 單筆讀取整段照護：選取 HAH-411 當次建立之 AdmissionEncounter ID，發送 GET [base]/Encounter/{id}，核對 status（in-progress）、class（IMP）、subject、serviceProvider、participant、period.start，並確認 episodeOfCare 參照與當次 EpisodeOfCare ID 一致。
HAH-413：建立初次訪視紀錄（HAH_MANAGEMENT 角色）
- 建立端上傳醫師實地到宅初訪之就診歷程：
- 發送 POST [base]/Encounter，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHVisitEncounter.html] HAHVisitEncounter Profile。
- status 填入 finished。
- class 填入 http://terminology.hl7.org/CodeSystem/v3-ActCode#HH。
- type 填入 http://ltc-ig.fhir.tw/CodeSystem/hah-activity#visit。
- extension[mode] 填入 in-person。
- subject 參照個案 HAHPatient。
- serviceProvider 參照服務機構。
- participant.individual 參照主責醫師。
- period.start 與 period.end 填入初次到宅之實際起訖時間。
- episodeOfCare 指向 HAH-411 建立之實際 EpisodeOfCare ID。
- partOf 指向 HAH-411 建立之實際 AdmissionEncounter ID。
- 伺服器建立成功回傳 HTTP 201 Created，由 Location 標頭取得實際初訪 Encounter ID。
HAH-414：查詢與讀取初次訪視紀錄（HAH_CONSUMER 角色）
- 查詢端核對初次到宅就診細節與人員時間：
- 第一步條件查詢：發送 GET [base]/Encounter?subject=Patient/{id}&part-of=Encounter/{admission_id} 檢索訪視清單，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：選取 HAH-413 當次建立之 Visit Encounter ID，發送 GET [base]/Encounter/{id}，伺服器回傳 HTTP 200 OK 與單筆 Encounter 資源。
- 核對 status（finished）、訪視起訖時間（period.start、period.end）、主責醫師（participant）、服務機構（serviceProvider）、訪視方式（class 為 HH、mode 為 in-person）以及 episodeOfCare 與 partOf 關聯。
HAH-415：上傳初訪評估與診斷（HAH_MANAGEMENT 角色）
- 建立端上傳到宅醫師判斷之急症診斷與整體臨床評估：
- 1. 發送 POST [base]/Condition，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHCondition.html] HAHCondition Profile。填入 subject、clinicalStatus、verificationStatus、category、診斷代碼（如肺炎代碼）、recordedDate，且 encounter 指向 HAH-413 建立之初訪 Encounter ID。伺服器建立成功回傳 HTTP 201 Created 並取得實際 Condition ID。
- 2. 發送 POST [base]/ClinicalImpression，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHClinicalImpression.html] HAHClinicalImpression Profile。填入 subject、status（completed）、assessor（指向醫師）、effectiveDateTime 或 effectivePeriod、date、summary（評估文字摘要），且 encounter 指向 HAH-413 初訪 Encounter ID，problem 指向上一步建立之 Condition ID。伺服器建立成功回傳 HTTP 201 Created 並取得實際 ClinicalImpression ID。
HAH-416：查詢與讀取初訪評估與診斷（HAH_CONSUMER 角色）
- 查詢端查讀初次評估與急症問題：
- 1. 條件查詢診斷：發送 GET [base]/Condition?subject=Patient/{id}，自清單選取目標診斷發送 GET [base]/Condition/{id}。核對診斷代碼、clinicalStatus、verificationStatus、recordedDate 與初訪 encounter 參照。
- 2. 條件查詢臨床評估：發送 GET [base]/ClinicalImpression?subject=Patient/{id}，自清單選取目標評估發送 GET [base]/ClinicalImpression/{id}。核對評估狀態（completed）、評估人員（assessor）、評估時間、文字摘要（summary），並確認 encounter 指向初訪紀錄，且 problem 正確指向當次建立之 Condition ID。

### 情境 2：持續訪視與治療

持續訪視與治療情境模擬收案後之急性期照護進程。醫師與護理人員依排程或病情需要分次到宅訪視，每次到宅均視為獨立之單次訪視，統一掛載於同一整段照護之下。本情境涵蓋本次訪視與生命徵象量測、抗生素或輸液之處方開立與給藥執行、床側檢驗採檢與報告回傳，以及在宅醫療處置。
本情境使用 Encounter、Observation、MedicationRequest、MedicationAdministration、DiagnosticReport 及 Procedure 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHVisitEncounter.html] HAHVisitEncounter、[https://ltc-ig.fhir.tw/StructureDefinition-LTCObservationVitalSigns.html] HAHObservationVitalSigns、[https://ltc-ig.fhir.tw/StructureDefinition-HAHMedicationRequest.html] HAHMedicationRequest、[https://ltc-ig.fhir.tw/StructureDefinition-HAHMedicationAdministration.html] HAHMedicationAdministration、[https://ltc-ig.fhir.tw/StructureDefinition-HAHObservationLab.html] HAHObservationLab、[https://ltc-ig.fhir.tw/StructureDefinition-HAHDiagnosticReport.html] HAHDiagnosticReport 及 [https://ltc-ig.fhir.tw/StructureDefinition-HAHProcedure.html] HAHProcedure Profile 規範。

### 資料儲存、管理功能（HAH_REPOSITORY 角色）

- 能夠接收來自在宅醫療端之單次訪視、生理量測、處方、給藥、檢驗、處置等資源，遵循 FHIR R4 格式儲存並提供查詢。
- 支援以 POST 方式建立單筆資源，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取資料，成功時回傳 HTTP 200 OK 與單筆資源。

### 資料建立與查讀功能

HAH-421：建立本次訪視與生理量測（HAH_MANAGEMENT 角色）
- 醫護人員再次到宅訪視，建立獨立就診並記錄現場量測之生命徵象：
- 1. 發送 POST [base]/Encounter，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHVisitEncounter.html] HAHVisitEncounter Profile。建立新一筆訪視紀錄，partOf 指向同一 AdmissionEncounter ID，episodeOfCare 指向同一 EpisodeOfCare ID，status 填入 finished，class 為 HH，type 為 visit，extension[mode] 為 in-person，填寫 subject、serviceProvider、participant.individual 及 period.start、period.end。伺服器建立成功回傳 HTTP 201 Created 並取得本次訪視 Encounter ID。
- 2. 發送 POST [base]/Observation，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-LTCObservationVitalSigns.html] HAHObservationVitalSigns Profile。status 填入 final，category 為 vital-signs，代碼填入 LOINC 體溫代碼 8310-5，填入 effectiveDateTime、量測數值與 UCUM 計量單位（system 為 http://unitsofmeasure.org，code 為 Cel），subject 指向個案，且 encounter 指向本筆新建立之訪視 Encounter ID。伺服器建立成功回傳 HTTP 201 Created 並取得 Observation ID。
HAH-422：查詢與讀取本次訪視與生理量測（HAH_CONSUMER 角色）
- 查詢端查讀本次訪視內容與體溫等生命徵象數據：
- 1. 條件查詢訪視：發送 GET [base]/Encounter?subject=Patient/{id}&part-of=Encounter/{admission_id}，自清單選取 HAH-421 當次建立之訪視 ID 發送 GET [base]/Encounter/{id}。核對本次到訪起訖時間、醫事人員、機構、訪視方式以及所屬整段照護關聯。
- 2. 條件查詢生理量測：發送 GET [base]/Observation?subject=Patient/{id}&code=http://loinc.org|8310-5，自清單選取 HAH-421 當次建立之 Observation ID 發送 GET [base]/Observation/{id}。核對量測時間、體溫數值、計量單位（Cel）與本次訪視參照關聯。
HAH-423：上傳處方與給藥紀錄（HAH_MANAGEMENT 角色）
- 記錄醫師開立之處方與護理人員執行之在宅給藥或靜脈輸注（可由不同醫事資訊系統配對協同完成）：
- 1. 發送 POST [base]/MedicationRequest，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHMedicationRequest.html] HAHMedicationRequest Profile。填入處方狀態（status = active）、意圖（intent = order）、藥品品項、用法途徑、劑量、subject、authoredOn、requester（開立醫師）及 dosageInstruction.text，encounter 指向開立時之訪視 Encounter ID（可為先前醫師訪視或本次訪視）。伺服器建立成功回傳 HTTP 201 Created 並取得實際 MedicationRequest ID。
- 2. 發送 POST [base]/MedicationAdministration，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHMedicationAdministration.html] HAHMedicationAdministration Profile。status 填入 completed，request 指向上一步建立之 MedicationRequest ID，context 指向執行給藥之實際護理訪視 Encounter ID，performer.actor 指向執行護理人員，填寫 subject、藥品品項及 dosage.route。依測資擇一填寫：單次給藥（填寫 effectiveDateTime 與 dosage.dose）或點滴持續輸注（填寫 effectivePeriod 與 dosage.rateQuantity）。伺服器建立成功回傳 HTTP 201 Created 並取得實際 MedicationAdministration ID。
HAH-424：查詢與讀取處方與給藥紀錄（HAH_CONSUMER 角色）
- 查詢端查讀急症藥品醫囑與實際給藥執行明細：
- 1. 條件查詢處方：發送 GET [base]/MedicationRequest?subject=Patient/{id}，自清單選取 HAH-423 當次建立之處方 ID 發送 GET [base]/MedicationRequest/{id}。核對處方狀態、藥品、用法用量、開立時間、開立醫師與訪視參照。
- 2. 條件查詢給藥紀錄：發送 GET [base]/MedicationAdministration?subject=Patient/{id}，自清單選取 HAH-423 當次建立之給藥 ID 發送 GET [base]/MedicationAdministration/{id}。核對藥品品項、執行時間或輸注期間、途徑、劑量或流速、執行護理師（performer.actor），並確認 request 指向當次處方，且各自關聯至對應之訪視就診。
HAH-425：上傳檢驗結果與報告（HAH_MANAGEMENT 角色）
- 建立端上傳到宅採檢或床側檢驗數值與整合檢驗報告：
- 1. 發送 POST [base]/Observation，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHObservationLab.html] HAHObservationLab Profile。填寫 status（final）、category（laboratory）、code、effectiveDateTime 及一項檢驗數值。valueQuantity 填入數值、單位、UCUM 系統 http://unitsofmeasure.org 及單位代碼，subject 指向個案，encounter 指向當次訪視 Encounter ID。伺服器建立成功回傳 HTTP 201 Created 並取得實際 Observation ID。
- 2. 發送 POST [base]/DiagnosticReport，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHDiagnosticReport.html] HAHDiagnosticReport Profile。填入報告狀態（status = final）、報告項目代碼、effectiveDateTime、issued、報告人員（performer），subject 指向個案，encounter 指向當次訪視，且 result 參照上一步建立之 HAHObservationLab ID。伺服器建立成功回傳 HTTP 201 Created 並取得實際 DiagnosticReport ID。
HAH-426：查詢與讀取檢驗結果與報告（HAH_CONSUMER 角色）
- 查詢端查讀床側或送檢之檢驗數據與報告結論：
- 1. 條件查詢檢驗報告：發送 GET [base]/DiagnosticReport?subject=Patient/{id}，自清單選取 HAH-425 當次建立之報告 ID 發送 GET [base]/DiagnosticReport/{id}。核對報告項目名稱、簽發時間、報告人員與訪視關聯。
- 2. 條件查詢與讀取檢驗結果：發送 GET [base]/Observation?subject=Patient/{id}，自清單選取 HAH-425 當次建立之檢驗 ID 發送 GET [base]/Observation/{id}。核對檢驗項目名稱、數值、單位，並確認 DiagnosticReport.result 準確連結至該筆 Observation。
HAH-427：上傳在宅處置紀錄（HAH_MANAGEMENT 角色）
- 記錄到宅執行之醫療處置技術（如呼吸道抽痰處置）：
- 發送 POST [base]/Procedure，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHProcedure.html] HAHProcedure Profile。
- status 填入 completed。
- 處置代碼採用大會指定案例（如抽痰處置）。
- subject 指向個案。
- encounter 指向當次訪視 Encounter ID。
- performedDateTime 或 performedPeriod 填入處置時間。
- performer.actor 指向執行處置之醫事人員。
- 伺服器建立成功回傳 HTTP 201 Created 並取得 Procedure ID。
HAH-428：查詢與讀取在宅處置紀錄（HAH_CONSUMER 角色）
- 查詢端查讀在宅醫療處置項目與執行歷程：
- 第一步條件查詢：發送 GET [base]/Procedure?subject=Patient/{id}，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：選取 HAH-427 當次建立之 Procedure ID，發送 GET [base]/Procedure/{id}，伺服器回傳 HTTP 200 OK 與單筆 Procedure 資源。
- 核對處置項目名稱、執行時間、執行醫事人員（performer.actor）以及所屬訪視 Encounter 參照。

### 情境 3：後續照護安排與交班

後續照護安排與交班情境模擬當次訪視完成時，醫護人員為個案安排後續照護作為。系統建立接續照護計畫並記錄下次回訪時程與行動項目，指派下一位醫護人員之到宅訪視工作任務，並建立照護交班紀錄，傳遞目前病況、已完成治療項目以及下次訪視之臨床注意事項。
本情境使用 CarePlan、Task 及 Communication 資源，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHCarePlan.html] HAHCarePlan、[https://ltc-ig.fhir.tw/StructureDefinition-HAHVisitTask.html] HAHVisitTask 及 [https://ltc-ig.fhir.tw/StructureDefinition-HAHCommunication.html] HAHCommunication Profile 規範。若案例需關聯照護目標，可直接參照大會預載之 [https://ltc-ig.fhir.tw/StructureDefinition-HAHGoal.html] HAHGoal。

### 資料儲存、管理功能（HAH_REPOSITORY 角色）

- 能夠接收來自在宅醫療端之照護計畫、工作任務與交班紀錄，遵循 FHIR R4 格式儲存並提供查詢。
- 支援以 POST 方式建立單筆資源，成功時回傳 HTTP 201 Created 並於 Location 標頭回傳實際資源 ID。
- 支援以 GET 方式條件查詢資料，成功時回傳 HTTP 200 OK 與 searchset Bundle。
- 支援以 GET 方式單筆讀取資料，成功時回傳 HTTP 200 OK 與單筆資源。

### 資料建立與查讀功能

HAH-431：建立後續照護計畫（HAH_MANAGEMENT 角色）
- 醫護人員擬定下一階段在宅照護方針與活動安排：
- 發送 POST [base]/CarePlan，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHCarePlan.html] HAHCarePlan Profile。
- status 填入 active，intent 填入 plan，填入個案 subject、計畫類別 category 與執行期間 period。
- extension[episode] 參照本次建立之 HAHEpisodeOfCare ID。
- encounter 指向擬定計畫之當次訪視 Encounter ID。
- activity.detail 至少包含一筆活動明細，填寫 status、description（描述下次來訪事項）、scheduledPeriod（預定下次到訪時間）以及 performer（預定執行人員）。
- 若案例需關聯照護目標，可直接參照大會預載之 HAHGoal。
- 伺服器建立成功回傳 HTTP 201 Created 並取得實際 CarePlan ID。
HAH-432：查詢與讀取照護計畫（HAH_CONSUMER 角色）
- 查詢端查讀後續照護目標方針與下次訪視排程：
- 第一步條件查詢：發送 GET [base]/CarePlan?subject=Patient/{id}，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：選取 HAH-431 當次建立之 CarePlan ID，發送 GET [base]/CarePlan/{id}，伺服器回傳 HTTP 200 OK 與單筆 CarePlan 資源。
- 核對計畫期間、類別、療程關聯（extension[episode]）、訪視關聯（encounter），以及 activity.detail 內記錄之下次到訪預定時間（scheduledPeriod）、預定事項（description）與負責人員（performer）。
HAH-433：指派下一次訪視工作（HAH_MANAGEMENT 角色）
- 建立具體任務指派，明確派案何時由何人到宅服務：
- 發送 POST [base]/Task，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHVisitTask.html] HAHVisitTask Profile。
- status 填入 requested，intent 填入 order。
- code 使用 http://ltc-ig.fhir.tw/CodeSystem/hah-activity 之 visit 代碼。
- for 指向個案 HAHPatient。
- authoredOn 填入開立時間。
- requester 指向派工者（當次訪視人員）。
- owner 指向預定到宅之執行人員或照護團隊。
- encounter 指向安排此工作之當次訪視 Encounter ID。
- focus 指向 HAH-431 建立之 CarePlan ID。
- restriction.period 填入預定執行之未來時間區間。
- 伺服器建立成功回傳 HTTP 201 Created 並取得實際 Task ID。
HAH-434：查詢與讀取待執行訪視工作（HAH_CONSUMER 角色）
- 接案醫護人員檢索指定個案待執行之訪視任務，核對負責人員或團隊：
- 第一步條件查詢：發送 GET [base]/Task?patient=Patient/{id}&status=requested 檢索工作清單，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：選取 HAH-433 當次建立之 Task ID，發送 GET [base]/Task/{id}，伺服器回傳 HTTP 200 OK 與單筆 Task 資源。
- 核對指派對象（owner）、指派者（requester）、預定到宅執行時間（restriction.period）、當次訪視關聯（encounter），並確認 focus 正確參照至前述照護計畫。
HAH-435：建立照護交班紀錄（HAH_MANAGEMENT 角色）
- 本次訪視人員向下一班或協同醫護人員傳達結構化交班資訊：
- 發送 POST [base]/Communication，遵循 [https://ltc-ig.fhir.tw/StructureDefinition-HAHCommunication.html] HAHCommunication Profile。
- status 填入 completed。
- category 填入交班代碼（system 為 http://ltc-ig.fhir.tw/CodeSystem/hah-activity，code 為 handover）。
- subject 指向個案 HAHPatient。
- sender 指向本次交班人員。
- recipient 指向接收交班人員或團隊。
- sent 填入交班發送時間。
- encounter 指向當次訪視 Encounter ID。
- basedOn 指向 HAH-431 建立之 CarePlan ID。
- payload.contentString 填入交班摘要文字（包含目前病況摘要、本次已完成治療、下次訪視注意事項）。
- 伺服器建立成功回傳 HTTP 201 Created 並取得實際 Communication ID。
HAH-436：查詢與讀取照護交班紀錄（HAH_CONSUMER 角色）
- 接班或協同醫護人員讀取個案之最新交班事項：
- 第一步條件查詢：發送 GET [base]/Communication?subject=Patient/{id}&category=handover 檢索交班紀錄，伺服器回傳 HTTP 200 OK 與 searchset Bundle。
- 第二步單筆讀取：選取 HAH-435 當次建立之 Communication ID，發送 GET [base]/Communication/{id}，伺服器回傳 HTTP 200 OK 與單筆 Communication 資源。
- 核對發送者（sender）、接收者（recipient）、交班時間（sent）、交班文字內容（payload.contentString）、當次訪視關聯（encounter）與計畫關聯（basedOn）。

### 交易 (Transactions)

 | 交易 ID | 說明 | 發送方 (From) | 接收方 (To)
 | HAH-411 | 建立收案與整段照護 | 在宅醫療端 (HAH_MANAGEMENT) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-412 | 查詢與讀取收案與整段照護 | 接續照護端 (HAH_CONSUMER) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-413 | 建立初次訪視紀錄 | 在宅醫療端 (HAH_MANAGEMENT) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-414 | 查詢與讀取初次訪視紀錄 | 接續照護端 (HAH_CONSUMER) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-415 | 上傳初訪評估與診斷 | 在宅醫療端 (HAH_MANAGEMENT) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-416 | 查詢與讀取初訪評估與診斷 | 接續照護端 (HAH_CONSUMER) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-421 | 建立本次訪視與生理量測 | 在宅醫療端 (HAH_MANAGEMENT) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-422 | 查詢與讀取本次訪視與生理量測 | 接續照護端 (HAH_CONSUMER) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-423 | 上傳處方與給藥紀錄 | 在宅醫療端 (HAH_MANAGEMENT) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-424 | 查詢與讀取處方與給藥紀錄 | 接續照護端 (HAH_CONSUMER) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-425 | 上傳檢驗結果與報告 | 在宅醫療端 (HAH_MANAGEMENT) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-426 | 查詢與讀取檢驗結果與報告 | 接續照護端 (HAH_CONSUMER) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-427 | 上傳在宅處置紀錄 | 在宅醫療端 (HAH_MANAGEMENT) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-428 | 查詢與讀取在宅處置紀錄 | 接續照護端 (HAH_CONSUMER) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-431 | 建立後續照護計畫 | 在宅醫療端 (HAH_MANAGEMENT) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-432 | 查詢與讀取照護計畫 | 接續照護端 (HAH_CONSUMER) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-433 | 指派下一次訪視工作 | 在宅醫療端 (HAH_MANAGEMENT) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-434 | 查詢與讀取待執行訪視工作 | 接續照護端 (HAH_CONSUMER) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-435 | 建立照護交班紀錄 | 在宅醫療端 (HAH_MANAGEMENT) | 長照資料交換中心 (HAH_REPOSITORY)
 | HAH-436 | 查詢與讀取照護交班紀錄 | 接續照護端 (HAH_CONSUMER) | 長照資料交換中心 (HAH_REPOSITORY)

### 官方規格與參考資料

資料來源：臺灣長期照顧實作指引（TW HAH IG），發布單位為經濟部產業發展署；本頁依 2026 年賽道頁面（STU 1.1.0，產生日期 2026-09-29）整理，核對日期為 2026-10-09。
依官方原始專案所列 [https://creativecommons.org/licenses/by/4.0/] CC BY 4.0 授權轉載賽道內容，並調整章節、清單及表格格式以配合 TW CAT 網站版型；未改動測試要求。
- [https://ltc-ig.fhir.tw/2026-track4.html] 在宅急症照護資料交換 官方完整規格
- [https://ltc-ig.fhir.tw/2026-connectathon-table.html] 2026 情境、角色與交易列表
- [https://ltc-ig.fhir.tw/2026-connectathon.html] 2026 長照專案聯測說明
- [https://github.com/Lorex/TWLongTermCare_IG_Build/] TW HAH IG 原始專案與授權
