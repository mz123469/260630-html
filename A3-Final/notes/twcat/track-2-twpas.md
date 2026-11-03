<!-- source: https://twcat.dicom.org.tw/track-list/2 -->
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

賽道 #2
#2 TWPAS
[#summary] 簡介 (Summary)
[#benefits] 效益 (Benefits)
[#details] 詳細資訊 (Details)
[#systems] 涉及系統 (Systems Affected)
[#spec] 規格 (Specification)
[#scenarios] 測試情境 (Scenario)
[#see-also] 其他 (See Also)
[#working-group] 工作小組

簡介 (Summary)▼←

# #2 癌症用藥事前審查

## 簡介 (Summary)

- 癌症治療包含許多不同治療策略，標靶藥物以及特殊用藥為其中一個有效治療癌症的方式。在評估治療策略上需要參考多種病例資料以及病患資訊等評估指標。由於治療費用昂貴，且需考量病患個體差異。特別是當用藥需要醫療保險給付，健康保險提供者需要進一步做事前審查。事前審查是醫療保險給付常用來管理醫療保健費用的流程，申請單位提出申請需檢附多種病歷文件，另外搭配包含疾病、評估、治療、基因、癌症分期表等資訊、影像報告與影像、檢查報告、基因報告等諸多資料。以現行狀況，申請醫院需要將病歷印出後再掃描成電子檔，其餘申請資訊需要人工填寫，造成申請端作業時間漫長。在保險給付端收到申請後，仍須人工審查，造成，申請與審查單位事前審查的過程可能緩慢且效率低。
- 因此本賽道以[https://nhicore.nhi.gov.tw/pas/] 臺灣癌症用藥事前審查實作指引制定的規格為主，提供醫院以及醫療資訊開發者，產生符合此FHIR IG之規範，藉此來協助開發對應的資訊系統
- 測試版本: 臺灣癌症用藥事前審查實作指引 1.2.2

## 效益 (Benefits)

### 醫院與廠商好處

- 透過標準化的規格定義各種檢附文件的規範，以實現電子健康記錄 (EHR)的互操作性，已達到跨系統之間的資料互通。此外，提供各廠商以及醫院在準備申請資料時能依循相關的國際標準以及電子病歷格式產生對應的電子病歷，以達到格式統一，對於電子病歷開發者簡化針對個別醫院客製化開發程序，減少開發成本並增加日後電子病歷的流動性，進而有效運用電子病歷的好處。

### 健康保險給付端

- 透過結構化的申請文件可以自動化方式做為文件檢核，並可透過一系列機制來快速審查。例如: 將藥品核價電子化、建置完整特材收載系統及運用AI輔助事前審查、增修診療項目電子化作業系統和自動追管機制，並建立新藥物暫時性保險支付許可等措施，來縮短審查時間。

## 詳細資訊 (Details)

本賽道的情境描述如下:

### 3.1 使用案例

本專案之主要實作者為醫院，醫院透過事前審查系統建立癌症用藥事前審查資料，上傳癌症用藥事前審查相關文件，提供專業審查。

### 3.2 循序圖

送核、送核補件、申復及申復補件之作業流程皆相同，依該個案是首次送審或不同意後再次送審等之狀態進行選擇不同的申請類別，以做為行政程序之判斷。送核、送核補件、申復及申復補件作業流程如下:
- 1. 醫院開發事前審查系統產生事前審查報告(Bundle TWPAS)
- 2. 醫院將已產生之事前審查相關文件上傳至健保署
- 3. 若資料符合格式，健保署回覆上傳成功訊息，由醫院查詢上傳結果
- 4. 若資料不符合格式，健保署回覆上傳失敗訊息，由醫院查詢上傳結果
- 5. 資料上傳成功後，審核醫師審核報告通過，由醫院查詢審核結果
- 6. 資料上傳成功後，審核醫師審核報告未通過，由醫院查詢審核結果

### 傳輸協定

- 本賽道無定義用戶端與中心端之傳輸協定，即不針對FHIR RESTful API進行測試。參加者僅需產生符合FHIR IG定義之事前審查格式文件，並上傳至FHIR Server進行格式驗證。
- 各醫院可自行建置PAS Repository作為醫院申請資料之PAS儲存庫。
- 查詢與調閱事前審查癌藥資訊本賽道將予以保留，不進行驗證。做為日後醫院自行管理擴充使用。

### 聯測情境詳細說明

- 1. 聯測測試範圍
- 聯測範圍主要以醫院產生申請資料，將PAS申請資料 (FHIR JSON)以FHIR API方式上傳至FHIR Server。病例附件上傳至Data Server，並將資料存取URL紀錄至PAS申請資料
- DICOM影像上傳至Image Archive，產生影像索引 (ImagingStudy)後整併至PAS申請資料
- 非DICOM影像上傳至Data Server，產生影像索引 (Media)後整併至PAS申請資料
- PAS Creator可透過FHIR Converter將醫院資料庫進行轉換，或PAS系統本身是直接以FHIR方式開發。若是透過FHIR Converter做轉換，須於正式聯測告知督察員，督察員將親自查看client系統，若判定不需提供系統畫面，亦符合聯測規則
- 2. 非聯測範圍
- 醫院產生PAS申請資料後儲存在FHIR Server。醫院自行開發或委外系統建置健保上傳系統，將PAS申請資料以FHIR API的作法調閱PAS申請資料、PAS附件、以及DICOM影像
- PAS FHIR JSON上傳: 健保上傳系統產生申報資料 (CSV)，與FHIR JSON分別透過健保共同傳輸平台上傳至健保署
- DICOM影像打包: 從Image Archive調閱DICOM影像後，產生DICOMDIR，將DICOMDIR與DICOM檔整合後壓縮 (7z, cab, zip格式)。並透過健保共同傳輸平台上傳至健保署
- 病例附件打包: 從Data Server調閱病例附件 (PDF)後，將病例附件壓縮 (7z, cab, zip格式)。並透過健保共同傳輸平台上傳至健保署

### 大會提供聯測資源

- Data Server: 可使用Web API上傳檔案，並回傳資料URL
- FHIR Server: 驗證用的FHIR Sever，需將附件URL紀錄於Bundle中
- PACS (Image Archive): 使用DICOM/DICOMweb方式上傳檢附的影像資料，並將資訊填入ImagingStudy。此作法ImagingStudy可參照TWCoreImagingStudy填入更多的資訊

### 參加單位資料準備建議

- 癌症用藥事前審查上傳系統 (Creator): 需有操作畫面或是轉換器 (FHIR Converter)
- 依照癌症用藥事前審查FHIR IG規格將資料轉換為FHIR格式，並上傳至大會的 FHIR Server
- 參測單位需自行準備測試資料PDF檔，督察員不驗證實際內容，但需要能正確關聯至FHIR文件，)
- 參測單位無需準備DICOM影像，可使用大會提供的測試影像 (不驗證實際影像內容，但需要為DICOM檔。作為驗證產生ImagingStudy的正確性)

## 涉及系統 (Systems Affected)

本規範涉及涉及的系统有:

### 事前審查申請用戶端 (Prior Authorization Support Client)

- 系統功能簡介: 負責新增或修改事前審查申請文件，並整合申請資料，包含: 疾病、評估、治療、基因、癌症分期表等資訊。收集影像報告與影像、檢查報告、基因報告等病歷，並以附件的形式上傳。

### 事前審查申請儲存庫 (Prior Authorization Support Repository)

- 系統功能簡介: 管理與回覆事前審查申請資料與相關附件，可建置在醫院作為資料維護使用。

## 規格 (Specification)

涉及到的角色 (Actors)以及交易 (Transactions)，說明如下:

### 角色 (Actors)

1. 事前審查申請 (TWPAS)角色整理

 | Keyword | 名稱 | 描述
 | PAS_CREATOR | PAS Creator | 癌症用藥事前審查資料產生
 | PAS_REPOSITORY | PAS Repository | 癌症用藥事前審查儲存庫
 | PAS_CONSUMER | PAS Consumer (Reserved) | 癌症用藥事前審查查詢與調閱角色 (保留)

### 交易 (Transactions)

1. 事前審查申請 (TWPAS)交易整理

 | 編號 | 名稱 | 描述
 | MITW-75 | Create/Update PAS | 產生與更新癌症用藥事前審查資訊
 | MITW-76 | Query/Retrieve PAS | 查詢與調閱癌症用藥事前審查資訊

## 測試情境 (Scenario)

### 情境1 事前審查申請送核 (必要條件)

- 測試目的: 確保基本送審資料架構正確
- 檢核基準:
- 確保產品/系統具備基礎人機介面。
- 系統為轉換器 (FHIR Converter)需提供相關佐證，並由督察員親自審核。
- 確保產品/系統符合基本資安要求 (Level I)
- 基本要求: 滿足最少資料原則，至少包含以下Resources，並以Bundle形式打包
- 事前審查 (Claim)
- 健保事前審查計畫 (Coverage)
- 病人資訊 (Patient)
- 醫師 (Practitioner)
- 就醫科別 (Encounter)
- 醫事機構／基因檢測機構 (Organization)
- Claim基本要求: 滿足可完成Claim所有資訊，需支援以下SupportingInfo並以Bundle形式打包
- 病人體重、病人身高
- 是否懷孕或哺乳、癌症分期量表、病人狀態評估、用藥品項、放射治療
- 結果資訊 (治療後疾病狀態評估)

### 情境2 事前審查送核補件或申復 - 補病例附件 (必要條件)

- 測試目的: 確保具備提供病歷附件能力，並可與送審資料關聯
- 檢核基準:
- 確保產品/系統具備基礎人機介面。
- 系統為轉換器 (FHIR Converter)需提供相關佐證，並由督察員親自審核。
- 確保產品/系統符合基本資安要求 (Level I)
- 基本要求: 送審文件，需附加以下病歷文件 (PDF)，並以Bundle形式打包
- 基因報告
- 治療計畫文件
- 檢驗 (查)附件
- 病歷資料

### 情境3 事前審查送核補件或申復 – DICOM影像 (必要條件)

- 測試目的: 確保具備提供DICOM影像與其影像索引能力，並可與送審資料關聯
- 檢核基準:
- 確保產品/系統具備基礎人機介面。
- 確保產品/系統具備產生影像報告 (DiagnosticReport)結合影像索引 (ImagingStudy)以及提供DICOM影像檔之能力
- 系統為轉換器 (FHIR Converter)需提供相關佐證，並由督察員親自審核。
- 確保產品/系統符合基本資安要求 (Level I)
- 基本要求: 文件，需具備影像報告 (DiagnosticReport)與影像索引 (ImagingStudy) 並以Bundle形式打包
- 影像索引 (ImagingStudy)
- DICOM影像檔須上傳至DICOM Server，並記錄影像存取資訊回寫至影像索引
- DICOM影像索引產生步驟建議作法
- 讀取DICOM檔案: Study Instance UID (0020,000D)及Body Part Examined (0018,0115)
- 有些設備可能將BodySite放到Anatomic Region Sequence (0008,2218)
- 如果DICOM檔沒有紀錄，則需自行填入
- 填入BodySite代碼請參考: [https://dicom.nema.org/medical/dicom/current/output/chtml/part16/chapter_L.html#chapter_L] DICOM Part 16: Annex L
- 產生附件做法
- DICOM影像: 將影像傳送至DICOM Server，並提供DICOMweb base URL。以FHIR ImagingStudy紀錄影像資訊

### 情境3-1 事前審查送核補件或申復 – 非DICOM影像 (非必要)

- 測試目的: 確保具備提供非影像與其影像索引能力，並可與送審資料關聯
- 檢核基準:
- 確保產品/系統具備產生影像報告 (DiagnosticReport)結合非影像檔 (Media)能力
- 系統為轉換器 (FHIR Converter)需提供相關佐證，並由督察員親自審核。
- 確保產品/系統符合基本資安要求 (Level I)
- 基本要求: 送審文件，需具備影像報告 (DiagnosticReport)並以Bundle形式打包
- 非影像檔 (Media)
- 非DICOM影像檔上傳至Data Server，記錄影像存取資訊回寫至影像索引

## 其他 (See Also)

- [https://nhicore.nhi.gov.tw/pas/] 臺灣癌症用藥事前審查實作指引

## 工作小組

### 召集人
- 江育霖 ↗| 創思醫資有限公司 技術長

### 成員
- 李建興 ↗| 玳康科技有限公司 技術經理
- 丁子芸 ↗| 國立臺北護理健康大學 IG設計師
- 莊孟昌 ↗| 臺中榮民總醫院資訊室 資訊工程師
