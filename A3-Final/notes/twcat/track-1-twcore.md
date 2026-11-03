<!-- source: https://twcat.dicom.org.tw/track-list/1 -->
2026 台灣聯測松

[/main] [/] 最新消息[/introduction] 簡介[/specification] 規格與資源[/track-list] 賽道
證書資訊
[/certificate] 證書申請[/product-confirm] 證書發放[/official-result] 聯測結果[/member] 督察員[/track-list/ltc/5] 長照聯測松[/recruit] 招募
歷史活動
[https://twcat.dicom.org.tw/ihe] 2026 亞太聯測松[https://twcat.dicom.org.tw/main] 2026 台灣聯測松[https://mitw.dicom.org.tw/2025/] 2025 亞太 IHE 聯合聯測松[https://mitw.dicom.org.tw/2024/] 2024年 MI-TW 聯測工作坊[https://mitw.dicom.org.tw/2023/] 2023年 MI-TW 聯測工作坊[https://mitw.dicom.org.tw/2022/] 2022年 MI-TW 聯測工作坊[https://mitw.dicom.org.tw/2021/] 2021年 MI-TW 聯測工作坊[https://mitw.dicom.org.tw/2020/] 2020年 MI-TW 聯測工作坊[https://ievents.iii.org.tw/JoinPNew.aspx?t=0&id=3493] 長照聯測報名

01台灣核心實作指引
02癌症用藥事前審查
03網路使用者授權
04國際病人摘要← 返回聯測總覽

賽道 #1
#1 TWCORE
[#summary] 簡介 (Summary)
[#benefits] 效益 (Benefits)
[#details] 詳細資訊 (Details)
[#systems] 涉及系統 (Systems Affected)
[#spec] 規格 (Specification)
[#scenarios] 測試情境 (Scenario)
[#see-also] 其他 (See Also)
[#working-group] 工作小組

簡介 (Summary)▼←

# #1 台灣核心實作指引

## 簡介 (Summary)

本賽道為TW Core IG之國家級驗證賽道，目的在於驗證系統或應用程式是否具備將「非FHIR之結構化醫療資料」轉換為符合TW Core Profiles的FHIR資料 (FHIRize)」的能力。本賽道不評比醫院導入專案經驗，亦不要求既有HIS /EHR系統全面改造，而是以第三方可重現、可驗證的資料轉換能力為核心，檢驗App或系統是否能達到以下目的:
- 正確理解TWCDI所定義之「核心資料欄位與語意」
- 依據TW Core Profiles的結構與限制，產生合規之FHIR JSON格式
- 使用可驗證的方式 (FHIR Validator)證明其轉換結果符合規範
本賽道在回應並釐清以下三個關鍵問題:
- TWCDI (Core Data for Interoperability)如何實際落地為可交換的資料？
- TW Core Profiles是否具備實際可實作性與一致性？
- 資料轉換是否能由第三方公平、可重複地實作與驗證？
- 測試版本: 台灣核心實作指引 1.0.0 (TWCDI V2.0)

## 效益 (Benefits)

本賽道的效益如下:
- 建立TW Core IG的「實作可驗證性」： 透過標準化測試案例與驗證機制，確認TW Core Profiles並非僅為規格文件，而是可被實際實作與驗證的技術標準。
- 降低醫療系統FHIR化門檻： 允許以半結構文件，例如: JSON等格式作為輸入，降低既有系統進行FHIR化 (FHIRize)的技術門檻。
- 確保資料轉換的一致性與可重複性： 同一筆輸入資料，經不同廠商轉換後，應產生結構與語意一致的TW Core FHIR資料，避免各自解讀規範。
- 支援國際互通與後續應用： 符合HL7 FHIR與國際代碼系統 (LOINC、SNOMED CT)之使用原則，為IPS、SMART App、CDS等應用奠定基礎。
- 提供政策單位客觀的技術回饋： 透過實測結果，回饋TW Core IG在設計上是否存在過度限制、不合理綁定或實作困難之處。

## 詳細資訊 (Details)

本賽道之驗證資源範圍以TW Core IG所定義之核心資源 (Core Resources)為主。主辦單位提供非FHIR之標準化輸入資料格式，由參賽系統或應用程式進行資料轉換，產生符合TW Core Profiles之FHIR JSON。驗證重點為:
- 是否正確套用對應之TW Core Profile
- 必填欄位是否完整
- 值集與代碼系統是否正確 (TW ValueSets/LOINC/SNOMED CT)
- 產出之FHIR JSON是否可通過TW Core IG對應版本之FHIR Validator
- 輸入資料形式:
- Simplified JSON (主要測試格式)
- 結構化欄位表 (欄位名稱, 型別, 值)
- 非結構化資料 (保留為未來擴充情境，不列入本次評測)

## 涉及系統 (Systems Affected)

本賽道不要求完整醫院HIS/EHR系統導入，亦不作為醫院專案成熟度評比。本賽道並非在比那個醫院/業者做得多，而是確認:
TW Core到底能不能被公平、可驗證地實作
因此評測重點聚焦於資料轉換與互通能力，涉及但不限於以下系統類型:
- FHIR Converter/Middleware: 將既有結構化資料轉換為TW Core FHIR
- 醫療應用程式 (Apps): 包含未直接連接EHR的第三方App
- FHIR Server/平台: 用於驗證轉換後資料的結構與合規性
- 資料分析與整合工具 需接收標準化TW Core FHIR資料進行後續處理

## 規格 (Specification)

以下為預計測試的TW Core Profiles，依據特性區分為四大模組

### 管理 (Administration)模組

- 臺灣核心-照護團隊 (TW Core CareTeam)
- 臺灣核心-植入式裝置 (TW Core Implantable Device)
- 臺灣核心-地點 (TW Core Location)
- 臺灣核心-機構 (TW Core Organization)。包含以下特定規範:
- 臺灣核心-政府機構 (TW Core Organization Government)
- 臺灣核心-醫事機構 (TW Core Organization Hospital Department)
- 臺灣核心-公司行號 (TW Core Organization Company)
- 臺灣核心-病人 (TW Core Patient)
- 臺灣核心-健康照護服務提供者 (TW Core Practitioner)
- 臺灣核心-健康照護服務提供者角色 (TW Core PractitionerRole)

### 臨床 (Clinical)模組

### 流程 (Workflow)

- 臺灣核心-就醫事件 (TW Core Encounter)
- 臺灣核心-照護計畫 (TW Core CarePlan)
- 臺灣核心-目標 (TW Core Goal)

### 臨床 (Clinical)

- 臺灣核心-過敏或不耐症 (TW Core AllergyIntolerance)
- 臺灣核心-病情、問題或診斷 (TW Core Condition)
- 臺灣核心-處置或手術 (TW Core Procedure)
- 臺灣核心-檢體 (TW Core Specimen)

### 觀察與量測 (Observation & Measurement)

臺灣核心-觀察(TW Core Observation): 依據不同的資料性質與使用情境，分成以下6大情境:

 | 用情境分類 | 對應Profiles
 | 臨床生命徵象與生理量測 | 分成以下三大類: (1) 生命體徵 (Vital Signs)、 (2)身體量測 (Body Measurement)、及 (3)兒童生長發育 (Pediatric Growth)。詳細Profile請參考 臨床檢驗與診斷結果分類說明。
 | 臨床檢驗與診斷結果 | 臨床檢驗檢查 (Clinical Result)、實驗室檢驗檢查 (Laboratory Result)、心電圖 (ECG)、通用檢驗檢查 (Simple Observation)
 | 病人自述與生活型態資料 | 吸菸狀態 (Smoking Status)、性傾向 (Sexual Orientation)、職業 (Occupation)
 | 生殖健康與生命階段狀態 | 妊娠狀態 (Pregnancy Status)、妊娠計畫 (Pregnancy Intent)
 | 健康篩檢與評估結果 | 健康狀態篩檢與評估 (Screening Assessment)
 | 照護偏好與醫療決策意向 | 病人照護偏好註記 (Care Experience Preference)、病人治療偏好註記 (Treatment Intervention Preference)

### 臨床檢驗與診斷結果分類說明

- 生命體徵 (Vital Signs)
- 血壓 (Blood Pressure)
- 平均血壓 (Average Blood Pressure)
- 心率 (Heart Rate)
- 呼吸速率 (Respiratory Rate)
- 體溫 (Body Temperature)
- 脈搏血氧飽和度 (Pulse Oximetry)
- 身高 (Body Height)
- 體重 (Body Weight)
- 身體質量指數 (BMI)
- 頭圍 (Head Circumference)
- 兒童及青少年身體質量指數 (Pediatric BMI for Age)
- 兒童生長曲線 (Pediatric Weight for Height)
- 兒童頭圍百分位數 (Pediatric Head Circumference Percentile)

### 診斷 (Diagnostics)模組

- 臺灣核心-診斷報告 (TW Core DiagnosticReport)
- 臺灣核心-影像檢查 (TW Core ImagingStudy)

### 藥物 (Medications)模組

- 臺灣核心-藥品(TW Core Medication)
- 臺灣核心-藥品請求 (TW Core MedicationRequest)
- 臺灣核心-配藥或藥品調劑 (TW Core MedicationDispense)
- 臺灣核心-用藥聲明 (TW Core MedicationStatement)
- 臺灣核心-疫苗接種 (TW Core Immunization)

### 測試資料設計

- 測試資料的設計理念為「以情境為核心，結合資料、系統與標準驗證的FHIR測試與認證框架」。測試資料產生由[https://github.com/cylab-tw/fhirfox] FHIRfox: 合成式FHIR醫療資料集開源專案提供，目的在於建立一套類似醫院資訊系統 (HIS)的資料庫，並支援FHIR資料轉換、測試與互通性驗證。FHIRfox提供已預先生成之合成醫療資料，模擬真實臨床流程，包含:
- 門診、急診、住院
- 多科別就醫情境(心臟科、小兒科、骨科等)
- 病人長期就醫歷程
- 檢驗、診斷、用藥與影像等臨床資料
- 下圖為本賽道設計之測試資料與驗證流程說明。參測者須通過所有測試案例提供的模擬資料，並轉換成符合TW Core Profile的FHIR資料。模擬資料庫包含資料集 (Dataset)以及代碼對照表 (Code Mapping)，資料庫採用關聯式資料庫設計，並以TW Core IG定義的各種Profile組合成不同等級的測試案例。若是要產生指定的模擬情境，則可透過測試情境樣板設定產生輸入資料(JSON)。再搭配設計的簡易轉換樣板 (即FHIR Converter Template)，將輸出資料轉換成符合TW Core Profile的FHIR標準答案。
- 轉換樣板採用插件方式，可擴充各種FHIR IG規範的各種表單以及各式資料。由開源貢獻者提供各種轉換樣板做為日後擴充使用。例如: FHIR癌症用藥事前審查、國際病人摘要、電子處方箋等各種交換格式。
- 透過FHIRfox產生FHIR標準答案後，將產生的FHIR答案上傳至聯測測FHIR Server，將測試結果使用驗證工具來驗證系統產生的FHIR資料是否符合標準答案，用來驗證系統是否具備FHIR轉換能力。最後產生測試報告檢驗是否參測的系統針對所有的測試案例均能產出正確的結果，作為聯測前的驗證測試使用。
- 參測者可依據自己開發系統的特性將輸入資料 (JSON)進行再加工處理，例如:轉換成CSV格式、轉換成資料庫等，以符合不同系統支援的規格與設計。驗證工具會依照輸出的FHIR標準答案依照測試案例編號逐一比對測試系統產生的FHIR資料是否正確。
- 輸入資料JSON設計概念為反應常見醫院實際的FHIR轉換流程。系統大部分的情況是接收從HIS或EMR系統，資料為「簡化資料格式」而非FHIR格式，因此透過此設計可以降低實作者門檻、且模擬HIS原始資料、以及作為轉換資料的對應輸入。因此測試的重點在於能不能把簡化的JSON格式轉成FHIR格式的能力。

### 測試資料核心概念

以下為測試資料核心概念，主要目的分成三個層次，作為驗證系統具備TW Core IG實作能力等級區分。
- 檢核基準: 產品/系統若為具備人機介面，則需提供測試資料輸入至介面，並完成測試規範。系統為轉換器 (FHIR Converter)需提交前測報告，並通過自動驗證測試腳本。以下為驗證的目的:
- (1)驗證單一資源轉換能力: 驗證系統是否具備單一基礎TW Core資源轉換能力
- (2)驗證連結參考資源驗證轉換能力 (Link to referenced resources): 驗證系統是否具備FHIR資源連接參考資源能力
- (3)驗證國際代碼轉換能力 (即:院內碼轉國際代碼): 驗證系統是否具備國際代碼轉換能力

## 測試情境

下圖為設計情境架構，將測試情境分成五個等級，透過輸入資料產出標準測試資料集提供參測者使用。測試資料內容包含:TWCDI設計內涵，即:TWCDI定義的欄位，盡可能包含在測試資料集。四大模組的資料亦包含在測試資料集中。另外，提供常見的國際代碼測試對照表，用來模擬系統是否具備國際代碼轉換能力。參測者可透過此測試情境的設計用來檢驗自我產品或系統是否符合TW Core能力聲明證明，依照認證模組、資源能力、代碼能力、以及情境等級等，檢驗產品自身的TW Core Profile的轉換能力。
說明: TW Core測試情境等級#4與#5不列入2026年聯測範圍，未來規畫擴充將納入未來的聯測資料中。

### 測試情境設計概念

每個情境包含的FHIR Resource，並搭配不同的變化維度，用來產生以測試為目的(testing purpose)的測試資料。Resource欄位選用作法原則如下:
- 規則1: TWCDI定義的欄位
- 規則2: TW Core Profile的邏輯模型定義的欄位
- 規則3: 每個TW Core Profile定義的必填欄位

### 測試情境整體分層架構

TW Core測試情境分成五個等級，採取「漸進式測試模型」，產生以「情境模式資料集 (Scenario-driven Dataset)」檢驗參測系統的TW Core FHIR化能力。
每個等級的資料採取累加設計，等級越高，則代表要處理的FHIR Resource越多，關聯的Resoure結構越複雜。

 | 層級 | 名稱 | 補充
 | Level 1 | 基本就醫紀錄 (Core Patient Journey) | 基本的就醫資訊
 | Level 2 | 臨床處置與紀錄 (Clinical Basic) | 病人就醫後進行的處置以及問診、觀察、與量測
 | Level 3 | 用藥與檢查 (Medication & Examination) | 醫師開立的藥物處方以及檢查 (影像、LAB)等措施
 | Level 4 | 診斷與檢驗整合 (Diagnostic Layer) | 進一步的影像檢查、檢驗報告(套餐)、基因檢測等。**不在2026聯測範圍**
 | Level 5 | 全人照護紀錄: 跨院/慢性病/追蹤 (Complex Care) | 病患為核心的歷次健康紀錄串聯。**不在2026聯測範圍**
- [https://cylab-tw.github.io/fhirfox/] 測試沙盒

### 測試情境 LEVEL 1: 基礎就醫紀錄

- 概念說明 (LEVEL 1)
- Level 1為FHIRfox測試資料的最基本層級，目標是建立一組最小可用 (Minimum Viable)且符合臨床情境的就醫紀錄資料，用以模擬HIS中的就醫流程。本層級至少涵蓋以下FHIR Resource:
- 臺灣核心-病人 (TW Core Patient): 提供病人基本資料
- 臺灣核心-機構 (TW Core Organization): 就醫的醫事機構
- 臺灣核心-就醫事件 (TW Core Encounter): 就醫事件(門診/急診/住院)
- 臺灣核心-病情、問題或診斷 (TW Core Condition) Condition: 主訴與診斷
- 臺灣核心-健康照護服務提供者 (TW Core Practitioner): 參與的醫事人員
- 臺灣核心-健康照護服務提供者角色 (TW Core PractitionerRole): 參與的醫事人員與角色
- 測試目的 (LEVEL 1)
- 本層級測試情境設計的目為建立最小可用FHIR資料集，提供一組最基本但完整的臨床資料結構，使系統能夠:正確建立病人(Patient)且記錄就醫事件(Encounter)、並在就醫事件中紀錄病人以及醫事人員 (Practitioner、PractitionerRole)，例如: 掛號資訊。
- 此外，此測試情境提供驗證HIS轉換FHIR基本轉換能力，確保不同系統之間能正確交換最基本的醫療資訊，作為模擬傳統HIS資料轉換為FHIR Resource的最核心流程:
- (1) 病人識別: 病人資料對應 (Patient mapping)
- (2) 就醫事件追蹤: 就醫紀錄轉換 (Encounter mapping)
- 本層級應涵蓋以下基本就醫情境 (但不侷限):
- 門診: 一般看診
- 急診: 突發症狀
- 住院: 需留院治療

 | 測試編號 | 名稱 | 補充
 | TWCORE-OPD-001 | 一般門診(成人) | 
 | TWCORE-OPD-002 | 小兒門診 | 
 | TWCORE-OPD-003 | 同病人多次門診 | 
 | TWCORE-ER-001 | 急診 | 
 | TWCORE-IPD-001 | 住院 | 

### 測試情境 LEVEL 2: 臨床處置與紀錄

- 概念說明 (Level 2)
- Level 2在Level 1的基礎上，進一步加入臨床檢驗 (Observation)與醫療處置 (Procedure)，用以模擬門診、急診與住院中常見的醫療行為，使 FHIR 資料具備「臨床可讀性」與「數據化能力」，並能表達臨床問題 (Condition)，例如:過敏或不耐症 (AllergyIntolerance)。本層級特別強調檢驗資料的完整性與臨床關聯性，包含生命徵象與實驗室檢查，主要關注如下:
- (1) 檢驗資料的結構化表達 (Observation)
- (2) 臨床數據與就醫事件 (Encounter)的關聯
- (3) 基本醫療行為 (Procedure)的紀錄
- (4) 臨床問題轉換 (Condition mapping)
- (5) 檢驗結果與診斷之間的臨床合理性
- 本層級應涵蓋以下基本就醫情境 (但不侷限):
- 門診: 一般看診 (如感冒、慢性病追蹤)，包含基本檢驗 (如體溫、血壓)
- 急診: 突發症狀 (如胸痛、外傷)，包含即時檢驗 (如血氧、心跳)
- 住院: 需留院治療 (如手術或觀察)，包含持續性檢驗(如每日生命徵象、實驗室數據)
- 測試目的 (LEVEL 2)
- (1) 驗證臨床檢驗資料轉換能力: 確保系統可將HIS檢驗資料正確轉換為FHIR Observation，例如:
- 生命徵象: 血壓(BP)、心跳 (HR)、體溫 (Temp)、呼吸速率 (RR)、血氧 (SpO2)
- 實驗室檢驗: 血液檢查 (BC、血糖)、尿液檢查 (Urinalysis)
- (2) 建立臨床資料與就醫情境的關聯: 驗證Observation/Procedure是否能正確關聯:
- (3) 驗證基本醫療處置紀錄能力: 模擬實際臨床流程，例如: 注射、傷口處理、以及基本醫療操作等
- (4) 測試資料結構與數值格式: 確保系統能正確處理，例如: 數值型資料(valueQuantity)、單位(unit)、以及檢驗時間 (effectiveDateTime)等
- 本層級除了LEVEL 1包含的FHIR Resource以外，至少涵蓋以下FHIR Resource:
- 臺灣核心-過敏或不耐症 (TW Core AllergyIntolerance)
- 臺灣核心-病情、問題或診斷 (TW Core Condition)
- 臺灣核心-處置或手術 (TW Core Procedure)
- 臺灣核心-觀察 (TW Core Observation)

 | 層級 | 名稱 | 補充
 | TWCORE-OPD-004 | 一般門診(成人) | 延續 Level 1，加入生命徵象(BP、HR)與簡單檢驗(如血糖)
 | TWCORE-OPD-005 | 小兒門診 | 延續 Level 1，加入體溫(Temp)、體重、基本檢驗
 | TWCORE-OPD-006 | 同病人多次門診 | 延續 Level 1，加入多次檢驗紀錄(趨勢資料，如血壓追蹤)
 | TWCORE-ER-002 | 急診 | 延續 Level 1，加入即時檢驗(SpO2、HR)與緊急處置
 | TWCORE-IPD-002 | 住院 | 延續 Level 1，加入連續性檢驗(每日 vital signs、實驗室檢查)

### 測試情境 LEVEL 3: 用藥與檢查

- 概念說明 (Level 3)
- 本層級除延續Level 2的Observation(單一檢驗數值)外，進一步加入「檢查報告型資料」，如實驗室檢驗報告(DiagnosticReport)、影像報告與病理報告，使資料從「單點數值」提升為「臨床判讀結果」，更貼近實際醫療流程。此層級重點在於:
- 用藥資訊的結構化
- 診斷與用藥之間的關聯
- 加入檢查(影像報告、實驗室檢驗報告(例如: 檢查套組)、病理檢查、等)
- 測試目的 (LEVEL 3)
- 本測試情境的目的說明如下:
- (1) 驗證用藥資料轉換能力: 確保開立的藥物處方資料可正確轉為FHIR格式。
- (2) 建立診斷與用藥的臨床關聯: 開立藥物處方後用來驗證處方箋、調劑紀錄、用藥、以及藥物資訊的關係是否正確對應。
- (3) 模擬實際臨床用藥情境: 驗證不同開立藥物的情境，包含:單一處方 (例如止痛藥)、急性用藥(感冒藥)、慢性用藥(高血壓)、同時開立多種藥物等。
- (4) 驗證用藥代碼與標準: 測試藥物的代碼與內容是否符合TW Core Profile，例如: 藥品代碼(健保碼/ATC)、劑量與單位等。以下是常見的欄位
- 藥品代碼(code)
- 藥品名稱(display)
- 劑量(dosage)
- 頻率(frequency)
- 用藥天數(duration)
- 開立時間(authoredOn)
- 單位(unit)
- (5) 驗證檢查報告整合能力: 確保系統可將多筆Observation正確整合為DiagnosticReport，並與Encounter與 Condition建立關聯。
- 本層級除了LEVEL 1與LEVEL 2包含的FHIR Resource以外，至少涵蓋以下FHIR Resource:
- 臺灣核心-診斷報告 (TW Core DiagnosticReport)
- 臺灣核心-藥品(TW Core Medication)
- 臺灣核心-藥品請求 (TW Core MedicationRequest)

 | 層級 | 名稱 | 補充(升級版)
 | TWCORE-OPD-007 | 一般門診(成人) | 感冒情境:生命徵象 + CBC + 開立感冒藥
 | TWCORE-OPD-008 | 小兒門診 | 發燒情境:體溫 + CBC + 尿液檢查 + 退燒藥
 | TWCORE-OPD-009 | 同病人多次門診 | 慢性病(高血壓/糖尿病):多次Observation + HbA1c + 長期用藥
 | TWCORE-ER-003 | 急診 | 胸痛:ECG(可簡化)、Troponin + CXR報告 + 緊急用藥
 | TWCORE-IPD-003 | 住院 | 手術/住院:每日vital + Lab panel + 病理報告 + 多重用藥
 | IPS_TWCORE-OPD-010 | 多次單一門診 | 門診/單一門診 + 開立藥物處方箋 + 多次檢驗數據
 | IPS_TWCORE-OPD-011 | 多次複合門診 | 不同專科門診 + 開立藥物處方箋 + 多次檢驗數據
 | IPS_TWCORE-MIX-001 | 多次門診與急診 | 多次單一門診/急診 + 多次檢驗數據
 | IPS_TWCORE-MIX-002 | 多次複合門診與急診 | 多次複合門診/急診 + 多次檢驗數據
 | IPS_TWCORE-MIX-003 | 多次門診與住院手術 | 多次門診與住院 + 多次檢驗數據 + 手術

## 其他 (See Also)

- [https://twcore.mohw.gov.tw/ig/twcore] 台灣核心實作指引
- [https://github.com/cylab-tw/fhirfox] FHIRfox-模擬醫院資訊系統(HIS)的合成式FHIR醫療資料集

## 工作小組

### 召集人
- 連中岳 ↗| 國立臺北護理健康大學 資訊管理系 副教授

### 成員
- 李祥豪 ↗| 台灣醫學資訊學會 理事
- 楊宇凡 ↗| 矽塔資訊服務有限公司 執行長
- 龔筠庭 ↗| 台灣FHIR開源社群

### 測試資料小組
- 國立臺北護理健康大學資訊管理系: 楊斯惟、范凱筌、張雯柔、李德真
