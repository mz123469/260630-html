# twcat 擷取索引（2026 台灣聯測松官網）

擷取日期：2026-10-31。網站是 React 單頁應用（SPA），沒有 JSON API：所有內容都打包在 `/assets/index-DY8QhNna.js` 裡（bundle 內只有一個對 `h.href` 的 `fetch`，沒有任何 `/api` 路由）。所以 `api/` 子資料夾沒有建立。
擷取方式：`Google Chrome --headless=new --virtual-time-budget=10000 --dump-dom`，再用 python html.parser 轉成文字。每個 .md 第一行都附上來源 URL。
各檔開頭的網站導覽列，以及結尾的「辦理單位／聯絡資訊」頁尾是每頁重複的樣板文字。

| 檔案 | URL | 摘要 |
|---|---|---|
| [摘要.md](摘要.md) | — | 繁中總整理：賽道、TW Core 賽道需求、參賽單位、資安／SMART 相關內容，並標示網站「沒有提供」的資訊。 |
| main.md | https://twcat.dicom.org.tw/main | 首頁：2026/6/8–6/11，地點為科技服務大樓創新廳（台北市民生東路四段 133 號）。主辦衛福部資訊處，執行單位為 MISAT 與北護資管。 |
| track-list.md | /track-list | 聯測總覽：#1 TW Core（國家）、#2 癌症用藥事前審查（政府）、#3 網路使用者授權（應用）、#4 IPS（國際）。另有長照賽道 /track-list/ltc/5、/ltc/6。 |
| track-1-twcore.md | /track-list/1 | **TW Core IG 賽道**：測試把 Simplified JSON 轉成符合 TW Core Profiles 的 FHIR（FHIRize）。測試版本為 TW Core IG 1.0.0（TWCDI v2.0）。列出四大模組的 Profiles、Level 1–5 情境（2026 年只測 1–3），以及測試案例 ID。 |
| track-2-twpas.md | /track-list/2 | 癌症用藥事前審查（TWPAS IG 1.2.2）：PAS Creator/Repository、MITW-75/76、情境 1/2/3（3-1 為選測）、Bundle 必要資源、DICOM→ImagingStudy。 |
| track-3-iua-smart.md | /track-list/3 | IHE IUA ＋ SMART 選項：三個角色、ITI-71/72/102/103、SMART-1；scope 值（twcore/twpas/ips/smart）、client_secret="secret"、RS256、JWT claims、401/403、TLS。 |
| track-4-ips.md | /track-list/4 | IPS：Content Creator/Consumer、PCC-1；測試案例 IPS_TWCORE-OPD-010/011、MIX-001~003（與 Track 1 Level 3 相同）；銜接 10/19–23 日本淺草的亞太 IHE 聯測。 |
| ltc-5-longterm-care.md | /track-list/ltc/5 | 長照聯測（10/29–30）：OAuth2（LTC-011/012），以及長照共通／居家照護／費用審核／在宅急症的情境與交易表（LTC-1xx）。 |
| ltc-6-hah.md | /track-list/ltc/6（與 /hah 相同） | 在宅急症照護資料交換（HAH）：2026/12/9 工作坊、2027/1/7–8 Projectathon，情境 1–3 與交易。 |
| specification.md | /specification | 規格與資源：運作機制、準備工具（validator.dicom.tw、validator_cli、dicom-to-fhir、FHIRfox）、報名資格、Gazelle、領域分類、Level I/II、Keycloak、網路架構。 |
| bundle-hidden-rules.md | JS bundle | 規格頁未渲染成可見文字的字串：Level I 規則（必須用 OAuth2 Client Credentials 向大會 Keycloak 取 Token 才能存取 FHIR/DICOMweb 主機）、Level II 規則（Client 須與 ≥3 家 Server 互測）、長照活動議程。 |
| official-result.md | /official-result | **聯測結果**：各賽道通過的單位、產品、版本與等級（Track 1 共 23 家，Track 2 共 12 家，Track 3 IUA/SMART 互測矩陣，Track 4 Creator/Consumer）。 |
| product-confirm.md | /product-confirm | 證書發放名單：35 個單位（編號 01–35）。 |
| certificate.md | /certificate | 證書申請方式：寄信到 misat.tw@gmail.com，免費，約 6 個工作天，由 MISAT 核發。 |
| member.md | /member | 督察員（Monitor）13 人與工作人員 3 人。 |
| contributor-01.md | /contributor/01 | Track 1 工作小組：召集人連中岳；成員李祥豪、楊宇凡、龔筠庭；測試資料小組（北護資管）。 |
| introduction.md | /introduction | 聯測松機制簡介與各利害關係人的效益（一般性內容）。 |
| recruit.md | /recruit | 督察員招募條件。 |
| ihe.md | /ihe | 2026 亞太（IHE-J）聯測松頁面：只渲染出活動總覽，分頁內容（日程、費用）沒有取得。 |
| closed.md | /closed | 報名已於 2026/06/02 17:00 截止。 |
| images/ | /assets/* | 關鍵圖片：twcore-scenarios（情境等級與能力聲明）、twcore-fhirfox（測試資料流程）、platform-arch（網路架構）、agenda1（議程）、iua-*、operation-mechanism、2026IHESchedule 等。 |
| raw/ | — | 原始資料：SPA 外殼、JS bundle（index.js）、各頁 dump-dom HTML 與轉出的 txt（包含重複路由）。 |

重複或無效的路由：/track-list/0、/7、/ltc/7 都回到總覽頁；/track-list/5 與 /ltc/0–3 都等於 ltc/5；/track-list/6、/ltc/4 都等於 /hah；/contributor 等於 /contributor/01。
