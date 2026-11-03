<!-- source: https://twcat.dicom.org.tw/assets/index-DY8QhNna.js (string literals not rendered as visible text by headless Chrome) -->
# 規格頁隱藏區塊（自 JS bundle 擷取）

## 驗測規則分級 / Level I / Level II 規則（原始字串）
```
驗測規則分級:{說明:"聯測根據性質區分二個等級。Level I為基本能力驗證，系統需根據各賽道的測試情境(Scenario)的測試腳本(Test Script)，與主辦單位提供的主機系統進行驗證。Level II為互通性驗證，要求測試系統需與三家不同的系統進行驗證，須通過各賽道的測試情境的測試腳本。下表為驗測規則分級整理與說明。",驗測規則分級整理表:[{等級:"Level I",名稱:"能力聲明驗證 (Capability Statement)",描述:"須通過賽道指定情境之測試腳本"},{等級:"Level II",名稱:"互通性驗證 (Interoperability)",描述:"須通過賽道指定情境之測試腳本。一個系統至少需與三家不同參加者進行交互認證"}],補充說明:["提供OAuth2 Server，驗證參加單位OAuth2 Client，大會提供Keycloak Server作為認證主機。"
"參考JavaScript實作OAuth2範例: [Javascript_OAuth_Example](https://github.com/cylab-tw/Javascript_OAuth_Example)"]},"Level I 能力聲明驗證規則說明":{規則:["1. 參加者須具備指定賽道規範的標準實作能力，需滿足指定參加的賽道的角色的測試劇本(Test Script),並符合測試規範，並由督察員認證。"
"2. 參加者須具備[OAuth 2.0 RFC 6749, section 4.4: Client Credentials flow](https://datatracker.ietf.org/doc/html/rfc6749#section-4.4)標準實作能力，在存取DIOCMweb以及FHIR聯測主機以前，需經過Client Credentials flow向大會授權主機 (Keycloak OAuth Server)取得存取授權Token後，使用Token存取DIOCMweb以及FHIR聯測主機"],例外條件:"例外條件: 若是癌藥事前審查賽道，參加者採用DICOM DMISE服務上傳DICOM的情形，則排除OAuth2條件",流程定義與圖示:{說明:"Client Credentials Flow定義請參考下圖(節錄標準規範)",圖示:["+---------+                                  +---------------+"
"|         |                                  |               |"
"|         |>--(A)- Client Authentication --->| Authorization |"
"| Client  |                                  |     Server    |"
"|         |<--(B)---- Access Token ---------<|               |"
"|         |                                  |               |"
"+---------+                                  +---------------+"],備註:"Client credentials flow範例 - GET FHIR Server"}},"Level II 互通性驗證證規則說明":["參測系統為Client類型，包含:Source/Creator/Consumer，需通過Level I指定賽道的測試情境後，需自行或透過大會協助找尋參賽單位扮演Server的系統(Repository)，每一個Client需與三家以上的Server類型產品進行介接測試，並由督察員認證。"],賽道對應驗測規則分級說明:[{分類:"國家",賽道:"#1",規範名稱:"台灣核心實作指引",適用分級:"I",註記:""},{分類:"政府",賽道:"#2",規範名稱:"癌症用藥事前審查(Prior Authorization Support)",適用分級:"I",註記:""},{分類:"應用",賽道:"#3",規範名稱:"網路使用者授權 (Internet User Authorization)",適用分級:"II",註記:"授權用戶端與資源伺服器 (Resource Server)可支援#1, #2, #4的交易"},{分類:"國際",賽道:"#4",規範名稱:"國際病人摘要 (International Patient Summary)",適用分級:"I, II",註記:"同步採用專案聯測"}],
```

## 長照系列活動議程（原始字串）
```
[{id:"workshop",category:"教學場",title:"FHIR 實戰工作坊",sessions:[{date:"2026/09/29（二）",time:"10:00–16:30"}],venue:"民生科技服務大樓 102 會議室",address:"105 臺北市松山區精忠里民生東路四段 133 號",content:"政策銜接與聯測介紹說明、Profile 實作及聯測系統教學",topics:["智慧長照 FHIR 政策與治理／衛生福利部電子病歷交換中心賴建宏計畫主持人","FHIR 長照實作指引介紹／矽塔資訊服務有限公司楊宇凡執行長","FHIR 長照資料與工具應用／矽塔資訊服務有限公司楊宇凡執行長","長照專案聯測介紹與賽道說明／矽塔資訊服務有限公司楊宇凡執行長","聯測系統 Gazelle + Prism 使用教學／社團法人台灣醫療影像資訊標準協會沈伯安聯測系統架構師"],note:"※本實體課程限額 30 名。若報名人數超過上限，後續報名者將提供線上直播連結，線上參與僅供觀看聆聽，不提供實作環節。"},
{id:"seminar",category:"戰情場",title:"科技照護戰情平台研討會",sessions:[{date:"2026/10/29（四）",time:"10:00–16:30"}],venue:"民生科技服務大樓 101 會議室",address:"105 臺北市松山區精忠里民生東路四段 133 號",content:"銀光科技戰情平台分享與聯測說明",topics:["先進醫資股份有限公司／高齡智慧照護新模式－以行動科技打造居家照護最後一哩路","聯億通股份有限公司／AI 物聯網與非侵入式高齡照護新思維","高雄榮總高齡醫學部梁志光主任／智齡中樞：醫學中心驅動跨域連續性照護的智慧串連新模式","諾歐科技股份有限公司／零時差的協作，不加班的守護","好所宅診所黃子華醫師暨創辦人／建構以長者為中心的在宅醫療共照網路","惠德醫院趙耿裕院長／醫院的長照資訊交換需求"]},
{id:"connectathon",category:"聯測場",title:"臺灣長期照顧 FHIR 聯測",sessions:[{date:"2026/10/29（四）",time:"13:30–16:30"},
{date:"2026/10/30（五）",time:"10:00–16:30"}],venue:"民生科技服務大樓 2 樓 Living Lab+",address:"105 臺北市松山區精忠里民生東路四段 133 號",content:"臺灣長期照顧 FHIR 正式聯測",topics:["賽道1 長照共通資料交換","賽道2 居家照護資料交換","賽道3 長照服務費用支付審核","賽道4 在宅急症照護資料交換"]}]
```
