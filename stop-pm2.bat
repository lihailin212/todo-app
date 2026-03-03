@echo off
echo Stopping todo-app...
cd /d "%~dp0"
pm2 stop todo-app
echo Application stopped.
pause