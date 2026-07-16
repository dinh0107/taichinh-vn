@echo off
REM Register Task Scheduler jobs - run as Administrator:
REM   cd /d C:\Inetpub\vhosts\giahomnay.site\httpdocs
REM   call scripts\setup-windows-cron.bat
setlocal EnableExtensions

cd /d "%~dp0.."
set "BAT=%CD%\scripts\cron-call.bat"
set "BASE_URL=https://giahomnay.site"

if not exist "%BAT%" (
  echo ERROR: missing %BAT%
  exit /b 1
)

if not defined CRON_SECRET (
  if exist "%CD%\cron.secret" goto have_secret
  if exist "%CD%\..\cron.secret" goto have_secret
  echo ERROR: missing cron.secret ^(httpdocs\cron.secret or parent\cron.secret^)
  exit /b 1
)
:have_secret

echo Creating tasks...

schtasks /Delete /TN "giahomnay-sync-gold" /F >nul 2>&1
schtasks /Create /TN "giahomnay-sync-gold" /TR "cmd /c set BASE_URL=%BASE_URL%& \"%BAT%\" sync-gold" /SC MINUTE /MO 5 /RU SYSTEM /F
if errorlevel 1 goto fail
echo OK giahomnay-sync-gold

schtasks /Delete /TN "giahomnay-ingest-24h-gold" /F >nul 2>&1
schtasks /Create /TN "giahomnay-ingest-24h-gold" /TR "cmd /c set BASE_URL=%BASE_URL%& \"%BAT%\" ingest-24h-gold" /SC DAILY /ST 08:00 /RU SYSTEM /F
if errorlevel 1 goto fail
echo OK giahomnay-ingest-24h-gold

schtasks /Delete /TN "giahomnay-ai-daily-article" /F >nul 2>&1
schtasks /Create /TN "giahomnay-ai-daily-article" /TR "cmd /c set BASE_URL=%BASE_URL%& \"%BAT%\" ai-daily-article" /SC DAILY /ST 07:00 /RU SYSTEM /F
if errorlevel 1 goto fail
echo OK giahomnay-ai-daily-article

schtasks /Delete /TN "giahomnay-generate-sitemap" /F >nul 2>&1
schtasks /Create /TN "giahomnay-generate-sitemap" /TR "cmd /c set BASE_URL=%BASE_URL%& \"%BAT%\" generate-sitemap" /SC DAILY /ST 02:00 /RU SYSTEM /F
if errorlevel 1 goto fail
echo OK giahomnay-generate-sitemap

echo.
echo Done. Test:
echo   schtasks /Query /TN giahomnay-sync-gold
echo   schtasks /Run /TN giahomnay-generate-sitemap
exit /b 0

:fail
echo ERROR: schtasks failed. Run this CMD as Administrator.
exit /b 1
