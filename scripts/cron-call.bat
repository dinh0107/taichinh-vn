@echo off
REM Call a cron API on production.
REM Usage: cron-call.bat <path-segment>
REM Secret: env CRON_SECRET, or cron.secret in:
REM   httpdocs\cron.secret  OR  parent\cron.secret (canh httpdocs)

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
  if exist "%~dp0..\..\cron.secret" (
    set /p CRON_SECRET=<"%~dp0..\..\cron.secret"
  )
)
if "%CRON_SECRET%"=="" (
  echo ERROR: missing CRON_SECRET env or cron.secret
  echo   Tried: %~dp0..\cron.secret
  echo   Tried: %~dp0..\..\cron.secret
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
