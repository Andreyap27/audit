@echo off
echo ========================================
echo   Starting Backend dan Frontend...
echo ========================================

echo [1/2] Menjalankan Backend (port default)...
start "Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Menjalankan Frontend (Next.js)...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================
echo   Kedua server sudah berjalan!
echo   Backend : http://localhost:3001
echo   Frontend: http://localhost:3000
echo ========================================
pause
