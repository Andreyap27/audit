# Panduan Instalasi — IT Audit Inventory

Panduan ini untuk setup project dari awal di PC baru (Windows).

---

## Prasyarat

Pastikan software berikut sudah terinstall sebelum mulai:

| Software | Versi minimal | Link download |
|---|---|---|
| Node.js | 20.x LTS | https://nodejs.org |
| PostgreSQL | 14+ | https://www.postgresql.org/download/windows |
| Git | terbaru | https://git-scm.com |

Cek versi setelah install:
```bash
node --version   # v20.x.x
npm --version    # 10.x.x
psql --version   # psql (PostgreSQL) 14.x
git --version
```

---

## 1. Clone Repository

```bash
git clone <URL_REPOSITORY> audit
cd audit
```

> Ganti `<URL_REPOSITORY>` dengan URL git repo Anda.

---

## 2. Setup Database PostgreSQL

Buka **psql** atau pgAdmin, lalu buat database dan user baru:

```sql
-- Jalankan sebagai superuser postgres
CREATE DATABASE audit_db;
CREATE USER audit_user WITH PASSWORD 'password_anda';
GRANT ALL PRIVILEGES ON DATABASE audit_db TO audit_user;
```

Catat:
- **host**: `localhost`
- **port**: `5432` (default)
- **database**: `audit_db`
- **user**: `audit_user`
- **password**: password yang Anda buat

---

## 3. Setup Backend

### 3a. Install dependencies

```bash
cd backend
npm install
```

### 3b. Buat file `.env`

Buat file `backend/.env` (jangan commit file ini):

```env
DATABASE_URL="postgresql://audit_user:password_anda@localhost:5432/audit_db"
JWT_SECRET="isi_dengan_string_acak_panjang"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

> **JWT_SECRET**: gunakan string acak minimal 32 karakter, contoh generate di terminal:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 3c. Generate Prisma client

```bash
npm run db:generate
```

### 3d. Jalankan migrasi database

```bash
npm run db:migrate
```

Saat diminta nama migrasi, ketik nama singkat (contoh: `init`) lalu Enter.

### 3e. Seed data awal (master data)

```bash
npm run db:seed
```

Perintah ini mengisi data awal seperti departemen, tipe unit, OS, dan software Microsoft.

### 3f. Buat folder uploads

```bash
mkdir -p uploads/evidence
```

---

## 4. Setup Frontend

### 4a. Install dependencies

```bash
cd ../frontend
npm install
```

### 4b. Buat file `.env.local`

Buat file `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

---

## 5. Jalankan Aplikasi

Buka **2 terminal** secara bersamaan:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Backend berjalan di: `http://localhost:3001`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend berjalan di: `http://localhost:3000`

---

## 6. Login Pertama

Buka browser ke `http://localhost:3000`.

Akun default (dibuat saat seed):

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | ADMIN |

> **Penting:** Segera ganti password setelah login pertama.

---

## Struktur Folder

```
audit/
├── backend/          # Express + Prisma + PostgreSQL
│   ├── src/
│   ├── prisma/
│   ├── uploads/      # File bukti yang diupload (dibuat manual)
│   └── .env          # Dibuat manual, tidak di-commit
└── frontend/         # Next.js 14
    └── .env.local    # Dibuat manual, tidak di-commit
```

---

## Troubleshooting

**`prisma migrate dev` error koneksi database**
- Pastikan PostgreSQL service sudah berjalan
- Cek kembali nilai `DATABASE_URL` di `.env`
- Pastikan user dan database sudah dibuat

**Port sudah dipakai**
```bash
# Cek proses di port 3001 (Windows)
netstat -ano | findstr :3001
# Kill proses berdasarkan PID
taskkill /PID <PID> /F
```

**`npm install` gagal**
- Hapus folder `node_modules` dan file `package-lock.json`, lalu install ulang
```bash
rm -rf node_modules package-lock.json
npm install
```

**File upload tidak bisa diakses**
- Pastikan folder `backend/uploads/evidence` sudah ada
- Jalankan `mkdir -p uploads/evidence` dari dalam folder `backend`


1. install.bat   ← jalankan ini dulu
2. isi backend\.env (DATABASE_URL, JWT_SECRET, dll)
3. cd backend && npx prisma migrate dev
4. start.bat     ← untuk jalankan server