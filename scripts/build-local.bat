@echo off
REM Build local (Windows) roi goi y buoc upload .next
setlocal
cd /d "%~dp0.."

echo ==^> prisma generate
call npx prisma generate
if errorlevel 1 exit /b 1

echo ==^> next build
call npm run build
if errorlevel 1 exit /b 1

echo.
echo ==^> Build xong. Upload thu muc .next len:
echo     C:\Inetpub\vhosts\giahomnay.site\httpdocs\.next
echo.
echo Roi tren Plesk: Git pull (neu can) + Restart App
echo Khong can chay npm run build tren server.
endlocal
