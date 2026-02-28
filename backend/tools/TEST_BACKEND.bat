@echo off
echo ========================================
echo   Testing Backend Configuration
echo ========================================
echo.
echo Step 1: Testing Environment Variables
echo ----------------------------------------
node test-backend-env.js
echo.
echo.
echo Step 2: Testing Gemini Initialization
echo ----------------------------------------
node test-backend-gemini.js
echo.
echo.
echo ========================================
echo   Tests Complete!
echo ========================================
echo.
echo If all tests passed, your backend is ready!
echo Run START_ALL.bat to start the application.
echo.
pause
