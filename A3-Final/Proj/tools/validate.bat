@echo off
rem 本機驗證器（C 聯測模擬第 22 頁）：把 json 檔拖到這個 bat 上就驗；直接點兩下則驗 examples 資料夾。
rem 需要 Java 11 以上。第一次執行會下載 validator_cli.jar 和 IG 套件。
cd /d "%~dp0"
if not exist validator_cli.jar (
  echo 下載 HL7 官方 validator_cli.jar ...
  curl -L -o validator_cli.jar https://github.com/hapifhir/org.hl7.fhir.core/releases/latest/download/validator_cli.jar
)
set TARGET=%~1
if "%TARGET%"=="" set TARGET=examples
java -Dfile.encoding=UTF-8 -jar validator_cli.jar "%TARGET%" -version 4.0.1 -ig tw.gov.mohw.twcore#1.0.0 -html-output validation-report.html
echo 報告：%~dp0validation-report.html
pause
