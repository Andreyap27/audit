# IT Audit Inventory System

Aplikasi web untuk mengelola inventaris perangkat IT internal — mencatat device, lisensi OS & software Microsoft, laporan per departemen, dan menjaga audit trail setiap perubahan data.

## Stack

| Layer         | Teknologi                    |
| ------------- | ---------------------------- |
| Backend       | Node.js + Express.js         |
| Frontend      | Next.js 14 (App Router)      |
| Database      | PostgreSQL + Prisma ORM      |
| Auth          | JWT + bcrypt                 |
| Validasi      | Zod                          |
| Import/Export | ExcelJS (.xlsx)              |

## Fitur Utama

- **Inventaris Device** — CRUD perangkat IT (Notebook / Workstation) dengan filter & pagination
- **Master Data** — Departemen, Tipe Unit, Operating System, Microsoft Software (Office/Visio/Project/Access)
- **Import Excel** — Upload file audit lama `.xlsx`, parse otomatis per sheet (1 sheet = 1 departemen)
- **Export Excel** — Download multi-sheet sesuai format file audit lama
- **Laporan** — Rekap per departemen, distribusi lisensi, audit log perubahan
- **Manajemen User** — CRUD user dengan role ADMIN / EDITOR / VIEWER
- **Audit Trail** — Setiap CREATE / UPDATE / DELETE / IMPORT tercatat otomatis
- **UUID** — Semua primary key menggunakan UUID v4 (tidak bisa di-enumerate)

## Struktur Direktori

```text
it-audit/
├── backend/          # Express.js REST API (port 3001)
│   ├── src/
│   │   ├── config/       # database.ts, env.ts
│   │   ├── middleware/   # auth.ts (JWT), errorHandler.ts
│   │   └── modules/      # auth, devices, departments, microsoft,
│   │                     # operating-systems, unit-types, reports,
│   │                     # import, export, users
│   └── prisma/
│       └── schema.prisma
│
└── frontend/         # Next.js 14 App Router (port 3000)
    ├── app/
    │   ├── (auth)/login/
    │   └── (dashboard)/  # devices, master/*, reports/*, import, export
    ├── components/ui/
    ├── hooks/            # useDevices, useMaster, useReports, ...
    └── lib/              # api.ts (Axios), auth.tsx (Context)
```

## Cara Menjalankan

### Prasyarat

- Node.js 20+
- PostgreSQL 14+

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install   # atau pnpm install
```

### 2. Konfigurasi Environment

#### backend/.env

```env
DATABASE_URL="postgresql://user:password@localhost:5432/it_audit_db"
JWT_SECRET="ganti-dengan-secret-yang-kuat"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

#### frontend/.env.local

```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 3. Setup Database

```bash
cd backend

# Buat tabel & sinkronkan schema
npx prisma db push

# Isi data awal (admin user, master data)
npm run db:seed
```

Akun default setelah seed:

- Email: `admin@company.com`
- Password: `admin123`

### 4. Jalankan

```bash
# Backend (terminal 1)
cd backend
npm run dev

# Frontend (terminal 2)
cd frontend
npm run dev
```

Buka `http://localhost:3000`

## API Reference

| Method | Endpoint                             | Keterangan                                 |
| ------ | ------------------------------------ | ------------------------------------------ |
| POST   | `/api/auth/login`                    | Login, return JWT                          |
| GET    | `/api/auth/me`                       | Info user aktif                            |
| GET    | `/api/devices`                       | List device (filter, pagination)           |
| POST   | `/api/devices`                       | Tambah device                              |
| PUT    | `/api/devices/:id`                   | Update device                              |
| DELETE | `/api/devices/:id`                   | Soft delete device                         |
| GET    | `/api/departments`                   | List departemen                            |
| GET    | `/api/microsoft?type=OFFICE`         | List lisensi (OFFICE/VISIO/PROJECT/ACCESS) |
| GET    | `/api/operating-systems`             | List OS                                    |
| GET    | `/api/unit-types`                    | List tipe unit                             |
| GET    | `/api/reports/stats`                 | Summary dashboard                          |
| GET    | `/api/reports/departments`           | Rekap per departemen                       |
| GET    | `/api/reports/software?type=OFFICE`  | Distribusi lisensi                         |
| GET    | `/api/reports/audit-log`             | Riwayat perubahan                          |
| POST   | `/api/import`                        | Upload Excel audit lama                    |
| GET    | `/api/export`                        | Download Excel                             |
| GET    | `/api/users`                         | List user (ADMIN only)                     |

## Role & Akses

| Role   | Inventory | Import/Export | Master Data | Audit Log | User Mgmt |
| ------ | --------- | ------------- | ----------- | --------- | --------- |
| ADMIN  | CRUD      | ✓             | CRUD        | ✓         | ✓         |
| EDITOR | CRUD      | ✓             | Read        | ✓         | ✗         |
| VIEWER | Read      | Export only   | Read        | ✗         | ✗         |

## Format Excel Import

File `.xlsx` dengan struktur:

- **1 sheet = 1 departemen** (nama sheet = kode departemen, misal `ACC`, `IT`, `HR`)
- Kolom: `No | Serial Number | NB/WS | User | ... | Windows | Office | Visio | Project | Access`
- Format lisensi: `OEM (11)` atau `OLP (2013)`

## Prisma Commands

```bash
# Generate client setelah ubah schema
npm run db:generate

# Sinkronkan schema ke DB (development)
npm run db:push

# Buat migration (production)
npm run db:migrate

# Buka Prisma Studio (GUI DB)
npm run db:studio
```
