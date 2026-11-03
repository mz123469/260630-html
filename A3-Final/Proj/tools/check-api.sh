#!/usr/bin/env bash
# 講義練習 5／6 的 curl 驗收：合法輸入回 200 與分數；空 body、識別碼格式錯誤回 400 並附說明。
# 後端要先在跑（node server.js）。用法：tools/check-api.sh [patientId]（病人要先在「① 建立資料」建好）
B=${API:-http://localhost:3000}
PID=${1:-patient-tw-example}
run() { echo "== $1（預期 $2）"; shift 2; curl -s -w '\nHTTP %{http_code}\n' -H 'Content-Type: application/json' "$@"; echo; }
run "合法輸入" "200，body 有 urgency_score" -X POST "$B/api/triage/analyze" -d "{\"patientId\":\"$PID\",\"patientText\":\"昨天開始頭痛，晚上睡不好\"}"
run "空 body" "400 並說明" -X POST "$B/api/triage/analyze" -d '{}'
run "識別碼格式錯誤" "400 並說明" -X POST "$B/api/triage/analyze" -d '{"patientId":"陳 小明","patientText":"測試"}'
