<!-- source: https://twcat.dicom.org.tw/track-list/3 -->
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

賽道 #3
#3 IUA
[#summary] 簡介 (Summary)
[#benefits] 效益 (Benefits)
[#details] 詳細資訊 (Details)
[#systems] 涉及系統 (Systems Affected)
[#spec] 規格 (Specification)
[#scenarios] 測試情境 (Scenario)
[#see-also] 其他 (See Also)
[#working-group] 工作小組

簡介 (Summary)▼←

# #3 網路使用者授權

## 簡介(Summary)

本賽道旨在驗證系統是否能依據IHE IUA（Internet User Authorization）規範，並可選擇性支援[https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html] SMART App Launch定義的授權認證(Authorization)以及身分確認(Authentication)最終確保系統在跨機構或跨系統環境中，能安全地進行身份驗證與授權控制。
本賽道技術架構實現基於OAuth 2.1與JWT (JSON Web Token)的使用者授權機制，並安全地存取受保護之醫療資源 (如FHIR API)。透過本測試賽道，參與系統需模擬實際醫療應用場景中:
- 使用者登入與授權流程
- 存取權杖(Access Token)取得
- 攜帶授權資訊呼叫 FHIR API

### 本賽道核心目標

- 驗證醫療系統是否能依據IHE IUA規範，安全且標準化地實現使用者授權機制。
- 並可選擇支援SMART on FHIR Authorization Option，以利於FHIR應用程式在具臨床脈絡情境下進行授權存取。
- 應用程式透過與使用者及授權伺服器 (Authorization Server)互動，以支援存取權杖 (Access Token)的核發。隨後，應用程式使用該存取權杖來取得並更新健康相關數據。

### 核心議題

- 作為整體隱私保護與安全環境的一部分，做出可靠且準確的授權決策。
- 應用程式開發者: 期望有一套通用的方法來獲取與使用存取權杖。
- 資源伺服器: 期望有一套通用的方法，在HTTP RESTful交易中接收存取權杖，並有通用的方法來處理這些權杖。
- 使用者、病患及醫療人員: 期望擁有主導權，不希望依賴技術人員來設定其應用程式，並希望將授權程序帶來的干擾降至最低。

### 其他議題

- 內部應用程式分發: 需為機構內使用的應用程式提供授權。
- IT 管理員: 偏好使用通用的方法來授權內部網頁應用程式的使用，以及對內部資源的存取。
- 醫療人員與專科醫生 :有授權需求以處理與其他組織及多種資源服務的互動。
- 授予專科醫療人員子集存取權 :例如，授予物理治療機構讀取病患心臟資訊的權限，但禁止存取其他敏感的健康數據。

### IUA規範前提

IUA對運行環境有以下假設前提條件 :
- 1. 協作環境: IUA假設會有許多系統共同構建存取控制環境，而IUA僅提供其中一部分。例如，血糖儀可能被授權存取病患的病歷。預期這代表能存取所有與血糖相關的資訊 (包含各類量測值與處方)；但若該設備請求病患的其他敏感健康數據，則預期會被拒絶。
- 2. 同意書管理: IUA假設此設定檔運作於一個由基本病患隱私同意書 (Basic Patient Privacy Consents, BPPC)或其他機制管理「存取同意書」的環境中。例如，病患與醫療提供者之間會有同意協議文件，規定醫療人員將病歷提供給由病患指定並授權的醫療代理人。BPPC是記錄該協議的一種方式。IUA並非用來取代這些法律協議的記錄、建立與修改。

### 與SMART on FHIR的關係

IHE IUA並非基於 SMART on FHIR所設計，但其目標在於避免與SMART on FHIR產生衝突，並保有相容與協作的空間。相較於SMART on FHIR，IUA不依賴特定資源模型，亦不強制引入臨床情境（如 Launch Context），因此具備較高的彈性與適用範圍。IHE IUA相較於SMART on FHIR，具備以下特點：
- 鬆散耦合: IUA促進資源伺服器與授權伺服器的鬆散耦合。這允許一個授權伺服器對應多個資源伺服器的部署方式，甚至支援多個或沒有授權伺服器的場景。
- 廣泛的案例支持: IUA支援從行動裝置存取數據、跨企業數據交換，到複雜的系統整合等各種應用場景。
- 標準中立性: 不限定資源需為 FHIR，適用於各類 HTTP RESTful 服務。
- 明確的宣告 (Claims)獲取方式: IUA提供明確手段，讓資源伺服器能從存取權杖中獲取宣告資訊 (無論是否有授權伺服器參與)。
- 額外的授權情境: IUA指定了額外的授權情境宣告，例如BPPC同意書與使用者的組織背景。
- 非FHIR系統相容性: 適用於無法導入SMART on FHIR的legacy系統或裝置。
然而，SMART on FHIR於FHIR應用領域之採用率持續提升，IHE與HL7亦持續進行IUA與SMART on FHIR之調和（Harmonization）討論。

### SMART選項

為回應FHIR生態系之發展趨勢，本賽道定義SMART選項，作為建立於IUA核心授權機制之上的選擇性測試項目。符合SMART on FHIR所定義之條件，包括：
- 支援SMART授權端點探索（.well-known/smart-configuration）
- 支援SMART on FHIR定義之授權scope與語意，例如: patient/*
- 資源伺服器為FHIR Server，並依scope進行存取控管
本選項為非強制性測試項目，是否支援不影響本賽道IUA的合規性判定。

## 效益(Benefits)

採用IHE IUA作為本賽道核心機制，其主要效益在於提供一套標準化、去耦合（Decoupling）、且具高度互操作性的安全框架。IUA補足了傳統OAuth 2.1 在醫療情境中未明確定義的關鍵細節，例如如何安全地攜帶與解析病患同意資訊（如 BPPC），使其更適用於健康照護資料交換場域。同時，透過定義SMART選項，本賽道亦可在不破壞IUA核心設計的前提下，延伸支援以FHIR為基礎之應用情境，使系統能逐步銜接SMART on FHIR生態系，兼顧現有系統與新型FHIR應用的需求。以下分別就不同角色說明其效益:

### 1. 醫療資訊系統服務商

對於開發者而言，IUA最大的價值在於「開發一次，通用各處」。
- 降低開發與維運成本：
- IUA基於成熟的OAuth 2.1標準，開發者可直接使用既有業界函式庫實作授權機制，避免為不同醫療專案重複建立私有認證流程。
- 此外，當系統選擇支援SMART Option時，可延續既有IUA架構，而無須重新設計完整授權系統。
- 標準中立與高相容性：
- 不同於SMART on FHIR緊密依賴FHIR資源模型，IUA可應用於任何HTTP RESTful服務，讓產品可同時支援FHIR與非FHIR系統（如既有院內系統、後端服務或醫療裝置）。
- SMART選項則提供明確路徑，協助廠商逐步擴展至FHIR App與SMART生態系。
- 系統架構高度彈性（鬆散耦合）：
- IUA支援授權伺服器（Authorization Server）與資源伺服器（Resource Server）的解耦部署，使廠商可專注於醫療專業模組開發，並將帳號與權限管理交由第三方或機構內部授權中心處理。
- 在此架構下，SMART on FHIR僅作為授權語意與FHIR 存取之限制條件，而非整體系統的強制依賴。
- 清楚的技術成長路徑：
- 參加者可依據產品定位選擇是否支援SMART Option，作為邁向SMART App或FHIR平台整合的進階階段。

### 2. 醫療機構（醫院／照護機構）

對於醫療機構而言，IUA 結合SMART選項提供了一套可治理、可稽核、且可逐步演進的授權策略。
- 精細化存取控制（Fine‑grained Access Control）：
- 透過IUA定義的Claims（宣告），機構可落實最小權限原則，例如僅允許特定專科人員存取其業務所需的病歷內容。
- 在支援SMART選項情境下，亦可透過SMART scopes對FHIR資源進行更明確的存取限制。
- 法律合規與病患同意管理：
- IUA可整合BPPC或其他病患隱私同意機制，確保資料存取符合病患授權與法規要求。
- SMART選項則可於不改變既有政策的情況下，將此授權模型延伸至FHIR API層級。
- 跨機構與跨系統互通性：
- 透過IUA作為共通授權基礎，不論對接的是FHIR系統或傳統院內系統，醫療機構皆能以一致的授權語意進行控管，簡化跨院合作與資安稽核流程。

### 3. 病患

IUA與SMART選項的結合，能在提升安全性的同時，強化病患對自身資料的掌控感。
- 病患資料掌控權（Patient Empowerment）：
- 病患可清楚授權特定應用或系統存取其必要資料範圍，不必擔心敏感資訊被過度存取。
- 在SMART應用場景中，此授權語意可直接對應至FHIR資源層級。
- 隱私與安全強化：
- 授權流程以標準化權杖機制進行，避免於傳輸過程中暴露明文密碼或個人識別資料。
- 降低使用門檻與操作干擾：
- 無論是採用IUA或SMART選項，病患的使用體驗皆可類似「單一登入（Single Sign‑On）」模式，減少複雜設定與重複驗證。
- 透明的授權紀錄與信任建立：
- 標準化授權機制亦有助於未來建立清楚的「誰在何時、以何種目的存取我的資料」之稽核能力，提升數位醫療的信任基礎。

### 接軌國際:通往IHE國際認證的敲門磚

本賽道之測試案例係依據IHE國際聯測規範設計，確保參與單位在通過國內聯測後，具備直接銜接國際IHE聯測的能力。此外，透過IUA作為核心，並以SMART選項作為延伸，本賽道同時為參加者建立進入FHIR與SMART App國際生態系的技術基礎。
本賽道協助參加者接軌國際的具體措施包括：
- Gazelle測試預演：
- 協助參加者熟悉Gazelle測試平台與JWT／Claims驗證邏輯，於國內先行排除規格誤解問題。
- 數位轉型與資安加值效益：
- 通過測試之系統，將獲得正式聯測證明，作為未來醫療機構資安稽核、跨院合作或SMART應用導入的重要參考依據。

## 詳細資訊(Details)

本賽道可選擇IUA或是SMART選項作為選擇性測試項目。若參加者選擇測試SMART選項，需額外符合SMART App Launch所定義之相關約束條件。本賽道主要測試以下流程：

### 1. 使用者認證(Authentication)

IUA：
- 使用者透過 Authorization Server 進行身分驗證
- 認證方式由授權伺服器決定（例如帳號密碼、多因子驗證、機構既有身份系統）
SMART選項：
SMART定義兩種使用者認證模式，扮演Client參加者須要確認Auth Server以及Resource Server扮演者須支援對應的模式。模式包含:
- 非對稱認證 - Asymmetric (“private key JWT”) authentication
- 對稱認證 - Symmetric (“client secret”) authentication

### 2. 授權流程(Authorization)

IUA：
- Client透過OAuth 2.1授權流程（如 Authorization Code Flow）向 Authorization Server 請求授權
- 成功後取得存取權杖（Access Token）
SMART選項：
- SMART App依據SMART規範，透過Authorization Server進行使用者登入
- 授權端點與相關設定須可透過 .well-known/smart-configuration 發現
- 授權請求須符合SMART on FHIR定義之參數與流程限制
- 授權請求中可包含SMART 特定參數（如對FHIR資源存取的scope定義）
- 補充: 此流程SMART on FHIR限定
- SMART定義兩種使用者認證模式，扮演Client參加者須要確認Auth Server以及Resource Server扮演者須支援對應的模式。模式包含:
- Smart App啟動授權 - Authorization via SMART App Launch
- Smart後端服務授權 - Authorization via SMART Backend Services

### 3. Token 傳遞

- Access Token 採用 JWT 格式，Token中包含，例如:
- 使用者識別(sub)
- 權限範圍(scope)
- 發行者(iss)
SMART選項：
- 須符合SMART APP Lunch定義的[https://build.fhir.org/ig/HL7/smart-app-launch/conformance.html#metadata] metadata

### 4. 資源存取(Resource Access)

- Client 攜帶 Bearer Token 呼叫 FHIR Server API
- Resource Server 驗證 Token 後回應資料

### 5. Token 驗證

- 驗證 JWT 簽章(Signature)
- 驗證 Token 是否過期(exp)
- 驗證 scope 是否符合授權
本賽道常用的情境在於驗證如何在不同醫療數位化場景中，提供安全且標準化的授權保護，以下為常用的參考情境:

### 情境一:行動醫療App診間授權

- 目的: 驗證病患或醫師透過行動裝置 (如手機App、網頁瀏覽器)存取FHIR資源時的安全性。
- 場景描述: 醫師在診間使用平板電腦開啟「遠距醫療 App」欲查閱病患病歷。系統引導醫師跳轉至醫院的 Authorization Server 進行身分驗證，登入後App取得具備時效性的 JWT Access Token 。App隨後攜帶此Token向 FHIR Server 請求資料 (例如: Patient 或 Observation)，伺服器端驗證Token簽章與有效性後回傳資料。

### 情境二:物聯網生理設備自動化資料傳輸

- 目的: 提供醫療儀器與後端系統自動對接的授權驗證環境。
- 場景描述: 國內廠商研發之「自動化血壓計」或「穿戴式心電圖裝置」，在量測完畢後需將數據上傳至醫院資料庫。由於設備端沒有使用者介面進行登入，設備需預先註冊並使用其 Client ID/Secret 透過 Client Credentials Grant 模式直接向授權伺服器獲取Token。獲取Token後，設備以受保護的RESTful API將量測結果寫入資源伺服器。

### 情境三:跨機構病患同意書 (BPPC)控管流程

- 目的: 驗證IUA結合病患隱私政策 (BPPC)後的精細授權能力。
- 場景描述: 場景描述: 當跨院調閱中心 (EEC)的系統欲存取病患敏感數據 (如心理諮商紀錄)時， Authorization Server 核發的Token 中會嵌入病患同意的宣告，代表病患已簽署之同意書編號。 Resource Server 接收到Token後，除驗證基本安全外，必須解析該同意書資訊，確保請求者具備讀取該敏感類別資料的法律授權。

### 情境四:混合式醫療系統安全介接

- 目的: 驗證IUA的「標準中立性」，解決HIS/PACS與非FHIR系統間的整合痛點。
- 場景描述: 國內HIS廠商欲整合第三方開發的「AI 影像輔助診斷模組」。透過IUA規範，HIS系統作為 Authorization Server 核發權杖給AI模組，讓AI模組能在不暴露HIS原始帳密的前提下，安全地存取PACS系統中的DICOMweb資源或其他RESTful API。

## 涉及系統角色(Systems Affected & Actors)

本賽道基於IUA規範，定義以下三種核心系統角色，參與廠商可根據產品屬性選擇擔任其中之一或多個角色進行測試。 本規範涉及涉及的系统有:

### 1. 授權用戶端 (Authorization Client)

- 系統範例: 行動醫療App、門診HIS系統、生理量測設備 (IoT)、AI影像診斷模組、FHIR查詢工具。
- 核心功能:
- 發起授權請求 (依情境選擇Authorization Code或Client Credentials模式)
- 安全地儲存並管理獲取之Access Token。
- 將Token嵌入HTTP Header中，呼叫資源伺服器之受保護API。
- 技術要求: 支援OAuth 2.1協定，若是行動端App需支援PKCE實作。
- SMART選項: EHR Launch與Standalone Launch將額外進行測試，參測者須提供選項作為驗證前設定(client registration)

### 2. 授權伺服器 (Authorization Server)

- 系統範例: 醫院身分驗證中心 (Identity Provider)、單一登入系統 (SSO)、雲端授權平台。
- 核心功能:
- 使用者認證: 提供使用者登入介面，確認其身分與權限。
- Token 發行: 依據 [ITI-71]交易核發符合規格之JWT Access Token。
- 宣告管理 (Claims): 在Token中封裝使用者識別 (sub)、過期時間 (exp)及醫療擴充宣告。
- 技術要求: 提供標準之欄位。
- SMART選項: Server需支援非對稱認證機制。Server在測試之前需與Client進行確認要採用哪種認證模式。

### 3. 資源伺服器 (Resource Server/FHIR Server)

- 系統範例: 臺灣核心實作指引 (TW Core IG)之FHIR伺服器、影像儲存中心 (PACS/RS)、醫療紀錄倉儲。
- 核心功能:
- Token 驗證: 解析傳入的JWT，驗證發行者簽章與時效性。
- 授權控制 (Access Control): 依據Token內的Scopes或Claims決定是否允許存取該筆醫療資源。
- 資料回傳: 驗證成功後回傳受保護之醫療資料，例如: FHIR Patient Resource。
- 技術要求: 具備Bearer Token驗證攔截機制，並能針對不同權限回傳401或403錯誤。
- SMART: Server確保能依據scope定義的內容回傳限定FHIR資料。此部分驗證需經過督察員現場面對面進行驗證。

## 規格(Specification)

涉及到的角色 (Actors)以及交易 (Transactions)，說明如下:

### 角色 (Actors)

 | Keyword | 名稱 | 描述
 | AUTH_CLIENT | Authorization Client | 一個負責獲取存取權杖並在後續交易中出示該權杖的用戶端系統
 | AUTH_SERVER | Authorization Server | 一個負責向發出請求的用戶端核發存取權杖的伺服器
 | RESOURCE_SERVER | Resource Server | 一個提供需經授權才能使用的服務之伺服器

### 交易 (Transactions)

 | 角色 | 交易 | 選項 | 交易編號
 | Authorization Client | Get Access Token | R | [ITI-71]
 | | Incorporate Access Token | R | [ITI-72]
 | | Get Authorization Server Metadata | R | [ITI-103]
 | | SMART Discovery Metadata | O | [SMART-1]
 | Authorization Server | Get Access Token | R | [ITI-71]
 | | Introspect Token | O(Note 1) | [ITI-102]
 | | Get Authorization Server Metadata | R | [ITI-103]
 | Resource Server | Incorporate Access Token | R | [ITI-72]
 | | Introspect Token | O(Note 1) | [ITI-102]
 | | Get Authorization Server Metadata | R | [ITI-103]
 | | SMART Discovery Metadata | O | [SMART-1]
- Note 1: 當選項為R時，需支援Token Introspection選項.

### 角色與交易關係圖

## 測試情境(Scenario)

### 授權授與類型 (Authorization Grant Types)

IUA設定檔在[ITI-71]交易中定義了兩種不同的獲取授權方法；因此，我們設計了兩種不同的JWT權杖測試。授權用戶端(Authorization Client)測試夥伴需根據其支援的授權授與類型選擇要執行的測試 :
- 用戶端憑證授與(Client Credentials Grant) [OAuth 2.1, Section 4.2]: 此授與類型優化給僅使用其用戶端憑證 (Client Credentials)來請求存取權杖的用戶端，且僅限於機密用戶端 (例如: 醫療設備、後端應用程式)。
- 授權碼授與 (Authorization Code Grant) [OAuth 2.1, Section 4.1]: 此授與類型優化給會使用使用者代理 (User Agents，如網頁瀏覽器)的機密用戶端。
- 測試中授權用戶端與資源伺服器必須支援相同的RESTful交易 (即取得的權杖將被整合進去的後續交易)。用戶端與伺服器應在開始測試前對此達成共識。
- 我們預期授權伺服器與資源伺服器通常會是同一個「測試系統」，意即授權伺服器管理著權杖，以授權對其自身資源的存取。因此，由同一個測試系統(或來自同一家公司的兩個系統)執行授權伺服器與資源伺服器角色是可以接受的。由於Gazelle測試管理系統禁止同一家公司的系統之間進行測試，您需要聯繫聯測技術支援組為您手動啟動此測試。
- 授權用戶端必須是與測試中的兩個伺服器角色 (授權/資源伺服器)不同的測試系統，且必須來自不同的單位。
- 測試主要端點[ITI-71] Get Access Token - Token endpoint。此外，用戶端還必須在資源伺服器上配置一個端點。也就是說，用戶端在取得權杖後，會將該權杖整合進一項交易並發送至資源伺服器的端點。

### client_id 的值

- 授權請求中包含一個必填的client_id參數。每個 IUA 授權用戶端角色都會被分配一個特定的client_id值。授權伺服器必須配置其系統，以識別其測試夥伴的client_id。

### client_secret 的使用

- 授權用戶端屬於「機密用戶端」，必須向授權伺服器進行身分驗證 (OAuth 2.1 Authorization Framework Sec 4.1.3)。IUA要求具備使用client_id進行識別，並將client_secret配合HTTP基本驗證 (HTTP Basic Authentication)使用的能力。在本測試中，所有用戶端的client_secret值統一設定為 "secret"。

### 權限範圍 (scope) 的值

- [ITI-71]授權回應中包含一個必填的scope參數。除了MHD之外，技術框架並未定義scope的具體值，而是視部署環境而定。在聯測，scope的定義值為該次授權所准許的「交易縮寫」(由IUA授權伺服器授權，並由相關資源伺服器實作)，說明如下 :

 | scope的值 | 交易內容
 | twcore | 賽道#1的測試交易
 | twpas | 賽道#2的測試交易
 | ips | 賽道#4的測試交易
 | smart | SMART選項。所有參與互通性測試者須針對scope內容進行事前設定與確認，需事前並告知督察員
 | other | 其他可能的測試選項，例如DICOMweb等應用、IoT設備等，需事前並告知督察員

### 步驟#1: 取得存取權杖

共有兩種模式:
- 用戶端憑證授與(Client Credentials Grant): 透過用戶端憑證授與 (Client Credentials grant type)取得並使用JWT。此互動流程如下圖所示[https://profiles.ihe.net/ITI/IUA/index.html#3714121-client-credential-grant-type] ITI TF-2: 3.71.4.1.2.1:

- 2. 授權碼授與 (Authorization Code Grant):
Authorization Code grant type - see ITI TF-2: 3.71.4.1.2.2 and 3.71.4.1.3.2
- 3. 取得存取權杖: 透過授權碼授與 (Authorization Code Grant)取得並使用JWT。此互動流程如下圖所示 [https://profiles.ihe.net/ITI/IUA/index.html#3714122-authorization-code-grant-type] ITI TF-2: 3.71.4.1.2.2:

### 步驟#2: 存取資料

在取得存取權杖後，用戶端將執行 Incorporate Access Token [ITI-72] 將 JWT 權杖放入Web Services交易的HTTP標頭中發送到資源伺服器。此互動流程如下圖 :

### 測試評估標準 (Evaluation)

所有的[ITI-71]與[ITI-72]交易皆必須使用 TLS 進行加密傳輸。

### 測試步驟說明

1. 步驟#1 未帶權杖之存取測試 (Unauthorized Access Check): 當用戶端 (Client)發起資源請求但未提供權杖時，資源伺服器 (Resource Server)應根據情況回應:
- 401 Unauthorized: 若用戶端未經身分驗證。
- 403 Forbidden: 若用戶端已通過身分驗證，但因未提供JWT權杖而被拒絕存取資源。
2. 步驟#2 : [ITI-71]取得存取權杖 (Get Access Token): 授權用戶端存取授權伺服器的權杖端點 (Token Endpoint)
- HTTP Header: 必須包含client_id與client_secret (採 Base-64 編碼之 HTTP Basic Authentication)。
- 請求參數:
- grant_type (必填): 固定為client_credentials。
- resource (選填): 欲存取之資源伺服器端點的單一識別碼。
- scope (選填): 用戶端宣告的權限範圍 (聯測定義值請參閱前述特別說明)。

### 請求範例

POST /token HTTP/1.1
Host: auth-server.example.com
Authorization: Basic {client_id}:{client_secret}的Base-64編碼
Content-Type: application/x-www-form-urlencoded

 grant_type=client_credentials&scope=ITI-78 ITI-83&resource=https%3A%2F%2F...

### 伺服器回應要求

- 1. 身分驗證: 授權伺服器利用client_id與client_secret驗證用戶端身分。
- 2. 簽發 JWT: 驗證成功後，回傳經數位簽章之JWT權杖 (聯測CAT測試指定使用RS256演算法)及其元數據。

### 存取權杖 (Access Token) 內含屬性要求

- token_type (R): 固定為Bearer
- access_token (R): JWT格式，包含以下核心宣告 (Claims):
- iss (R): 授權伺服器識別字串
- sub (R): 用戶端識別碼 (client_id)
- aud (R): 資源伺服端點識別碼 (應與請求中的resource一致)
- jti (R): 權杖唯一識別碼
- exp (R): 過期時間 (Numeric Date格式)
- scope (R): 授權伺服器核准的權限範圍
- iat (R): 簽發時間
- ihe_iua 擴展項目 (選填): 包含subject_name (姓名), subject_role (角色), purpose_of_use (用途)等臨床目的資訊
- SMART選項: 請依照SMART規定欄位填寫

### 回應範例

{
 "token_type": "Bearer",
 "access_token": "在此處放入簽章後的JWT TOKEN",
 "scope": "ITI-78 ITI-83",
 "expires_in": 3600
}

### 

1. 步驟#3: [ITI-72]整合權杖發起資源存取 (Incorporate Token)
- 授權用戶端將獲取的JWT權杖整合進Web Service交易中 (例如: FHIR查詢)，並發送至資源伺服器。
- 存取控制決策: 資源伺服器根據權杖內的宣告Claims與交易細節做出決定
- 預期結果: 資源伺服器判定權杖有效且未過期，繼續處理請求 (如:回傳FHIR查詢結果)

## 其他 (See Also)

- [https://profiles.ihe.net/ITI/IUA/index.html] IHE IUA
- [https://build.fhir.org/ig/HL7/smart-app-launch/] SMART App Launch

## 工作小組

### 召集人
- 陳巧珊 ↗| 國立臺北護理健康大學資管系 助理教授

### 成員
- 李建興 ↗| 玳康科技有限公司 技術經理
- 張修書 ↗| 臺中榮民總醫院 高級資訊工程師
