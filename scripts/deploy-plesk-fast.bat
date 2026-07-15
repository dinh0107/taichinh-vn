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

REM Wait for CI tar ( Cách B: webhook sau upload; vẫn retry nếu FS chậm )
set WAIT_TRIES=0
:wait_tar
if exist "deploy-build.tar.gz" goto extract_tar
if %WAIT_TRIES% GEQ 12 goto after_wait_tar
set /a WAIT_TRIES+=1
echo ==^> Cho deploy-build.tar.gz ^(%WAIT_TRIES%/12^)...
timeout /t 5 /nobreak >nul
goto wait_tar
:after_wait_tar

:extract_tar
if exist "deploy-build.tar.gz" (
  echo ==^> Extract deploy-build.tar.gz from CI
  where tar >nul 2>&1
  if errorlevel 1 (
    echo ERROR: tar.exe not found. Use Windows 10+ tar or install bsdtar.
    exit /b 1
  )
  if exist ".next" (
    echo     Removing old .next
    rmdir /s /q ".next" 2>nul
  )
  if exist "_next" (
    echo     Removing old _next
    rmdir /s /q "_next" 2>nul
  )
  tar -xzf deploy-build.tar.gz
  if errorlevel 1 (
    echo ERROR: tar extract failed
    exit /b 1
  )
  del /f /q deploy-build.tar.gz 2>nul
  echo     Extract OK
)

if not exist ".next\prerender-manifest.json" (
  echo ERROR: Thieu .next — doi GitHub Actions Deploy xong ^(file deploy-build.tar.gz^),
  echo        roi Redeploy Git / chay lai script nay.
  echo   CI job: Deploy to Plesk ^(SFTP^)
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
