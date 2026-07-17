@echo off
REM ============================================================
REM Plesk Windows — deploy NHANH (KHONG build tren server)
REM
REM Quan trong (tranh mat CSS):
REM   - KHONG rmdir .next khi iisnode dang chay (file lock → extract do)
REM   - Extract tar vao thu muc staging, verify CSS, roi robocopy
REM   - CI: webhook truoc, upload tar sau (tranh git clean xoa tar)
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
where tar >nul 2>&1
if errorlevel 1 (
  echo ERROR: tar.exe not found
  exit /b 1
)

REM Doi CI upload tar (toi da 72 x 5s = 6 phut)
REM Viet flag de CI biet bat dang cho (tranh upload luc git clean).
echo waiting> "deploy-waiting.flag"
set WAIT_TRIES=0
:wait_tar
if exist "deploy-build.tar.gz" goto extract_tar
if exist "..\deploy-build.tar.gz" (
  echo ==^> Tim thay tar o parent — move vao httpdocs
  move /Y "..\deploy-build.tar.gz" "deploy-build.tar.gz" >nul
  if exist "deploy-build.tar.gz" goto extract_tar
)
if %WAIT_TRIES% GEQ 72 (
  del /f /q "deploy-waiting.flag" 2>nul
  echo ERROR: Timeout — khong thay deploy-build.tar.gz sau 6 phut.
  echo CI phai upload tar SAU webhook, va re-put neu git clean xoa som.
  exit /b 1
)
set /a WAIT_TRIES+=1
echo ==^> Cho deploy-build.tar.gz ^(%WAIT_TRIES%/72^)...
timeout /t 5 /nobreak >nul
goto wait_tar

:extract_tar
del /f /q "deploy-waiting.flag" 2>nul
echo ==^> Extract deploy-build.tar.gz → _deploy_staging
if exist "_deploy_staging" (
  rmdir /s /q "_deploy_staging" 2>nul
)
mkdir "_deploy_staging" 2>nul
tar -xzf deploy-build.tar.gz -C "_deploy_staging"
if errorlevel 1 (
  echo ERROR: tar extract failed
  exit /b 1
)

if not exist "_deploy_staging\.next\prerender-manifest.json" (
  echo ERROR: Staging thieu .next sau extract
  exit /b 1
)
if not exist "_deploy_staging\.next\static" (
  echo ERROR: Staging thieu .next\static
  exit /b 1
)

echo ==^> Verify CSS + sample JS trong staging
call node -e "const fs=require('fs'),path=require('path');function walk(d,a={css:[],js:[]}){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p,a);else if(e.name.endsWith('.css'))a.css.push(p);else if(e.name.endsWith('.js'))a.js.push(p);}return a;}const a=walk(path.join('_deploy_staging','.next','static'));console.log('staging css:',a.css.length,'js:',a.js.length);if(a.css.length<1||a.js.length<1)process.exit(1);"
if errorlevel 1 (
  echo ERROR: Staging thieu CSS/JS — khong ghi de .next live
  exit /b 1
)

REM iisnode giu lock .next/server → robocopy bo sot route cu (vd. AI van goi api.openai.com).
REM Kill node cua site nay, doi thu muc .next, roi recycle.
echo ==^> Stop node.exe cua site ^(release file locks^)
powershell -NoProfile -Command "$root=(Resolve-Path -LiteralPath '.').Path; Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -and $_.CommandLine.IndexOf($root,[StringComparison]::OrdinalIgnoreCase) -ge 0 } | ForEach-Object { Write-Host ('kill PID '+$_.ProcessId); Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }; Start-Sleep -Seconds 2"
timeout /t 2 /nobreak >nul

echo ==^> Swap .next ^(staging → live^)
if exist ".next.prev" (
  rmdir /s /q ".next.prev" 2>nul
)
if exist ".next" (
  move /Y ".next" ".next.prev" >nul
  if errorlevel 1 (
    echo WARN: move .next → .next.prev failed — fallback robocopy
    goto robocopy_next
  )
)
move /Y "_deploy_staging\.next" ".next" >nul
if errorlevel 1 (
  echo WARN: move staging\.next failed — fallback robocopy
  if exist ".next.prev" if not exist ".next" move /Y ".next.prev" ".next" >nul
  goto robocopy_next
)
echo     .next swapped OK
goto after_next

:robocopy_next
echo ==^> Robocopy staging\.next → .next
if not exist ".next" mkdir ".next"
if exist "_deploy_staging\.next" (
  robocopy "_deploy_staging\.next" ".next" /E /NFL /NDL /NJH /NJS /nc /ns /np
  set RC=%ERRORLEVEL%
  if %RC% GEQ 8 (
    echo ERROR: robocopy .next failed rc=%RC%
    exit /b 1
  )
)

:after_next
if exist "_deploy_staging\_next" (
  echo ==^> Robocopy staging\_next → _next
  if not exist "_next" mkdir "_next"
  robocopy "_deploy_staging\_next" "_next" /E /NFL /NDL /NJH /NJS /nc /ns /np
  if %ERRORLEVEL% GEQ 8 (
    echo WARN: robocopy _next rc=%ERRORLEVEL% — van thu sync tu .next
  )
)

echo ==^> Sync .next\static -^> _next\static
call node scripts\copy-next-static.js
if errorlevel 1 (
  echo ERROR: CSS sync failed
  exit /b 1
)

REM Confirm live .next still has JS after swap (catches partial robocopy)
call node -e "const fs=require('fs'),path=require('path');function n(d,ext){if(!fs.existsSync(d))return 0;let c=0; (function w(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())w(f);else if(e.name.endsWith(ext))c++;}})(d);return c;}const j=n(path.join('.next','static'),'.js'),c=n(path.join('.next','static'),'.css');console.log('live .next/static js='+j+' css='+c);if(j<1||c<1)process.exit(1);"
if errorlevel 1 (
  echo ERROR: .next/static thieu JS/CSS sau swap — deploy aborted
  exit /b 1
)

REM Marker cho debug / CI (untracked — git clean se xoa lan sau)
echo ok %DATE% %TIME%> "deploy-ok.flag"

echo ==^> Cleanup staging + tar + .next.prev
rmdir /s /q "_deploy_staging" 2>nul
rmdir /s /q ".next.prev" 2>nul
del /f /q deploy-build.tar.gz 2>nul

if not exist ".next\prerender-manifest.json" (
  echo ERROR: Thieu .next sau robocopy
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
