@echo off
echo ========================================
echo   Installing Backend Dependencies
echo ========================================
echo.
echo This will install:
echo - express (web server)
echo - cors (cross-origin requests)
echo - dotenv (environment variables)
echo - concurrently (run multiple servers)
echo.
echo Please wait...
echo.
npm install
echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure your Gemini API key is in .env file
echo 2. Run START_ALL.bat to start both servers
echo 3. Open http://localhost:8080 in your browser
echo.
pause
