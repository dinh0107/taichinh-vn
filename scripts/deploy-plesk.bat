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

echo ==^> STOP Node.js app in Plesk first (locks Prisma DLL on Windows).
echo     Plesk -^> Node.js -^> Disable app, then continue.

echo ==^> npm ci
call npm ci --omit=dev
if errorlevel 1 exit /b 1

echo ==^> prisma generate
call npx prisma generate
if errorlevel 1 (
  echo EPERM? Stop app, then: rmdir /s /q node_modules\.prisma ^& npx prisma generate
  exit /b 1
)

if exist "prisma\migrations" (
  echo ==^> prisma migrate deploy
  call npx prisma migrate deploy
)

echo ==^> next build
REM NODE_ENV=development in .env breaks Next.js 16 prerender — force production for build
set NODE_ENV=production
call npm run build
if errorlevel 1 exit /b 1

echo ==^> Deploy OK. Restart Node.js app in Plesk.
endlocal
