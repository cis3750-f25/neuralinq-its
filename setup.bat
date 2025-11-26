@echo off
title Neuralinq Tutor - Project Setup
echo ========================================
echo  Neuralinq Tutor - Project Setup
echo ========================================
echo.
echo Please ensure you have Node.js and Python installed before proceeding.
echo If you do not have them installed, please download and install them from the links below:
echo.
echo Python download: https://www.python.org/downloads/
echo Node.js download: https://nodejs.org/en/download
echo.
pause

echo.
echo [1/4] Setting up Backend...
cd backend
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Setting up Frontend...
cd frontend
echo Installing Node.js dependencies...
call npm install
title Neuralinq Tutor - Project Setup
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [3/4] Creating environment files...
if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo Created backend/.env from example
)
if not exist frontend\.env (
    copy frontend\.env.example frontend\.env
    echo Created frontend/.env from example
)

echo.
echo [4/4] Setup Complete!
echo.
set /p q=Ready to start program? (y/n): 
echo. 
if /I "%q%" NEQ "y" (
    echo Exiting setup...
    exit /b 0
)   
echo Starting Backend and Frontend...
echo.
echo Note: Two command prompt windows will open.
echo Close them to stop the servers.
echo.
start cmd /k "cd backend && python app.py"
start cmd /k "cd frontend && npm start"
pause