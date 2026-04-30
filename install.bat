@echo off
echo ========================================
echo   SETUP PERTAMA KALI - IT Audit App
echo ========================================
echo.

:: ── Cek Node.js ──────────────────────────
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js tidak ditemukan!
    echo Silakan install Node.js dari https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js ditemukan: & node -v

:: ── Cek npm ──────────────────────────────
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm tidak ditemukan!
    pause
    exit /b 1
)
echo [OK] npm ditemukan: & npm -v
echo.

:: ── Install Backend ───────────────────────
echo [1/4] Install dependencies Backend...
cd /d %~dp0backend
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Gagal install backend dependencies!
    pause
    exit /b 1
)
echo [OK] Backend dependencies berhasil diinstall.
echo.

:: ── Setup .env Backend ────────────────────
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo [OK] File .env backend dibuat dari .env.example
        echo [!] Jangan lupa isi konfigurasi di backend\.env
    ) else (
        echo [WARN] File .env backend tidak ditemukan dan tidak ada .env.example
        echo        Buat file backend\.env secara manual sebelum menjalankan server.
    )
) else (
    echo [OK] File .env backend sudah ada.
)
echo.

:: ── Prisma Generate ───────────────────────
echo [2/4] Generate Prisma Client...
npx prisma generate
if %errorlevel% neq 0 (
    echo [WARN] Prisma generate gagal. Pastikan DATABASE_URL sudah diisi di backend\.env
) else (
    echo [OK] Prisma client berhasil digenerate.
)
echo.

:: ── Install Frontend ──────────────────────
echo [3/4] Install dependencies Frontend...
cd /d %~dp0frontend
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Gagal install frontend dependencies!
    pause
    exit /b 1
)
echo [OK] Frontend dependencies berhasil diinstall.
echo.

:: ── Setup .env Frontend ───────────────────
if not exist ".env.local" (
    if exist ".env.local.example" (
        copy ".env.local.example" ".env.local" >nul
        echo [OK] File .env.local frontend dibuat dari .env.local.example
        echo [!] Jangan lupa isi konfigurasi di frontend\.env.local
    ) else (
        echo [WARN] File .env.local frontend tidak ditemukan dan tidak ada .env.local.example
        echo        Buat file frontend\.env.local secara manual jika diperlukan.
    )
) else (
    echo [OK] File .env.local frontend sudah ada.
)
echo.

:: ── Selesai ───────────────────────────────
echo [4/4] Setup modul Peminjaman Perangkat...
cd /d %~dp0
node setup-loans.js
if %errorlevel% neq 0 (
    echo [WARN] setup-loans.js gagal. Jalankan manual: node setup-loans.js
)
echo.

echo ========================================
echo   Setup selesai! Langkah selanjutnya:
echo   1. Pastikan isi backend\.env sudah benar
echo      (DATABASE_URL, JWT_SECRET, dll)
echo   2. Jalankan migrasi database:
echo      cd backend
echo      npx prisma migrate dev --name add_device_loan
echo   3. Jalankan aplikasi:
echo      Klik dua kali start.bat
echo ========================================
echo.
pause
