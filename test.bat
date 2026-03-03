@echo off
echo Testing todo-app launcher...
cd /d "%~dp0dist"

REM Check Python
where python >nul 2>nul
if %errorlevel% equ 0 (
    echo Python detected, starting HTTP server...
    echo App URL: http://localhost:8002
    echo Press Ctrl+C to stop
    echo.
    python -m http.server 8002
    goto :end
)

REM Check Node.js
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo Node.js detected, starting serve...
    echo App URL: http://localhost:8002
    echo Press Ctrl+C to stop
    echo.
    npx serve -p 8002
    goto :end
)

echo Error: Python or Node.js not found.
echo.
echo Please install either:
echo 1. Python 3.x - from https://python.org
echo 2. Node.js - from https://nodejs.org
echo.
pause

:end