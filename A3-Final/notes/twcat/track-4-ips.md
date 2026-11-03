<!-- source: https://twcat.dicom.org.tw/track-list/4 -->
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

賽道 #4
#4 IPS
[#summary] 簡介 (Summary)
[#benefits] 效益 (Benefits)
[#details] 詳細資訊 (Details)
[#systems] 涉及系統 (Systems Affected)
[#spec] 規格 (Specification)
[#scenarios] 測試情境 (Scenario)
[#see-also] 其他 (See Also)
[#working-group] 工作小組

簡介 (Summary)▼←

# #4 國際病人摘要

## 簡介 (Summary)

FHIR國際病人摘要 (International Patient Summary, IPS)的目的在提供跨國界、跨機構的病人健康資料交換，設計用於在不同的醫療機構之間分享病人的核心健康資訊，確保病人能在旅途中或移居時得到連續的醫療照護，提供一個通用的解決方案，提高跨境醫療保健的可及性和高品質的「商業模式」。
在特定情境，例如:國際移工、留學與旅遊醫療等，電子病歷跨境交換存在極大的需求。根據國發會統計: 2021年國人赴海外工作人數計31.9萬人、2022年度台灣大專院校境外學生約為10.3萬人、2022年台灣境內總外國移工人數為72.8萬人。
- 電子健康照護需除了既有的境內照護以外，仍需涵蓋數量龐大的國際跨境移動的需求，以確保健康照護品質。
- 在COVID-19期間，由歐盟提出的數位COVID證明 (Digital COVID Certificate, EUDCC)以及Smart Health Card (SHC)提供國際旅客證明COVID-19疫苗接種、檢驗以及染疫證明等即為一個非常經典的跨國電子健康紀錄的交換實際案例，透過此機制能大量降低旅客跨境檢測成本以及確保健康旅客能跨境旅行。
本賽道承襲國內數位新冠病毒健康證明的實作經驗，考量絕大多數領域仍缺乏跨國之間的各種電子健康紀錄交換機制，本賽道將與[https://cylab-tw.github.io/ap-ips/en/] 亞太國際病人摘要聯盟合作，作為跨境的電子健康紀錄交換之基礎設施。以符合EN 17269、ISO 27269的規定，滿足「計劃外的跨境照護 (unplanned cross-border care)」之使用情境。提供電子病歷實現國際化，完成跨境照護的品質和可及性 (accessibility)，透過聯測架構，驗證IPS內容的正確性，來消除跨境照護 (Cross-Border Care)的障礙，並優化整體的醫療可及性以及提高照護品質。

### IPS整合健康數位皮夾

### 亞太綠色按鈕 (Asia Pacific Green Button)

一鍵點擊，您的國際病人摘要 (IPS)，隨行亞太各地
One Click, Your IPS, Anywhere in Asia-Pacific
- 亞太綠色按鈕是一項以病人為中心、基於標準的數位存取機制，使個人能夠在亞太地區安全地存取、下載並分享IPS。其設計支援可信的跨境健康資訊交換，賦予病人權限，授權將其關鍵臨床資料用於醫療照護提供、緊急治療及藥物調劑。
- 亞太綠色按鈕符合由世界衛生組織 (WHO)、國際HL7協會、IHE及區域性數位健康倡議所推廣的國際互通性原則。亞太綠色按鈕是一項「一鍵式」機制，允許病人執行以下操作:
- 下載個人的IPS
- 可以支援儲存於數位健康皮夾中，透過QR Code或安全連結分享所選資訊
- 授權跨國、醫療提供者及藥局進行存取
- 亞太綠色按鈕透過提供簡單、安全且具備互通性的機制，供個人存取及分享其 IPS，進而促進由病人媒介 (Patient-mediated)的健康資訊交換。藉由利用IPS、可驗證數位憑證 (Verifiable Digital Credentials) 及選擇性揭露 (Selective Disclosure)技術，綠色按鈕支持跨境醫療照護的連續性、緊急醫療決策、安全的藥物比對 (Medication Reconciliation)、以及病人信任與資料主權。綠色按鈕建立於開放標準之上，並尊重各國的數位身分框架，例如:
- WHO Smart Health Cards
- 日本My Number生態系
- 台灣數位身分皮夾 (Digital Identity Wallet)
- 亞太綠色按鈕的三個常見場景，包含:場景 1:跨境醫療照護(醫院)、場景 2:跨境藥局調劑、以及、場景 3:緊急照護，請參考下圖。

### 銜接亞太IHE聯測松

- 本賽道將銜接2026年10月19-23日在日本淺草舉辦的亞太IHE聯測松中的IPS賽道。

## 效益 (Benefits)

根據現有的聯測情境制定各種跨院交換流程之使用情境，將現有的電子健康紀錄轉換為國際病歷摘要格式，確立各種FHIR Profile能通用於跨境之資訊互通、以及個人健康紀錄 (PHR)之整合。針對特定之應用情境，可選用部分欄位，組合成標準IPS Profile，達到互通整合應用。
透過提供跨境應用情境範例，讓開發者可以模擬實際流程提供發展「跨境系統整合」、「跨機構互通應用」、以及「個人健康紀錄 (PHR)之應用」，作為發展跨境標準化醫療資訊系統的核心基礎架構。
由於缺乏跨境的醫療資訊交換，幾乎所有利害關係人(包括病患、照護提供者和保險公司)都迫切需要提供定性資訊 (qualitative provision)。 缺乏有關國外照護品質、照護的可用性或財務方面等資訊和知識，可能會導致患者無法獲得最佳的照護。
- 本工作小組期望能建立國家之間的數位醫療資訊互通平台，能夠跨國共享醫療數據，同時保護病患的隱私。 在正確地交換病患醫療資訊用於計畫內與計畫外之的跨境照護。在緊急情況下，能正確且快速取得共享醫療數據以外，還能節省大量成本等各種好處，列舉如下:
- 提高醫療效率: IPS使醫療提供者能快速取得病人的關鍵健康資訊，減少重複測試和診斷的需求。
- 改善患者安全: 確保醫療提供者能夠取得病人的過去病史、過敏反應和目前的治療方案，降低醫療錯誤的風險。
- 促進跨境醫療: 在患者旅行或移居到不同國家時，IPS 可確保其醫療資訊能隨身攜帶，提供連續的醫療服務。
- 患者參與: 患者能夠更容易地取得和分享自己的健康資訊，參與到自己的健康管理中。
- 提高互操作性: IPS的設計目的是提供一個簡單、標準化和可互操作的方式，讓醫療提供者能夠在不同的系統和國家之間共享患者的關鍵醫療資訊。依循IPS的格式能夠更容易地整合到現有的電子健康記錄 (EHR)系統中。

### EHDS於2029年3月開始實施，業者進口到歐盟須遵循EEHRxF格式規範

- 歐盟EHDS (European Health Data Space Regulation)將於2029年3月對健康資料主要用途 (primary use)，例如: 臨床/醫療照護用途，開始強制適用EEHRxF (European Electronic Health Record eXchange Format)互通規範，其中以IPS交換為必要選項。
- 這會直接影響與歐盟健康照護資料交換或對歐盟市場提供電子病歷醫療資訊服務相關的業者。對台灣相關產業，包含: 健康資料平台、電子病歷系統供應商、以及以醫療資料為輸入/輸出的業者，包含:醫療器材廠、AI模型業者等會帶來功能、標準、測試與合規上的實務衝擊，即產品輸出格式需要支援EEHRxF或其關聯標準，包含:FHIR、國際代碼 (SNOMED CT, LOINC等)、通過IHE聯測、並配合認證或產業標章準備。
- 說明: EEHRxF是EHDS 實作的核心技術規範之一，目的是為跨境與域內EHR資料交換提供統一格式、metadata 與語意互操作規則。多個歐盟專案，包含:xShare、i2X 等，以及SDO (CEN、歐洲HL7、歐洲IHE、SNOMED等)正協同推動標準化落地。

### 為何EEHRxF如此重要?

- EHDS規範已在2025年生效，並規劃逐步上線，重要里程碑: 2029年3月:為「primary use (醫療照護用途)」相關關鍵部分開始適用、包含首批優先資料類別 (病人摘要、電子處方箋與調劑紀錄等)。對於要進入歐洲市場的台灣的健康照護數位產品需要符合開始強制適用EEHRxF格式，影響台灣出口歐洲地區的競爭力。
- 未來醫療資訊系統要進入歐洲市場，必須能匯出/匯入EEHRxF規範的資料，包含IPS、FHIR電子處方箋、提供符合EEHRxF格式交換。若想服務歐盟醫療機構或提供跨境病歷交換的功能，就屬於直接受規範約束範圍。

## 詳細資訊 (Details)

IPS組成結構基於HL7 FHIR標準，涵蓋了患者健康資料的核心部分，本賽道的國際病患摘要涵蓋交換資料如下架構:

- 1. 已既有的聯測情境的電子健康紀錄規格，提出一個轉換IPS格式之驗證機制，已確保轉換結果符合IPS之規範。
- 2. 系統可直接生成IPS內容Bundle Document，提供病人進行國際醫療。

### 病患基本資料 (Patient)

- Identifier: 如病歷號碼、護照號碼等。
- Name: 包括姓氏、名字和其他名稱。
- Gender: 男性、女性或其他。
- Birth Date: 病患的出生日期。
- Address: 患者的居住地址。

### 過敏反應和不耐證 (Allergies and Intolerances)

- 物質 (Substance): 病患對哪種物質過敏或不耐受。
- 反應 (Reaction): 過敏或不耐受的症狀和嚴重程度。
- 狀態 (Status): 當前過敏反應的狀態(活躍、過去、未知)。

### 病史 (Conditions)

- 病症 (Condition): 診斷的病症名稱。
- 發病日期 (Onset Date): 病症首次出現的日期。
- 臨床狀態 (Clinical Status): 病症的當前狀態(活動中、緩解中、已治癒)。
- 驗證狀態 (Verification Status): 病症的確診狀態(確診、懷疑、排除)。

### 藥物 (Medications)

- 藥物名稱 (Medication): 處方藥和非處方藥的名稱。
- 劑量 (Dosage): 每次服用的劑量。
- 給藥途徑 (Administration Route): 口服、注射、吸入等。
- 狀態 (Status): 當前的用藥狀態(活躍、停止)。

### 疫苗接種記錄 (Immunizations)

- 疫苗名稱 (Vaccine): 接種的疫苗名稱。
- 日期 (Date): 接種疫苗的日期。
- 劑次 (Dose Number): 接種的劑次。
- 狀態 (Status): 接種的狀態(完成、未完成)。

### 醫療程序 (Procedures)

- 程序名稱 (Procedure ): 進行的醫療程序或手術。
- Date日期 (Date): 進行程序的日期。
- 結果 (Outcome): 程序的結果或效果。

### 觀察結果 (Observations)

- 觀察項目 (Observation): 如血壓、體溫等。
- 數值 (Value): 觀察結果的具體數值。
- 日期 (Date): 進行觀察的日期。

### 社會史 (Social History)

- 吸煙狀況 (Smoking Status): 患者的吸煙狀況。
- 飲酒狀況 (Alcohol Use): 患者的飲酒習慣。
- 職業 (Occupation): 患者的職業和工作環境。

## 涉及系統 (Systems Affected)

### 影響系統和領域

IPS 主要影響以下系統和領域:
- 電子健康記錄 (EHR)系統: 需要整合IPS標準以便分享和接收患者健康資訊。
- 醫療資訊交換平台: 醫療資訊交換 (Health Information Exchange, HIE)支援不同醫療機構之間的資料交換，依循IPS標準以確保數據的互操作性。
- 公共衛生系統: 利用IPS收集和分析來自不同來源的病人健康數據，支持公共衛生決策和行動。
- 個人健康管理系統與行動應用: 個人健康管理系統 (Personal Health Reconrd, PHR)提供病患在不同地區旅行、就醫等活動，藉由PHR分享其個人的健康資訊。

### 本規範涉及涉及的系统有

- 批價系統
- 電子病歷系統
- 索引與交換中心
- 收據調閱系統
- 病歷調閱系統
- 健康檢查資料交換
- 國際轉診
- 國際醫療服務
- 緊急救護服務
- 個人健康管理

## 規格 (Specification)

### 基礎規格

IPS 規格基於 HL7 FHIR 標準，通過這些規格，IPS 提供了一個統一的框架，促進全球範圍內的醫療數據交換和互操作性。包含以下核心部分:
- 資源: 定義了 IPS 所需的 FHIR 資源類型，如患者、過敏反應、病史、觀察結果等。
- 數據元素: 規範了每個資源中的關鍵數據元素及其結構，以確保一致性和互操作性。
- 資料集定義: 描述了 IPS 所需的最小資料集，確保包含所有必要的病人健康資訊。
- 互操作性要求: 規定了不同系統之間的數據交換標準和要求，包括數據格式、傳輸協議和安全性措施。
- 多國語言: 允許IPS資料使用不同語言表示，確保在跨國界醫療中使用。

### 角色整理

 | Keyword | 名稱 | 描述
 | CONTENT_CREATOR | Content Creator | 新增文件角色
 | CONTENT_CONSUMER | Content Consumer | 查詢與調閱文件角色

### 交易整理

 | 編號 | 名稱 | 描述
 | PCC-1 | Document Sharing | 文件分享

### 角色與交易關係圖

## 測試情境

本賽道的測試情境用於IPS跨系統病歷摘要交換。目標是實現在不同國家與醫療機構之間，安全地分享關鍵健康資訊，企圖建立一個標準化的跨境健康摘要交換框架，以促進國際旅客與移動病人的照護連續性。

### 測試情境

IPS測試情境將與賽道#1 LEVEL 3: 用藥與檢查的測試情境相同，提供以下測試情境，作為驗證產生IPS能力證明。

 | 層級 | 名稱 | 補充(升級版)
 | IPS_TWCORE-OPD-010 | 多次單一門診 | 門診/單一門診 + 開立藥物處方箋 + 多次檢驗數據
 | IPS_TWCORE-OPD-011 | 多次複合門診 | 不同專科門診 + 開立藥物處方箋 + 多次檢驗數據
 | IPS_TWCORE-MIX-001 | 多次門診與急診 | 多次單一門診/急診 + 多次檢驗數據
 | IPS_TWCORE-MIX-002 | 多次複合門診與急診 | 多次複合門診/急診 + 多次檢驗數據
 | IPS_TWCORE-MIX-003 | 多次門診與住院手術 | 多次門診與住院 + 多次檢驗數據 + 手術
- 未來規劃完整測試情境如下說明:

### 測試情境#1: 基礎分享(最小集 IPS)

- 目的: 驗證包含所有必要資源的「最小集 IPS 組合資源 (Composition)」之產製與分享。
- 內容: 
- 包含必要中繼資料 (Metadata)的Composition (符合 IPS Profile)。
- 病人資料 (符合 IPS Patient Profile)。
- 至少包含 1 項診斷問題 (Problem)、1 項過敏 (Allergy) 及醫療摘要章節。
- 測試流程: 
- 產生端 (Creator): 產製包含最小內容的 IPS。
- 接收端 (Consumer): 透過FHIR API (使用 DocumentReference 或 Composition 資源) 查詢或獲取IPS。

### 測試情境#2: 進階分享(擴展集 IPS)

- 目的: 驗證包含選用之必要資源的「擴展集 IPS 組合資源 (Composition)」之產製與分享。
- 內容: 
- #2-1 實驗室檢驗報告: 加入 DiagnosticReport (Laboratory Profile) 並參照相關 Observation。在IPS的結果章節中包含LOINC編碼的檢驗結果。
- #2-2 病理報告: 加入DiagnosticReport (Pathology Profile)及其Observation，並可能包含影像參照 (DocumentReference)。
- #2-3 放射影像報告(含影像) :加入 DiagnosticReport (Radiology Profile) 及其 ImagingStudy 與影像參照(例如Media資源中的DICOMweb URL)。影像存取採用IHE WIA (Web-based Image Access)規範。
- 測試流程: 
- 產生端產製包含上述一項或多項報告的擴展集 IPS。
- 接收端獲取並驗證其參照的完整性。
- 驗證所有參照資源皆可解析且符合其 Profile 規範。

### 測試情境#3: 顯示IPS

- 目的: 驗證 IPS 的視覺化呈現與術語映射能力。
- 內容: 來自情境#1或#2的任何IPS內容。
- 測試流程: 
- 查詢IPS: 接收端透過FHIR API發起查詢。
- 調閱IPS Bundle: 檢索完整的IPS Bundle (包含Composition及所有參照資源)。
- 以人類可讀的形式渲染: 保留章節結構與敘述性文字進行視覺化呈現。
- 支援IHE術語映射 (Sharing Valuesets, Codes, and Maps, SVCM) [選用]:
- 識別IPS中的編碼元件(如 LOINC, SNOMED CT, ICD-10)。
- 在IPS檢視器 (Viewer)中同時顯示原始編碼及映射後的術語。
- 向SVCM伺服器查詢FHIR ConceptMap，將編碼映射至替代編碼系統(例如:日本、韓國或台灣的本地編碼系統)。

### 角色與交易圖 (Actors & Transactions Diagram)

採用FHIR API交換

IPS包含影像報告，並採用DICOMweb協定調閱影像

## 其他 (See Also)

- [https://build.fhir.org/ig/HL7/fhir-ips/] IPS實作指引
- [https://cylab-tw.github.io/ap-ips/en/] 亞太國際病人摘要
- [https://www.ipsviewer.com/] IPS Viewer
- [https://www.linkedin.com/pulse/fixing-all-nothing-problem-health-data-sharing-fhir-josh-mandel-md-9k6gc/] SMART Health Cards with SD-JWT
- [https://datatracker.ietf.org/doc/html/rfc9901] Selective Disclosure for JSON Web Tokens (SD-JWT)

## 工作小組

### 召集人
- 連中岳 ↗| 國立臺北護理健康大學資管系 副教授

### 成員
- 徐建業 ↗| 國立臺北護理健康大學資管系 終身特聘教授
- 陳亮均 ↗| 國立臺北護理健康大學資管系 副教授
- 陳巧珊 ↗| 國立臺北護理健康大學資管系 助理教授

### 測試資料小組
- 國立臺北護理健康大學資管系: 張雯柔、李德真、呂育慈
- 中國科技大學: 張雲柔
