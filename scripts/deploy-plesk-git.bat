@echo off
REM ============================================================
REM DEPRECATED for production auto-deploy.
REM
REM Production flow (no build on server):
REM   1. GitHub Actions builds on push main + SFTP uploads .next / _next
REM   2. Plesk Additional deployment actions:
REM        call scripts\deploy-plesk-fast.bat
REM
REM Use THIS script only for emergency / manual full build on server:
REM   call scripts\deploy-plesk-git.bat
REM ============================================================
setlocal EnableExtensions
cd /d "%~dp0.."
if errorlevel 1 exit /b 1

echo WARNING: deploy-plesk-git.bat builds ON the server.
echo          Prefer CI build + deploy-plesk-fast.bat for production.
echo.

set NODE_ENV=production
set CI=true

echo ===== [%date% %time%] Deploy start: %CD% =====
where node
where npm
node -v
npm -v

echo ==^> npm ci
call npm ci
if errorlevel 1 (
  echo npm ci failed — try npm install
  call npm install
  if errorlevel 1 exit /b 1
)

echo ==^> prisma generate
call npx prisma generate
if errorlevel 1 (
  echo WARN: prisma generate EPERM — app may be locking DLL.
  echo       Disable Node.js app in Plesk, then Redeploy once.
)

if exist "prisma\migrations" (
  echo ==^> prisma migrate deploy
  call npx prisma migrate deploy
  if errorlevel 1 echo WARN: migrate failed — check DATABASE_URL
) else (
  echo ==^> prisma db push ^(no migrations folder^)
  call npx prisma db push --skip-generate
  if errorlevel 1 echo WARN: db push failed — check DATABASE_URL / password encoding
)

echo ==^> next build + copy _next/static
call npm run build
if errorlevel 1 (
  echo BUILD FAILED
  exit /b 1
)

REM iisnode watches web.config — touch to recycle worker
echo ==^> Restart signal ^(touch web.config^)
powershell -NoProfile -Command "(Get-Item -LiteralPath 'web.config').LastWriteTime = Get-Date" 2>nul
if errorlevel 1 copy /b web.config +,, >nul 2>&1

echo ===== [%date% %time%] Deploy OK =====
endlocal
exit /b 0
