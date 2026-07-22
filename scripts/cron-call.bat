@echo off
REM Call a cron API on production.
REM Usage: cron-call.bat <path-segment> [scheduled|force]
REM   ai-daily-article           — chạy thủ công (bỏ qua giờ cấu hình)
REM   ai-daily-article scheduled — tick Task Scheduler (đúng ai_cron_hour)
REM   ai-daily-article force     — bỏ qua giờ + auto + dedupe trong ngày
REM Secret: env CRON_SECRET, or cron.secret in:
REM   httpdocs\cron.secret  OR  parent\cron.secret (canh httpdocs)

setlocal EnableExtensions
set "JOB=%~1"
set "MODE=%~2"
if "%JOB%"=="" (
  echo Usage: cron-call.bat ^<job^> [scheduled^|force]
  echo   sync-gold sync-forex sync-stocks sync-interest sync-fuel
  echo   ingest-24h-gold ai-daily-article generate-sitemap sync-gsc
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

set "BODY={}"
if /I "%MODE%"=="force" set "BODY={\"force\":true}"
if /I "%MODE%"=="scheduled" set "BODY={\"scheduled\":true}"

curl.exe -sS -X POST ^
  -H "Authorization: Bearer %CRON_SECRET%" ^
  -H "Content-Type: application/json" ^
  -d "%BODY%" ^
  --connect-timeout 30 --max-time 180 ^
  -w "\nHTTP %%{http_code}\n" ^
  "%BASE_URL%/api/cron/%JOB%"

exit /b %ERRORLEVEL%
