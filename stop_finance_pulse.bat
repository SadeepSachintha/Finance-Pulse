@echo off
TITLE FinancePulse Platform Stopper
CLS
cd /d "%~dp0"

echo ======================================================================
echo    Stopping FinancePulse Microservices
echo ======================================================================
echo.

echo Terminating PHP API Server (Port 8000)...
taskkill /FI "WINDOWTITLE eq FinancePulse-PHP-Server*" /F /T >nul 2>&1

echo Terminating Python OCR Microservice (Port 8001)...
taskkill /FI "WINDOWTITLE eq FinancePulse-Python-OCR*" /F /T >nul 2>&1

echo Terminating React Vite Dev Workspace (Port 5173)...
taskkill /FI "WINDOWTITLE eq FinancePulse-React-SPA*" /F /T >nul 2>&1

echo ======================================================================
echo    All FinancePulse microservice windows stopped!
echo ======================================================================
echo.

pause
