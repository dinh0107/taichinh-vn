@echo off
REM ============================================================
REM Plesk Windows — deploy NHANH (KHONG build tren server)
REM
REM Cách B (khuyến nghị):
REM   Plesk Deployment mode = Manual
REM   Additional actions: call scripts\deploy-plesk-fast.bat
REM   CI upload tar xong → gọi PLESK_GIT_WEBHOOK_URL
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

REM Git pull may wipe .next — extract is done by CI via /api/cron/apply-deploy-artifact
REM Keep this bat for prisma/npm after code pull. Optional local tar if present.
set WAIT_TRIES=0
:wait_tar
if exist "deploy-build.tar.gz" goto extract_tar
if %WAIT_TRIES% GEQ 2 goto after_wait_tar
set /a WAIT_TRIES+=1
echo ==^> (optional) Cho deploy-build.tar.gz ^(%WAIT_TRIES%/2^)...
timeout /t 3 /nobreak >nul
goto wait_tar
:after_wait_tar
echo ==^> Khong co tar — CI se goi apply-deploy-artifact sau upload.
goto after_extract

:extract_tar
if exist "deploy-build.tar.gz" (
  echo ==^> Extract deploy-build.tar.gz
  where tar >nul 2>&1
  if errorlevel 1 (
    echo WARN: tar.exe missing — skip extract
    goto after_extract
  )
  if exist ".next" rmdir /s /q ".next" 2>nul
  tar -xzf deploy-build.tar.gz
  if errorlevel 1 (
    echo WARN: tar extract failed
    goto after_extract
  )
  del /f /q deploy-build.tar.gz 2>nul
  echo ==^> Sync CSS
  call node scripts\copy-next-static.js
  if errorlevel 1 echo WARN: CSS sync failed
)

:after_extract
if not exist ".next\prerender-manifest.json" (
  echo WARN: Chua co .next — doi CI apply-deploy-artifact.
) else (
  echo ==^> .next OK
)

set NODE_ENV=production

if not exist "node_modules\next" (
  echo ==^> npm ci
  call npm ci --omit=dev
  if errorlevel 1 exit /b 1
) else (
  echo ==^> node_modules\next co san
)

REM prisma nam trong dependencies — neu thieu thi cai lai (node_modules cu/thieu goi)
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
  echo ==^> Fallback: npx prisma@6.19.2 generate
  call npx --yes prisma@6.19.2 generate
)
if errorlevel 1 (
  echo.
  echo Prisma generate failed.
  echo   1^) Stop Node.js app in Plesk
  echo   2^) rmdir /s /q node_modules
  echo   3^) npm ci --omit=dev
  echo   4^) call scripts\deploy-plesk-fast.bat
  exit /b 1
)

if exist "prisma\migrations" (
  echo ==^> prisma migrate deploy
  if exist "node_modules\.bin\prisma.cmd" (
    call node_modules\.bin\prisma migrate deploy
  ) else (
    call npx --yes prisma@6.19.2 migrate deploy
  )
  if errorlevel 1 echo WARN: migrate failed — check DATABASE_URL
)

echo ==^> Restart signal ^(touch web.config^)
powershell -NoProfile -Command "(Get-Item -LiteralPath 'web.config').LastWriteTime = Get-Date" 2>nul
if errorlevel 1 copy /b web.config +,, >nul 2>&1

echo ==^> Deploy nhanh OK.
endlocal
exit /b 0
