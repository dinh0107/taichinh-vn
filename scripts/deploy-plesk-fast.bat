@echo off
REM Plesk Windows — deploy NHANH (khong build tren server)
REM Dung khi da build .next o may local / CI roi upload len.
setlocal

cd /d "%~dp0.."
if errorlevel 1 (
  echo Failed to cd to app root
  exit /b 1
)

echo ==^> Dir: %CD%
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js not in PATH
  exit /b 1
)

if not exist ".next\prerender-manifest.json" (
  echo ERROR: Thieu .next — hay build local roi upload thu muc .next len server.
  echo   May local: npm run build
  echo   Roi copy .next vao httpdocs
  exit /b 1
)

REM Chi cai lai khi co package-lock moi (nhanh hon npm ci moi lan)
if exist "node_modules\next" (
  echo ==^> node_modules co san — bo qua npm ci
) else (
  echo ==^> npm ci
  call npm ci --omit=dev
  if errorlevel 1 exit /b 1
)

echo ==^> prisma generate
call npx prisma generate
if errorlevel 1 exit /b 1

echo ==^> Deploy nhanh OK. Restart Node.js trong Plesk.
endlocal
