# 白帽攻擊紀錄（第五輪）：匯入聯測 JSON

日期：2026-11-03。對象：v14（`POST /api/fhirfox/convert｜validate｜upload`、`ImportView.vue`）。
環境：本機後端 :3000（真的 validator_cli）；「上傳到一半失敗」用另開的後端 :3002 接本機壞掉的 FHIR Server（:4010，回 500／HTML／筆數不對／位置亂碼／不回應／關掉），不碰公開伺服器。
只有 Q16 的正常上傳寫到 twcore.hapi.fhir.tw（假資料，病人身分證 Q200000001），沒有 PUT、沒有更新任何既有資源。

結果欄：**發現→修** = 有問題已修；**守住** = 設計時就擋住；**接受** = 不改，原因寫在說明。
每一項都用 curl 實打（攻擊檔由 `gen.py` 從範例改出來），重跑方式見最後一節。

## Q. 大小與格式

| # | 攻擊方式 | 預期 | 結果 | 說明 |
|---|---|---|---|---|
| Q1 | 1.6 MB 的 JSON（1300 筆、每筆 note 900 字，每個值都在上限內） | 413，不解析 | 守住：HTTP 413「資料太大」 | `/api/fhirfox` 專用 1 MB 解析器，其他路由維持 100 KB |
| Q2 | 101 筆 | 400 | 守住：400「一次最多 100 筆，這份有 101 筆」 | 先數筆數，不逐筆轉換 |
| Q3 | 不是 JSON（純文字） | 400 | 守住：400「JSON 格式錯誤」 | 全站錯誤處理，不回堆疊 |
| Q4 | 傳一個 FHIR transaction Bundle 物件（不是陣列） | 400 | 守住：400「要貼上 FHIRfox 的 Simplified JSON…」 | 只收陣列或 `{ resources: [] }`，不收別人做好的 Bundle |
| Q5 | 巢狀炸彈：20 萬層 `[[[…]]]`（400 KB） | 400，伺服器不當掉 | 守住：400「[0] 每一筆要是一個物件」；之後 sample 仍 200 | V8 的 JSON.parse 不遞迴，深度不會撐爆堆疊；我們只看最外層 |
| Q6 | 欄位值是 1000 層巢狀陣列（`name: [[[…]]]`） | 400 | 守住：400「name 只能是文字、數字或 true／false」 | 每個值只收 primitive，物件、陣列（參照欄位除外）一律擋 |
| Q7 | 欄位值 1001 字 | 400 | 守住：400「name 超過 1000 字」 | 字串另外去控制字元 |

## R. 偷帶欄位與 id

| # | 攻擊方式 | 預期 | 結果 | 說明 |
|---|---|---|---|---|
| R1 | 病人那筆偷帶 `meta.profile: http://evil/x`、`request: { method: PUT, url: Patient/pat-example }`、`text.div: <script>` | 照常轉換但全部不採用；上傳仍是 POST | 守住：200，資訊「沒有用到的欄位：meta、request、text」；輸出 meta 是 Patient-twcore、text 是固定的 `Patient/1`；壞伺服器 :4010 收到的 transaction 只有 POST、0 筆帶 id | 輸出只照官方 CSV 規則組，輸入裡的 FHIR 結構一律不抄 |
| R2 | `id: "pat-example/_history/1"`（想讓參照指到伺服器上的資源） | 400 | 守住：400「id 必填，只能用英數、連字號、句點」 | 來源 id 只用來在同一份資料裡互相參照，輸出時刪掉 |
| R3 | `resourceType: "bundle"` | 400 | 守住：400「resourceType 要是 … 其中之一」 | 只收規則表裡的 14 種 |
| R4 | `__proto__`、`constructor.prototype` 欄位（原型污染） | 不污染 | 守住：200，列為沒有用到的欄位；`({}).isAdmin` 仍是 undefined | JSON.parse 產生的是自有屬性；轉換只讀規則表列出的欄位 |

## S. 參照

| # | 攻擊方式 | 預期 | 結果 | 說明 |
|---|---|---|---|---|
| S1 | 診斷的 `patientId: "pat-example"`（共用伺服器上別人的病人） | 400 | 守住：400「參照的 Patient/pat-example 不在這份資料裡」 | 所有參照都要能換成同一份資料的 urn:uuid，否則不准上傳（不然會寫進別人病歷） |
| S2 | 報告的 `resultId: "999"`（不存在） | 400 | 守住：400「參照的 Observation/999 不在這份資料裡」 | 同上 |
| S3 | `patientId: "../Patient/1"`（路徑穿越） | 400 | 守住：400「patientId 的 id「../Patient/1」格式不對」 | 參照 id 跟 FHIR id 同規則 |
| S4 | `patientType: "organization"`（把 Encounter.subject 換成機構） | 400 | 守住：400 × 6（「參照的 Encounter/1 屬於另一位病人」等） | 被跨病人檢查擋下；validator 也會擋 subject 的 targetProfile |
| S5 | 跨病人：加第二位病人，檢驗 Observation 掛病人 2、卻指向病人 1 的 Encounter | 400 | **發現→修**：第一版會照轉；加了跨病人檢查後 400「參照的 Encounter/1 屬於另一位病人」，連帶報告也被擋 | 每筆的 subject／patient 要跟它參照的資源的 subject 相同 |

## T. 內容

