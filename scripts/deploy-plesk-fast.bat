@echo off
REM ============================================================
REM Plesk Windows — deploy NHANH (KHONG build tren server)
REM
REM CI order (bat PHAI doi tar, khong ket thuc som):
REM   1) Webhook → bat nay bat dau DOI deploy-build.tar.gz (toi da ~5 phut)
REM   2) CI upload tar trong luc bat dang doi
REM   3) bat extract + sync CSS + prisma + restart
REM
REM Docs: docs/DEPLOY_PLESK.md
REM ============================================================
setlocal EnableExtensions

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

REM Doi CI upload tar (toi da 60 x 5s = 5 phut)
set WAIT_TRIES=0
:wait_tar
if exist "deploy-build.tar.gz" goto extract_tar
if %WAIT_TRIES% GEQ 60 (
  echo ERROR: Timeout — khong thay deploy-build.tar.gz sau 5 phut.
  echo CI phai upload tar SAU webhook, trong luc script nay dang doi.
  exit /b 1
)
set /a WAIT_TRIES+=1
echo ==^> Cho deploy-build.tar.gz ^(%WAIT_TRIES%/60^)...
timeout /t 5 /nobreak >nul
goto wait_tar

:extract_tar
echo ==^> Extract deploy-build.tar.gz
where tar >nul 2>&1
if errorlevel 1 (
  echo ERROR: tar.exe not found
  exit /b 1
)
if exist ".next" (
  echo     Removing old .next
  rmdir /s /q ".next" 2>nul
)
tar -xzf deploy-build.tar.gz
if errorlevel 1 (
  echo ERROR: tar extract failed
  exit /b 1
)
del /f /q deploy-build.tar.gz 2>nul

echo ==^> Sync .next\static -^> _next\static
call node scripts\copy-next-static.js
if errorlevel 1 (
  echo ERROR: CSS sync failed
  exit /b 1
)

if not exist ".next\prerender-manifest.json" (
  echo ERROR: Thieu .next sau extract
  exit /b 1
)

set NODE_ENV=production

if not exist "node_modules\next" (
  echo ==^> npm ci
  call npm ci --omit=dev
  if errorlevel 1 exit /b 1
) else (
  echo ==^> node_modules\next co san
)

if not exist "node_modules\.bin\prisma.cmd" (
  if not exist "node_modules\prisma\package.json" (
    echo ==^> Thieu prisma — npm ci --omit=dev
    call npm ci --omit=dev
    if errorlevel 1 exit /b 1
  )
)

echo ==^> prisma generate
if exist "node_modules\.bin\prisma.cmd" (
  call node_modules\.bin\prisma generate
) else (
  call npx --yes prisma@6.19.2 generate
)
if errorlevel 1 (
  echo Prisma generate failed — Stop app, npm ci, thu lai.
  exit /b 1
)

if exist "prisma\migrations" (
  echo ==^> prisma migrate deploy
  if exist "node_modules\.bin\prisma.cmd" (
    call node_modules\.bin\prisma migrate deploy
  ) else (
    call npx --yes prisma@6.19.2 migrate deploy
  )
  if errorlevel 1 echo WARN: migrate failed
)

echo ==^> Restart ^(touch web.config^)
powershell -NoProfile -Command "(Get-Item -LiteralPath 'web.config').LastWriteTime = Get-Date" 2>nul
if errorlevel 1 copy /b web.config +,, >nul 2>&1

echo ==^> Deploy nhanh OK.
endlocal
exit /b 0
