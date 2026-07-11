@echo off
REM Plesk Windows — chạy sau Git pull (Additional deployment actions)
setlocal

cd /d "%~dp0.."
if errorlevel 1 (
  echo Failed to cd to app root
  exit /b 1
)

echo ==^> Dir: %CD%
echo ==^> Node:
where node
node -v
if errorlevel 1 (
  echo Node.js not in PATH. Use Plesk Node.js 20.
  exit /b 1
)

echo ==^> npm ci
call npm ci --omit=dev
if errorlevel 1 exit /b 1

echo ==^> prisma generate
call npx prisma generate
if errorlevel 1 exit /b 1

if exist "prisma\migrations" (
  echo ==^> prisma migrate deploy
  call npx prisma migrate deploy
)

echo ==^> next build
call npm run build
if errorlevel 1 exit /b 1

echo ==^> Deploy OK. Restart Node.js app in Plesk.
endlocal
