#!/usr/bin/env bash
# 本機驗證器（C 聯測模擬第 22 頁）：不靠線上伺服器，把 FHIR JSON 對 TW Core IG 1.0.0 驗到 Error = 0。
# 需要 Java 11 以上。第一次執行會下載 validator_cli.jar 和 IG 套件，之後走快取。
# 用法：  ./validate.sh                 驗 tools/examples/ 底下全部
#         ./validate.sh 你的檔.json     只驗一個檔
set -e
cd "$(dirname "$0")"
JAR=validator_cli.jar
if [ ! -f "$JAR" ]; then
  echo "下載 HL7 官方 validator_cli.jar ..."
  curl -L -o "$JAR" https://github.com/hapifhir/org.hl7.fhir.core/releases/latest/download/validator_cli.jar
fi
TARGET="${1:-examples}"
java -Dfile.encoding=UTF-8 -jar "$JAR" "$TARGET" -version 4.0.1 -ig tw.gov.mohw.twcore#1.0.0 -html-output validation-report.html
echo "報告：$(pwd)/validation-report.html （Error 一定要修、Warning 看狀況、Information 可先放著）"
