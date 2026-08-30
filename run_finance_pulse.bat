@echo off
TITLE FinancePulse Platform Launcher
CLS
cd /d "%~dp0"

echo ======================================================================
echo    FinancePulse -- Automated Financial Intelligence Platform
echo ======================================================================
echo    3-Way Reconciliation - Landed Costing - Multi-Currency - Fraud Shield
echo ======================================================================
echo.

echo Working Directory: "%~dp0"
echo.

echo [1/3] Starting PHP REST API ^& Security Portal (Port 8000)...
start "FinancePulse-PHP-Server" /d "%~dp0" cmd /k "php -S 127.0.0.1:8000 backend/server.php"

ping 127.0.0.1 -n 3 >nul

echo [2/3] Starting Python FastAPI OCR Microservice (Port 8001)...
start "FinancePulse-Python-OCR" /d "%~dp0" cmd /k "python -m uvicorn ocr_service.main:app --port 8001"

ping 127.0.0.1 -n 3 >nul

echo [3/3] Starting React Vite Dev Workspace (Port 5173)...
start "FinancePulse-React-SPA" /d "%~dp0frontend" cmd /k "npm run dev"

ping 127.0.0.1 -n 4 >nul

echo ======================================================================
echo    All Microservices Launched Successfully!
echo ======================================================================
echo    - React SPA Workspace:     http://localhost:5173/
echo    - Backend Security Portal: http://127.0.0.1:8000/
echo    - FastAPI OCR Docs:        http://127.0.0.1:8001/docs
echo ======================================================================
echo.

echo Opening FinancePulse in default Web Browser...
start "" "http://localhost:5173/"

echo.
echo Press any key to exit this launcher window.
pause
