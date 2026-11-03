# Final：AI 分流系統（TW Core／聯測松版）

兩種模式（導覽列切換）：**一般使用**（病人端 → 醫師端 → 醫師查看）與**聯測順序**（① 建立資料 → ② 病人回報 → ③ 醫師查看 → ④ 匯入 JSON：聯測松 Track 1 的 FHIRfox Simplified JSON 轉 TW Core），同一個後端。

資料夾照 11/03 講義的四個子資料夾配置，另加 `package/` 與 `archive/`。

| 資料夾 | 放什麼 | 先看 |
|---|---|---|
| `Proj/` | 程式：後端 `AI-Patient-Triage-System/`、前端 `Client/`、驗證工具 `tools/`、一鍵啟動 `start-mac.command`／`start-windows.bat` | `package/README.md` 第 2 節 |
| `design/` | 講義檔名＝一般使用版：架構圖 `architecture.png`（畫布版）／`.svg`／`.mmd`（練習 1）、細部流程 `flowchart_detail.png`／`.mmd`（練習 2，菱形判斷、每個「否」寫狀態碼）、序列 `sequence.png`／`.mmd`＋四欄位 `sequence.md`（練習 3）、規格 `spec_step1.txt`（練習 4）。聯測版同名加 `-connectathon`；`architecture-full`（完整版）；功能版 `flowchart_system`、`sequence_system`；聯測匯入（v14）`flowchart_detail-import`、`sequence-import`。每張都有 .mmd 可貼到 mermaid.live 改 | `architecture.png` |
| `screenshots/` | 課堂 12 張（講義指定檔名）：`step0_folder`、`step0_explorer`、`step0_server`、`warmup`、`step1_architecture`、`step1_text`、`step2_detail`、`step3_sequence`、`step4_spec`、`step5_run`、`step6_bad`、`step7_log`；`app/`：系統 24 張畫面＋後端終端機紀錄（測試包裡的 `截圖/` 就是它）；`architecture-general-原圖8節點` 是簡化前的架構圖 | |
| `notes/` | 交接文件：`版本與決策異動紀錄.md`（先看）、`TWCore-1.0.0-自評表.md`、`白帽攻擊紀錄`（第二～五輪，第五輪是匯入聯測 JSON）、`實測紀錄`、`簡報資源對照與實測計畫.md`、`ai_log_step1.md`（AI 協作紀錄）、`twcat/`（聯測松官網擷取） | `版本與決策異動紀錄.md` |
| `package/` | 要帶出去的東西：`README.md`（安裝與操作）、`測試指南.md`、測試包 zip、`build.sh`（重打） | `說明.md` |
| `archive/` | 本專案沒用到的舊檔，刪掉不影響 | `說明.md` |

`.env`、`node_modules/`、`logs/`、`validator_cli.jar`、zip 都不進版控。
