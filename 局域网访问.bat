@echo off
rem Keep this file ASCII-only: cmd.exe reads .bat files in the console code page.
rem Chinese instructions: see the 手机安装指南 file in this folder.
title My Timetable - phone access
cd /d "%~dp0"

echo.
echo   Starting local server for your timetable...
echo.
echo   1) Keep your phone on the SAME Wi-Fi as this PC.
echo   2) Open the http://... address printed below in Chrome on the phone.
echo   3) If Windows asks about firewall, click "Allow access".
echo   Keep this window open. Closing it stops the server.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-lan.ps1"

echo.
echo   Server stopped.
pause
