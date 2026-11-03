#!/bin/bash
# macOS 一鍵啟動：雙擊這個檔案（第一次若被擋，按右鍵 →「打開」）。
# 會安裝套件 → 啟動後端與前端 → 打開瀏覽器。後端的 [FHIR] 紀錄會印在這個視窗，按 Ctrl+C 全部結束。
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null; then
  echo "找不到 Node.js，請先安裝 Node.js 22（https://nodejs.org/）再執行一次。"
  read -r -p "按 Enter 結束"; exit 1
fi

# 3000（後端）、5173（前端）要空著，否則畫面會連不到後端
for p in 3000 5173; do
  if lsof -nP -iTCP:$p -sTCP:LISTEN >/dev/null 2>&1; then
    echo "埠 $p 已被占用（多半是上次沒關的程式）。用 lsof -iTCP:$p -sTCP:LISTEN 找出來關掉，再執行一次。"
    read -r -p "按 Enter 結束"; exit 1
  fi
done

# 第一次執行：建立 .env，請測試者填入自己的 Gemini API Key
if [ ! -f AI-Patient-Triage-System/.env ]; then
  cp AI-Patient-Triage-System/.env.example AI-Patient-Triage-System/.env
  echo "已建立 AI-Patient-Triage-System/.env，請填入 GEMINI_API_KEY、存檔後再執行一次。"
  open -e AI-Patient-Triage-System/.env
  read -r -p "按 Enter 結束"; exit 0
fi

(cd AI-Patient-Triage-System && npm install --no-fund --no-audit) || { read -r -p "後端套件安裝失敗，按 Enter 結束"; exit 1; }
(cd Client && npm install --no-fund --no-audit) || { read -r -p "前端套件安裝失敗，按 Enter 結束"; exit 1; }

(cd AI-Patient-Triage-System && exec node server.js) & BACK=$!
(cd Client && exec npm run dev) & FRONT=$!
trap 'kill $BACK $FRONT 2>/dev/null' EXIT INT TERM

sleep 5
open http://localhost:5173/setup
echo ""
echo "已打開 http://localhost:5173/setup 。照《測試指南.md》操作，按 Ctrl+C 結束。"
wait
