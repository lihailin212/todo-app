@echo off
echo Starting todo-app with PM2...
cd /d "%~dp0"
pm2 start ecosystem.config.cjs
pm2 save
echo Application started on http://localhost:5173
pause