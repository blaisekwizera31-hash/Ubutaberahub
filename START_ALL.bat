@echo off
echo ========================================
echo   Starting Full Application
echo ========================================
echo.
echo Backend API: http://localhost:3001
echo Frontend App: http://localhost:8080
echo.
echo Starting backend and frontend in separate terminals...
echo.
start "UBUTABERAHUB-BACKEND" cmd /k "cd /d %~dp0backend && npm install && npm run dev"
start "UBUTABERAHUB-FRONTEND" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"
