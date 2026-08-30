@echo off
TITLE FinancePulse Platform Launcher
COLOR 0A
CLS

echo ======================================================================
echo    FinancePulse | Automated Financial Intelligence Platform
echo ======================================================================
echo    3-Way Reconciliation • Landed Costing • Multi-Currency • Fraud Shield
echo ======================================================================
echo.

echo [1/3] Starting PHP REST API & Security Portal (Port 8000)...
start "FinancePulse - PHP API Server (Port 8000)" cmd /k "php -S 127.0.0.1:8000 backend/server.php"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Python FastAPI OCR Microservice (Port 8001)...
start "FinancePulse - Python OCR Service (Port 8001)" cmd /k "python -m uvicorn ocr_service.main:app --port 8001"

timeout /t 2 /nobreak >nul

echo [3/3] Starting React Vite Dev Workspace (Port 5173)...
start "FinancePulse - React SPA Workspace (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo ======================================================================
echo    All Microservices Launched Successfully!
echo ======================================================================
echo    - React SPA Workspace:  http://localhost:5173/
echo    - Backend Security Portal: http://127.0.0.1:8000/
echo    - FastAPI OCR Docs:      http://127.0.0.1:8001/docs
echo ======================================================================
echo.

echo Opening FinancePulse in your default Web Browser...
start http://localhost:5173/

pause
