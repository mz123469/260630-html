# FHIRfox 轉換規則（原封不動複製）

來源：https://github.com/cylab-tw/fhirfox `dataset/converter/`（commit `7d2951edb836b9f7fc8e924a93aef318529eef9f`，2026-11-03 取得）
授權：Apache License 2.0（同資料夾 `LICENSE`）。本資料夾的 CSV 沒有修改。

聯測松 Track 1 的輸入是 FHIRfox 的「Simplified JSON」：每筆是一個扁平物件，例如
`{ "id": "1", "resourceType": "patient", "idNumber": "A123456789", "name": "王小明", "gender": "male", ... }`。
`services/fhirfoxConverter.js` 照這裡的三種表轉成 TW Core 1.0.0 FHIR：

| 檔案 | 內容 |
|---|---|
| `generator-rules/tw.gov.mohw.twcore.csv` | 每個原始欄位對到哪個 FHIR path、怎麼轉（copy／code_map／constant／build_reference） |
| `code-mappings/*.csv` | 院內碼 → 國際代碼（例如 `Lab-0001` → LOINC `6690-2`、`Med-0001` → ATC） |
| `resource-profiles.csv` | 每種資源套哪個 TW Core Profile（生命徵象依 LOINC 選子 Profile） |

更新：重新從 GitHub 複製這三樣東西蓋掉即可，程式不用改。
