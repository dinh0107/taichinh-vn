@echo off
REM Apply deploy-build.tar.gz that CI already uploaded.
REM Started detached from /api/cron/apply-deploy-artifact (so iisnode can be killed).
REM Do NOT wait long — tar must already exist.
setlocal EnableExtensions
cd /d "%~dp0.."
if errorlevel 1 exit /b 1

REM Brief delay so the HTTP response can flush before we kill node
timeout /t 3 /nobreak >nul

if not exist "deploy-build.tar.gz" (
  if exist "..\deploy-build.tar.gz" (
    move /Y "..\deploy-build.tar.gz" "deploy-build.tar.gz" >nul
  )
)
if not exist "deploy-build.tar.gz" (
  echo ERROR: missing deploy-build.tar.gz
  exit /b 1
)

echo ==^> apply-deploy-tar: extract staging
if exist "_deploy_staging" rmdir /s /q "_deploy_staging" 2>nul
mkdir "_deploy_staging" 2>nul
tar -xzf deploy-build.tar.gz -C "_deploy_staging"
if errorlevel 1 exit /b 1

if not exist "_deploy_staging\.next\static" (
  echo ERROR: staging missing .next\static
  exit /b 1
)

call node -e "const fs=require('fs'),path=require('path');function n(d,e){let c=0;(function w(p){for(const x of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,x.name);if(x.isDirectory())w(f);else if(x.name.endsWith(e))c++;}})(d);return c;}const b=path.join('_deploy_staging','.next','static');const c=n(b,'.css'),j=n(b,'.js');console.log('staging css='+c+' js='+j);if(c<1||j<1)process.exit(1);"
if errorlevel 1 exit /b 1

echo ==^> Kill site node.exe
powershell -NoProfile -Command "$root=(Resolve-Path -LiteralPath '.').Path; Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -and $_.CommandLine.IndexOf($root,[StringComparison]::OrdinalIgnoreCase) -ge 0 } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; Start-Sleep -Seconds 2"
timeout /t 2 /nobreak >nul

echo ==^> Swap .next
if exist ".next.prev" rmdir /s /q ".next.prev" 2>nul
if exist ".next" (
  move /Y ".next" ".next.prev" >nul
  if errorlevel 1 (
    if not exist ".next" mkdir ".next"
    robocopy "_deploy_staging\.next" ".next" /E /NFL /NDL /NJH /NJS /nc /ns /np
    if errorlevel 8 exit /b 1
    goto after_next
  )
)
move /Y "_deploy_staging\.next" ".next" >nul
if errorlevel 1 (
  if exist ".next.prev" if not exist ".next" move /Y ".next.prev" ".next" >nul
  if not exist ".next" mkdir ".next"
  robocopy "_deploy_staging\.next" ".next" /E /NFL /NDL /NJH /NJS /nc /ns /np
  if errorlevel 8 exit /b 1
)

:after_next
if exist "_deploy_staging\_next" (
  if not exist "_next" mkdir "_next"
  robocopy "_deploy_staging\_next" "_next" /E /NFL /NDL /NJH /NJS /nc /ns /np
)

call node scripts\copy-next-static.js
if errorlevel 1 exit /b 1

echo ok %DATE% %TIME%> "deploy-ok.flag"
rmdir /s /q "_deploy_staging" 2>nul
rmdir /s /q ".next.prev" 2>nul
del /f /q deploy-build.tar.gz 2>nul

powershell -NoProfile -Command "(Get-Item -LiteralPath 'web.config').LastWriteTime = Get-Date" 2>nul
echo ==^> apply-deploy-tar OK
exit /b 0