| # | 攻擊方式 | 預期 | 結果 | 說明 |
|---|---|---|---|---|
| T1 | 病人姓名 `<img src=x onerror=alert(1)>`、備註 `"><script>alert(document.cookie)</script>` | 只當文字 | 守住：轉換照存成文字；narrative 是固定的 `<p>Patient/1</p>`（不放使用者內容）；畫面 `<pre>` 用文字插值，`img[src=x]` 與 script 數量 0、沒有 alert（截圖 37） | 沒有上傳到公開伺服器 |
| T2 | 院內碼不在對照表、必填欄位缺、數值欄位是 "abc"，一次送 | 400，三個錯一次列出 | 守住：三筆錯誤各自寫「[第幾筆] 型別/id.欄位」（截圖 36） | 不丟例外，逐欄收集 |

## U. 限流與資源

| # | 攻擊方式 | 預期 | 結果 | 說明 |
|---|---|---|---|---|
| U1 | /convert 連打 62 次 | 第 61 次起 429 | 守住：第 45 次起 429 | 前面 Q／R／S／T 的 18 次在同一分鐘內，加起來剛好超過 60 |
| U2 | /validate 連打 8 次 | 第 7 次起 429 | 守住：第 7、8 次 429「驗證太頻繁」 | validator 一次約 12 秒、2 GB；另外排隊一次只跑一個，不會同時開多個 Java |
| U3 | validator 不在（jar 被刪或沒裝 Java） | 不上傳 | 守住：503「沒辦法用 TW Core 1.0.0 驗證，先不上傳」 | 寧可不上傳，也不跳過驗證 |

## V. 上傳到一半失敗（壞伺服器 :4010）

| # | 伺服器怎麼壞 | 預期 | 結果 | 說明 |
|---|---|---|---|---|
| V1 | 回 500 OperationOutcome（模擬第 7 筆資料庫錯誤） | 失敗，說清楚狀態不確定 | **發現→修**：原本寫「整包都沒有寫入」，5xx 我們其實不能確定。改成 500「FHIR Server 內部錯誤…transaction 規定失敗時整包不寫入，但請到伺服器確認」，並列出伺服器的錯誤訊息 | 4xx 才說「整包沒有寫入」 |
| V2 | 回 200 但 body 是 HTML | 502 | 守住：502「回應不是對應的 transaction-response，無法確認有沒有上傳成功」 | |
| V3 | 回 transaction-response 但少 3 筆 | 502 | 守住：同上 | 筆數要跟送出的一樣 |
| V4 | 筆數對，但 location 是 `Patient/<script>alert(1)</script>` | 502，不顯示位置 | **發現→修**：原本回 200 success、id 空白。改成每筆型別、id、201／200 狀態都要對，否則 502「回應的資源位置不正確，無法確認寫入了哪些資源」 | |
| V5 | 不回應 | 逾時，說不確定 | **發現→修**：原本寫「連不到」。改成 504「逾時沒有回應，不確定有沒有寫入，請到伺服器確認後再決定要不要重送」（20 秒逾時，實測 31 秒含驗證） | |
| V6 | 伺服器關掉（連線被拒） | 502 | 守住：502「連不到 FHIR Server，沒有送出任何資料」 | |
| V7 | 真伺服器拒收（twcore.hapi.fhir.tw 跑 0.3.x，PractitionerRole.specialty 用 SNOMED） | 422，整包不寫 | 守住：422，第二次上傳時病人回 201 新建（不是 200 沿用），證明前兩次被拒時什麼都沒寫 | transaction 的原子性由伺服器保證；範例拿掉 specialtyCode（spec 已知事項 5） |

## W. 接受的風險

| # | 項目 | 說明 |
|---|---|---|
| W1 | 重複上傳同一份會新增第二份就醫、診斷、檢驗等 | FHIRfox 的 Encounter identifier 是 `idSystem|1` 這種，在共用伺服器上不唯一，拿來 If-None-Exist 反而會黏到別人的資料。只有機構、醫師、病人（身分證）用識別碼沿用；畫面上傳前會提醒 |
| W2 | 用別人的身分證匯入，資料掛到那位病人名下 | 同第四輪 N4：沒有登入就擋不了；示範系統、只用假資料 |
| W3 | 匯入端點沒有認證 | 同 D18：後端只聽 127.0.0.1 |

## 修正後重跑

- 改動：`services/fhirfoxConverter.js`（跨病人檢查 S5）、`routes/fhirfox.js`（V1、V4、V5 的判斷與訊息）、`ImportView.vue`（步驟 5 清單 class 跟導覽列撞名，改 `urllist`）、`App.vue`（手機導覽列四顆按鈕會溢出，縮小間距並允許換行）。
- 重跑：Q1–V7 全部照上表；範例 convert 200 → validate Error 0 → upload 201 × 12（第二次機構／醫師／病人 200 沿用）；validator_cli 12 檔 Error 0；手機 390 寬五個頁面 scrollWidth = 390。
- 重跑方式：攻擊檔是把 `GET /api/fhirfox/sample` 的範例照「攻擊方式」欄改一個地方；壞伺服器是 40 行的 node http 伺服器，`/mode/<oo500|html|short|badloc|hang|record>` 切換回應，後端用 `PORT=3002 FHIR_BASE_URL=http://127.0.0.1:4010/fhir node server.js` 接它。兩者跟前幾輪的測試腳本一樣沒有放進版控。
