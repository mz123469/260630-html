<!-- source: https://twcat.dicom.org.tw/specification -->
2026 台灣聯測松

[/main] [/] 最新消息[/introduction] 簡介[/specification] 規格與資源[/track-list] 賽道
證書資訊
[/certificate] 證書申請[/product-confirm] 證書發放[/official-result] 聯測結果[/member] 督察員[/track-list/ltc/5] 長照聯測松[/recruit] 招募
歷史活動
[https://twcat.dicom.org.tw/ihe] 2026 亞太聯測松[https://twcat.dicom.org.tw/main] 2026 台灣聯測松[https://mitw.dicom.org.tw/2025/] 2025 亞太 IHE 聯合聯測松[https://mitw.dicom.org.tw/2024/] 2024年 MI-TW 聯測工作坊[https://mitw.dicom.org.tw/2023/] 2023年 MI-TW 聯測工作坊[https://mitw.dicom.org.tw/2022/] 2022年 MI-TW 聯測工作坊[https://mitw.dicom.org.tw/2021/] 2021年 MI-TW 聯測工作坊[https://mitw.dicom.org.tw/2020/] 2020年 MI-TW 聯測工作坊[https://ievents.iii.org.tw/JoinPNew.aspx?t=0&id=3493] 長照聯測報名

Resource
規格與資源賽道說明與簡報運作機制說明聯測準備工具報名資格規範與情境定義賽道分類領域分類驗測規則分級賽道對應驗測規則分級說明聯測網路與主機架構
運作機制說明▼
# 規格與資源

## 賽道說明與簡報
- [https://www.youtube.com/playlist?list=PLRUH631bibZgCrA2YKG-ArThGIQEbTsma] 聯測影片播放清單
- [https://drive.google.com/drive/folders/11Xzsio5MH_Z8S8Gq0mYDupow1GF4zXNC] 聯測說明會簡報下載

## 運作機制說明
資訊標準是健康醫療系統整合應用、系統商品化的基礎。醫資標準化系統之建置與推行有一套嚴謹的步驟，包含標準確立、準備測試案例、實作系統、聯測、以及推廣等，需有系統、有制度化地運作。本活動邀請國內健康醫療、醫療影像、資訊科技相關之產業界、政府單位、學術界、以及醫療機構參加。希望鼓勵醫療資訊系統相關新創業者，開發與使用標準化醫療資訊格式(包含:HL7, HL7 FHIR®, DICOM等)，預期效益為發展具國際標準標準化互操作性 (Interoperability)之醫學資訊系統以及醫療儀器、利於健康醫療系統整合應用、跨系統資料交換、也利於發展的系統在全球銷售。

聯測規格運作機制架構請參考下圖：

### 聯測工作小組會議
在正式聯測活動前，針對不同賽道主題，分成多個標準工作小組，將會邀請國內醫療資訊標準專家(Domain Expert)、健康醫療領域專家等召集會議，確立、產生及公告規範。

### 聯測準備活動(Pre-Connectathon)
聯測約前1個月將提供線上測試資料以及測試主機，讓參加單位進行驗證，作為正式聯測之準備。線上遇到問題時，將提供線上諮詢服務，並排除技術問題。

### 正式聯測
參加單位將在四天內與其他參加單位以實際的網路連線進行系統介接測試，在四天內須完成指定的規範與測試資料，符合通過標準者，可申請產品通過證書。

## 聯測準備工具

### [https://validator.dicom.tw/app/] 國北護FHIR一站式驗證工具
- 提供參加者驗證產品與系統是否能正確產生符合指定FHIR IG規範之FHIR資料，可直接上傳FHIR JSON，直接透過網站驗證。此工具會根據年度聯測公布的FHIR IG規格進行驗證。
- 匯出驗證結果，驗證結果無需Fatal以及Error的資訊。結果有出現Fatal、Error代表 Resource 有嚴重錯誤，參加單位可根據驗證結果調整程式，輔助產品開發。
- 驗證時FHIR JSON需提供meta.profile資訊，請參考[https://validator.dicom.tw/app/docs/] 使用說明

### IG Package驗證證明
- 此驗證為使用國際HL7提供的公開免費驗證器validator_cli.jar檔，以命令提示字元測試驗證
- 可參考TW Core IG驗證教學網頁。由於[https://twcore.mohw.gov.tw/ig/twcore/validates.html] TW Core IG網站。[https://twcore.mohw.gov.tw/ig/twcore/validates/1-2.gif] 操作說明影片

### [https://github.com/cylab-tw/dicom-to-fhir] DICOM轉換FHIR
- 支援DICOM影像轉換FHIR ImagingStudy，主要提供癌症用藥事前審查轉換DICOM使用
- 可從本機DICOM檔案或DICOMweb伺服器建立FHIR ImagingStudy JSON

### [https://github.com/cylab-tw/fhirfox] FHIRfox-模擬醫院資訊系統（HIS）的合成式FHIR醫療資料集
- FHIRfox是一個用於模擬真實醫療情境的合成醫療資料（Synthetic Clinical Data）專案，旨在建立一套類似醫院資訊系統（HIS）的資料庫，並支援FHIR資料轉換、測試與互通性驗證。
- FHIRfox提供已預先生成（pre-generated）之合成醫療資料，模擬真實臨床流程，包含：
- 門診（Outpatient）、急診（Emergency）、住院（Inpatient）
- 多科別就醫情境（心臟科、小兒科、骨科等）
- 病人長期就醫歷程（Longitudinal Records）
- 檢驗、診斷、用藥與影像等臨床資料
- 主要用途包括：FHIR 實作與系統測試
- 醫療資訊互通性驗證（HL7® FHIR®）
- HIS → FHIR資料轉換開發
- 聯測（Connectathon）與測試環境建置
- [https://cylab-tw.github.io/fhirfox/] 測試沙盒

## 報名資格
- 一般公司行號：報名時請提供公司全名以及統一編號。若經審核需補件，請提供相關廠商登記或設立之證明。
- 醫事機構：報名時請提供醫事機構全名。若經審核需補件，請提供相關設立之證明。
- 學術與教育機構：經主管機關(如教育部)認定之教學與學術研究單位。
- 開源軟體開發者：開放原始碼軟體，申請時於[所屬單位]填入專案名稱 (github等)，經專案審核通過。
註記： 欲申請聯測見習與參訪，請聯絡主辦單位

## 規範與情境定義
### 定義使用規範
聯測將使用架設的IHE Gazelle (以下簡稱Gazelle)。在Gazelle聯測系統中，包含測試整合規範 (Integration Profile)以及測試案例定義 (Test Definition)。我們將聯測分成多個測試Profile。參加單位可由報名的測試Profile，查看要符合此Profile需要依循哪些技術規格。在設計上，我們將此次的健康數據資料分成幾個領域 (Domain): TW、PCC、PaLM以及RAD等。
### 定義測試情境
測試情境將定義每個角色所需符合的條件，將測試流程定義為測試案例定義 (Test Script)，每個測試案例定義會加入該角色對應要連線測試的受測角色，依據標準規範分成no peer以及peer to peer這兩大類型。驗證規範由本會所招募的標準專家，將各賽道要驗證的測試情境定義在測試案例定義中。

## 賽道分類
聯測以賽道做為聯測驗證基本單元，根據用途以及性質將賽道分成國家、基礎、政府、應用、國際、以及專案共五大類進行說明。整理表如下

國家在推動國家的FHIR電子病歷標準基礎建設上，定義適用於臺灣健康照護資料交換需求的Resources以及必要的在地化，作為國家標準基線最小限制集。本賽道分類主要協助驗證健康照護資訊系統開發與實作者對於TW Core IG的基本實作能力，加強使用TW Core IG開發實務專案之實作能力。
政府本分類為驗證根據政府專案計畫提供的FHIR IG，提供使用情境用來驗證參加者是否具備FHIR政府專案的實作能力。
應用本分類提供各種實際的應用情境以及醫院或是健康照護機構提出的應用情境，範圍包含學術研究、商業情境、跨院健康照護資料交換等，提供使用情境用來驗證參加者是否具備各種FHIR實務專案之實作能力。
國際本分類依據現有的國際電子健康紀錄交換規範，提供跨國的交換應用情境，用來驗證參加者是否具備跨國交換之實作能力。
專案本分類採用國際常用的專案聯測松(Projectathon)運作模式，透過聯測來驗證專案設計的FHIR IG之適用性以及可行性。透過參加者短時間的測試與驗證，以確保彼此的系統之間可以有效地依據FHIR IG規格來達到資料交換。根據開發中的FHIR IG進行測試，並修正其系統以達到標準要求。

## 領域分類
在交換情境設計上符合台灣的應用情境，引用自行定義以及國際IHE規範做為聯測的測試情境。每個規範定義分別的角色(Actor)以及交易(Transaction)，定義角色之間彼此的關係。聯測包含各種Profile包含:

 | 分類 | 賽道 | 包含Profile | 規範名稱 | 實作指引
 | 國家 | #1 | TWCORE | 台灣核心實作指引 (TW Core IG) | [https://twcore.mohw.gov.tw/ig/] 台灣核心實作指引
 | 政府 | #2 | TWPAS | 癌症用藥事前審查(Prior Authorization Support) | [https://nhicore.nhi.gov.tw/pas/] 臺灣健保事前審查實作指引
 | 應用 | #3 | IUA | 網路使用者授權 (Internet User Authorization) | [https://profiles.ihe.net/ITI/IUA/index.html] Internet User Authorization
 | 國際 | #4 | IPS | 國際病人摘要 (International Patient Summary) | [https://build.fhir.org/ig/HL7/fhir-ips/en/] International Patient Summary Implementation Guide
依據賽道分類，針對各賽道包含的各種Profile依序如下說明：
### 台灣核心規範列表

 | 領域 | 賽道 | Profile | 規範名稱 | 規範英文名稱
 | TW | #1 | TWCORE | 台灣核心實作指引 | TW Core IG
### 政府賽道整合規範

 | 領域 | 賽道 | Profile | 規範名稱 | 規範英文名稱
 | TW | #2 | TWPAS | 癌症用藥事前審查 | Prior Authorization Support
### 應用賽道整合規範

 | 領域 | 賽道 | Profile | 規範名稱 | 規範英文名稱
 | ITI | #3 | IUA | 網路使用者授權 | Internet User Authorization
- ITI依循國際IHE規範定義的整合規範(Integration Profile)
### 國際賽道整合規範

 | 領域 | 賽道 | Profile | 規範名稱 | 規範英文名稱
 | PCC | #4 | IPS | 國際病人摘要 | International Patient Summary
- 本次國際賽道同步以專案賽道的方式舉行
- PCC為依循國際IHE規範定義的整合規範(Integration Profile)

## 驗測規則分級
聯測根據性質區分二個等級。Level I為基本能力驗證，系統需根據各賽道的測試情境(Scenario)的測試腳本(Test Script)，與主辦單位提供的主機系統進行驗證。Level II為互通性驗證，要求測試系統需與三家不同的系統進行驗證，須通過各賽道的測試情境的測試腳本。下表為驗測規則分級整理與說明。

 | 等級 | 名稱 | 描述
 | Level I | 能力聲明驗證 (Capability Statement) | 須通過賽道指定情境之測試腳本
 | Level II | 互通性驗證 (Interoperability) | 須通過賽道指定情境之測試腳本。一個系統至少需與三家不同參加者進行交互認證
補充說明：
- 提供OAuth2 Server，驗證參加單位OAuth2 Client，大會提供Keycloak Server作為認證主機。
- 參考JavaScript實作OAuth2範例: [https://github.com/cylab-tw/Javascript_OAuth_Example] Javascript_OAuth_Example

## 賽道對應驗測規則分級說明

 | 分類 | 賽道 | 規範名稱 | 適用分級 | 註記
 | 國家 | #1 | 台灣核心實作指引 | I | 
 | 政府 | #2 | 癌症用藥事前審查(Prior Authorization Support) | I | 
 | 應用 | #3 | 網路使用者授權 (Internet User Authorization) | II | 授權用戶端與資源伺服器 (Resource Server)可支援#1, #2, #4的交易
 | 國際 | #4 | 國際病人摘要 (International Patient Summary) | I, II | 同步採用專案聯測

## 聯測網路與主機架構
各種情境的資料儲存至資料主機的FHIR與DICOM主機，透過健康數據服務API以標準FHIR與DICOM/DICOMweb API提供模擬健康資料，包含個賽道提供的測試資料，使用情境則使用Gazelle平台以及平台的各種工具提供聯測使用，目前提供工具包含: FHIR基本格式驗證以及DICOM格式驗證。參加者需配合主辦單位設定網路以及API設定。

下圖為聯測網路與伺服器服務架構，主要規劃分成兩個主機: (1)聯測控制主機以及(2)資料主機。
- 實體面對面聯測者: 參加者連接聯測區域網路後，經過網路設定，將交易連結導向Gazelle Proxy主機作為抓取交易封包以及連結特定的測試單元。

辦理單位

主辦單位：
[https://dep.mohw.gov.tw/DOIM/mp-114.html] 衛生福利部資訊處
執行單位：
次世代數位醫療平台專案辦公室
[https://www.dicom.org.tw/] 社團法人台灣醫療影像資訊標準協會
[https://im.ntunhs.edu.tw] 國立臺北護理健康大學資訊管理系

聯絡資訊

會務專員：
簡志雯
TEL：
(02)2822-7101 分機1623, 1624
統一編號：
94995655
通訊地址：
112 臺北市北投區明德路365號 學思樓F826
E-mail：
[mailto:misat.tw@gmail.com] misat.tw@gmail.com
服務時間：
週一至週五 9:00-17:00
