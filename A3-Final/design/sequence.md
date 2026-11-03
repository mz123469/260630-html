# 練習 3：寫入流程的序列圖與四個欄位

圖：`sequence.png`（`sequence.mmd`，一般使用版：病人端寫入到回覆，再接醫師端卡片與接受建議；聯測版在 `sequence-connectathon.png`）。失敗分支在 `flowchart_detail.png`。四個欄位兩版相同。

| 欄位 | 本專案的決定 |
|---|---|
| 存放位置 | FHIR Server `https://twcore.hapi.fhir.tw/fhir` 的 Observation，Profile `Observation-screening-assessment-twcore`；同一次回報另寫 Encounter 與 Condition 互相參照 |
| 資料代碼 | 自訂 CodeSystem `http://example.org/fhir/ai-triage/CodeSystem/ai-triage`，code `urgency-score`（LOINC 80615-8 語意不符，不用） |
| 數值欄位 | `valueQuantity.value` 1–10 整數，單位 UCUM `{score}`；`component` 放情緒（valueString）與需人工介入（valueBoolean）；`note` 放摘要與症狀 |
| 識別碼格式 | Patient id：英數、連字號、句點，1–64 字（FHIR id 規則）；身分證 1 字母＋9 數字只放在 `identifier`，不當 id |
