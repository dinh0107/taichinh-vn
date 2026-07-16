@echo off
REM Call a cron API on production.
REM Usage: cron-call.bat <path-segment>
REM   cron-call.bat sync-gold
REM   cron-call.bat ingest-24h-gold
REM   cron-call.bat ai-daily-article
REM
REM Secret: env CRON_SECRET, or file cron.secret next to httpdocs (or %~dp0..\cron.secret)

setlocal EnableExtensions
set "JOB=%~1"
if "%JOB%"=="" (
  echo Usage: cron-call.bat sync-gold ^| ingest-24h-gold ^| ai-daily-article ^| generate-sitemap ^| sync-gsc
  exit /b 1
)

if "%BASE_URL%"=="" set "BASE_URL=https://giahomnay.site"

if "%CRON_SECRET%"=="" (
  if exist "%~dp0..\cron.secret" (
    set /p CRON_SECRET=<"%~dp0..\cron.secret"
  )
)
if "%CRON_SECRET%"=="" (
  echo ERROR: missing CRON_SECRET env or cron.secret file
  exit /b 1
)

where curl >nul 2>&1
if errorlevel 1 (
  echo ERROR: curl not found in PATH
  exit /b 1
)

curl.exe -sS -X POST ^
  -H "Authorization: Bearer %CRON_SECRET%" ^
  -H "Content-Type: application/json" ^
  -d "{}" ^
  --connect-timeout 30 --max-time 180 ^
  -w "\nHTTP %%{http_code}\n" ^
  "%BASE_URL%/api/cron/%JOB%"

exit /b %ERRORLEVEL%
