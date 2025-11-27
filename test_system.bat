@echo off
title System Test - Neuralinq ITS
echo ========================================
echo  System Test - Neuralinq ITS
echo ========================================
echo.

echo [1/5] Checking Python...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)
echo ✅ Python found
echo.

echo [2/5] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found
echo.

echo [3/5] Checking Backend Dependencies...
cd backend
python -c "import flask; import flask_cors" 2>nul
if %errorlevel% neq 0 (
    echo ⚠️  Backend dependencies not installed
    echo Run: pip install -r requirements.txt
) else (
    echo ✅ Backend dependencies OK
)
cd ..
echo.

echo [4/5] Checking Frontend Dependencies...
if exist "frontend\node_modules" (
    echo ✅ Frontend dependencies OK
) else (
    echo ⚠️  Frontend dependencies not installed
    echo Run: npm install in frontend folder
)
echo.

echo [5/5] Checking Environment Files...
if exist "backend\.env" (
    echo ✅ backend/.env exists
) else (
    echo ⚠️  backend/.env missing
    echo Run setup.bat to create it
)

if exist "frontend\.env" (
    echo ✅ frontend/.env exists
) else (
    echo ⚠️  frontend/.env missing
    echo Run setup.bat to create it
)
echo.

echo ========================================
echo  Test Complete!
echo ========================================
echo.
echo If all checks passed (✅), you're ready to run!
echo If any warnings (⚠️), run setup.bat first.
echo.
pause
