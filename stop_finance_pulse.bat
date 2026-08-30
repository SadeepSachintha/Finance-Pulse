@echo off
TITLE FinancePulse Platform Stopper
COLOR 0C
CLS

echo ======================================================================
echo    Stopping FinancePulse Microservices
echo ======================================================================
echo.

echo Terminating PHP API Server (Port 8000)...
taskkill /FI "WINDOWTITLE eq FinancePulse - PHP API Server*" /F /T >nul 2>&1

echo Terminating Python OCR Microservice (Port 8001)...
taskkill /FI "WINDOWTITLE eq FinancePulse - Python OCR Service*" /F /T >nul 2>&1

echo Terminating React Vite Dev Workspace (Port 5173)...
taskkill /FI "WINDOWTITLE eq FinancePulse - React SPA Workspace*" /F /T >nul 2>&1

echo ======================================================================
echo    All FinancePulse processes stopped!
echo ======================================================================
echo.

pause
