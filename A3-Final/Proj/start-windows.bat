@echo off
rem Windows 一鍵啟動：雙擊這個檔案。
rem 會安裝套件，開兩個視窗分別跑後端與前端，再打開瀏覽器。後端的 [FHIR] 紀錄看「後端」那個視窗。
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo 找不到 Node.js，請先安裝 Node.js 22（https://nodejs.org/）再執行一次。
  pause
  exit /b 1
)

rem 3000（後端）、5173（前端）要空著，否則畫面會連不到後端
for %%P in (3000 5173) do (
  powershell -NoProfile -Command "if (Get-NetTCPConnection -LocalPort %%P -State Listen -ErrorAction SilentlyContinue) { exit 1 }"
  if errorlevel 1 (
    echo 埠 %%P 已被占用（多半是上次沒關的程式）。請先關掉它再執行一次。
    pause
    exit /b 1
  )
)

rem 第一次執行：建立 .env，請測試者填入自己的 Gemini API Key
if not exist "AI-Patient-Triage-System\.env" (
  copy "AI-Patient-Triage-System\.env.example" "AI-Patient-Triage-System\.env" >nul
  echo 已建立 AI-Patient-Triage-System\.env，請填入 GEMINI_API_KEY、存檔後再執行一次。
  notepad "AI-Patient-Triage-System\.env"
  exit /b 0
)

pushd "AI-Patient-Triage-System"
call npm install --no-fund --no-audit
if errorlevel 1 goto fail
popd
pushd "Client"
call npm install --no-fund --no-audit
if errorlevel 1 goto fail
popd

start "AI 分流系統 - 後端（[FHIR] 紀錄在這裡）" cmd /k "cd /d "%~dp0AI-Patient-Triage-System" && node server.js"
start "AI 分流系統 - 前端" cmd /k "cd /d "%~dp0Client" && npm run dev"
timeout /t 6 >nul
start "" http://localhost:5173/setup
echo 已打開 http://localhost:5173/setup ，照《測試指南.md》操作。要結束就把兩個黑色視窗關掉。
pause
exit /b 0

:fail
popd
echo 套件安裝失敗，請看上面的錯誤訊息。
pause
exit /b 1
