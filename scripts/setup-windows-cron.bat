@echo off
REM Register ALL giahomnay-* cron tasks from scripts\cron-tasks.manifest
REM Run as Administrator:
REM   cd /d C:\Inetpub\vhosts\giahomnay.site\httpdocs
REM   call scripts\setup-windows-cron.bat
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0.."
set "BAT=%CD%\scripts\cron-call.bat"
set "BASE_URL=https://giahomnay.site"
set "MANIFEST=%CD%\scripts\cron-tasks.manifest"

if not exist "%BAT%" (
  echo ERROR: missing %BAT%
  exit /b 1
)
if not exist "%MANIFEST%" (
  echo ERROR: missing %MANIFEST%
  exit /b 1
)

if not defined CRON_SECRET (
  if exist "%CD%\cron.secret" goto have_secret
  if exist "%CD%\..\cron.secret" goto have_secret
  echo ERROR: missing cron.secret in httpdocs or parent folder
  exit /b 1
)
:have_secret

echo Registering tasks from %MANIFEST%
echo.

set "COUNT=0"
for /f "usebackq eol=# tokens=1,2,3* delims=|" %%A in ("%MANIFEST%") do (
  set "TNAME=%%A"
  set "TJOB=%%B"
  set "TARGS=%%C"
  if /i not "!TNAME!"=="" if /i not "!TNAME:~0,3!"=="REM" (
    set "TASK=giahomnay-!TNAME!"
    schtasks /Delete /TN "!TASK!" /F >nul 2>&1
    schtasks /Create /TN "!TASK!" /TR "cmd /c set BASE_URL=%BASE_URL%& \"%BAT%\" !TJOB!" !TARGS! /RU SYSTEM /F
    if errorlevel 1 (
      echo ERROR: failed !TASK!
      exit /b 1
    )
    echo OK !TASK!  ^(!TJOB!^)
    set /a COUNT+=1
  )
)

echo.
echo Registered !COUNT! tasks.
echo.
echo List:
schtasks /Query /FO TABLE /NH | findstr /I "giahomnay-"
echo.
echo Test:
echo   schtasks /Run /TN giahomnay-sync-gold
echo   scripts\cron-call.bat sync-gold
exit /b 0
