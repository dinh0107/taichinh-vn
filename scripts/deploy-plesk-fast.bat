@echo off
REM ============================================================
REM Plesk Windows — deploy NHANH (KHONG build tren server)
REM
REM Production Additional deployment actions (1 dong):
REM   call scripts\deploy-plesk-fast.bat
REM
REM Flow:
REM   GitHub Actions: lint → build → SFTP upload .next + _next
REM   Plesk Git pull: npm deps + prisma generate (script nay)
REM
REM Secrets / docs: docs/DEPLOY_PLESK.md
REM ============================================================
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
  echo ERROR: Thieu .next — doi GitHub Actions deploy SFTP xong, hoac build local.
  echo   CI: push main → job "Deploy to Plesk (SFTP)"
  echo   Local: npm run build  roi copy .next + _next len httpdocs
  exit /b 1
)

set NODE_ENV=production

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
if errorlevel 1 (
  echo EPERM? Stop Node.js app in Plesk, then Redeploy.
  exit /b 1
)

if exist "prisma\migrations" (
  echo ==^> prisma migrate deploy
  call npx prisma migrate deploy
  if errorlevel 1 echo WARN: migrate failed — check DATABASE_URL
)

REM iisnode watches web.config — touch to recycle worker
echo ==^> Restart signal ^(touch web.config^)
powershell -NoProfile -Command "(Get-Item -LiteralPath 'web.config').LastWriteTime = Get-Date" 2>nul
if errorlevel 1 copy /b web.config +,, >nul 2>&1

echo ==^> Deploy nhanh OK.
endlocal
exit /b 0
