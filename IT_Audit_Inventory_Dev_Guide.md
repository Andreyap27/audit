# IT Audit Inventory System — Development Guide

## Stack
- **Backend**: Node.js + Express.js (REST API)
- **Frontend**: Next.js 14 (App Router)
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **Import/Export**: ExcelJS (bisa baca file audit lama .xlsx)
- **ORM**: Prisma

---

## Project Structure

```
it-audit/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts     # Prisma client
│   │   │   └── env.ts          # Environment variables
│   │   ├── middleware/
│   │   │   ├── auth.ts         # JWT verify middleware
│   │   │   ├── rbac.ts         # Role-based access
│   │   │   └── errorHandler.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.routes.ts
│   │   │   ├── devices/
│   │   │   │   ├── devices.controller.ts
│   │   │   │   ├── devices.service.ts
│   │   │   │   ├── devices.routes.ts
│   │   │   │   └── devices.schema.ts    # Zod validation
│   │   │   ├── departments/
│   │   │   ├── software/               # OS, Office, Visio, Project, Access
│   │   │   ├── unit-types/
│   │   │   ├── reports/
│   │   │   └── import/                 # Excel import service
│   │   └── app.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── .env
│
└── frontend/                   # Next.js 14
    ├── app/
    │   ├── (auth)/
    │   │   └── login/
    │   │       └── page.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx      # Sidebar + navbar
    │   │   ├── page.tsx        # Dashboard/summary
    │   │   ├── devices/
    │   │   │   ├── page.tsx    # Inventory list
    │   │   │   ├── [id]/
    │   │   │   │   └── page.tsx
    │   │   │   └── new/
    │   │   │       └── page.tsx
    │   │   ├── master/
    │   │   │   ├── departments/
    │   │   │   │   └── page.tsx
    │   │   │   ├── operating-systems/
    │   │   │   │   └── page.tsx
    │   │   │   ├── microsoft/
    │   │   │   │   ├── layout.tsx      # Tab switcher: Office / Visio / Project / Access
    │   │   │   │   ├── office/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── visio/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   ├── project/
    │   │   │   │   │   └── page.tsx
    │   │   │   │   └── access/
    │   │   │   │       └── page.tsx
    │   │   │   └── unit-types/
    │   │   │       └── page.tsx
    │   │   ├── reports/
    │   │   │   ├── departments/
    │   │   │   │   └── page.tsx
    │   │   │   ├── software/
    │   │   │   │   └── page.tsx
    │   │   │   └── audit-log/
    │   │   │       └── page.tsx
    │   │   ├── import/
    │   │   │   └── page.tsx
    │   │   └── export/
    │   │       └── page.tsx
    │   ├── globals.css
    │   └── layout.tsx
    ├── components/
    │   ├── ui/                 # Button, Input, Modal, Table, Badge
    │   ├── layout/
    │   │   ├── Sidebar.tsx     # Sidebar dengan expand/collapse Microsoft Software
    │   │   └── Navbar.tsx
    │   ├── devices/
    │   │   ├── DeviceTable.tsx
    │   │   ├── DeviceForm.tsx
    │   │   └── DeviceFilter.tsx
    │   ├── master/
    │   │   ├── MasterTable.tsx # Reusable tabel untuk semua master data
    │   │   └── MicrosoftTabs.tsx  # Tab switcher Office/Visio/Project/Access
    │   └── reports/
    │       ├── DeptReport.tsx
    │       └── SoftwareReport.tsx
    ├── hooks/
    │   ├── useDevices.ts
    │   ├── useMaster.ts        # Generic hook untuk semua master data
    │   └── useImport.ts
    ├── lib/
    │   ├── api.ts              # Axios instance + interceptors
    │   └── auth.ts             # Token management
    └── package.json
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          Int       @id @default(autoincrement())
  username    String    @unique
  email       String    @unique
  password    String
  role        Role      @default(VIEWER)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  auditLogs   AuditLog[]
}

enum Role {
  ADMIN
  EDITOR
  VIEWER
}

model Department {
  id        Int       @id @default(autoincrement())
  code      String    @unique   // "ACC", "ASL", "DSP", dll
  name      String
  isActive  Boolean   @default(true)
  devices   Device[]
}

model OperatingSystem {
  id        Int       @id @default(autoincrement())
  name      String    // "Windows 10 OEM", "Windows 11 OEM", "Windows 10 OLP", dll
  version   String    // "10", "11"
  licenseType String  // "OEM", "OLP"
  isActive  Boolean   @default(true)
  devices   Device[]
}

model MicrosoftSoftware {
  id          Int       @id @default(autoincrement())
  type        MsType              // OFFICE, VISIO, PROJECT, ACCESS
  version     String              // "2010", "2013", "2016", "2019", "2021", "2024"
  licenseType String              // "OLP", "OEM"
  isActive    Boolean   @default(true)
  officeDevices   Device[]  @relation("DeviceOffice")
  visioDevices    Device[]  @relation("DeviceVisio")
  projectDevices  Device[]  @relation("DeviceProject")
  accessDevices   Device[]  @relation("DeviceAccess")
}

enum MsType {
  OFFICE
  VISIO
  PROJECT
  ACCESS
}

model UnitType {
  id        Int       @id @default(autoincrement())
  code      String    @unique   // "NB", "WS"
  name      String              // "Notebook", "Workstation"
  isActive  Boolean   @default(true)
  devices   Device[]
}

model Device {
  id            Int              @id @default(autoincrement())
  serialNumber  String           @unique
  assetCode     String?          // kode aset internal jika ada
  userName      String?          // nama pengguna device
  
  // Relations to master data
  department    Department       @relation(fields: [departmentId], references: [id])
  departmentId  Int
  
  unitType      UnitType         @relation(fields: [unitTypeId], references: [id])
  unitTypeId    Int
  
  operatingSystem   OperatingSystem?  @relation(fields: [operatingSystemId], references: [id])
  operatingSystemId Int?
  
  office        MicrosoftSoftware?  @relation("DeviceOffice", fields: [officeId], references: [id])
  officeId      Int?
  
  visio         MicrosoftSoftware?  @relation("DeviceVisio", fields: [visioId], references: [id])
  visioId       Int?
  
  project       MicrosoftSoftware?  @relation("DeviceProject", fields: [projectId], references: [id])
  projectId     Int?
  
  access        MicrosoftSoftware?  @relation("DeviceAccess", fields: [accessId], references: [id])
  accessId      Int?

  notes         String?
  isActive      Boolean           @default(true)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  
  auditLogs     AuditLog[]
}

model AuditLog {
  id         Int      @id @default(autoincrement())
  action     String   // "CREATE", "UPDATE", "DELETE", "IMPORT"
  tableName  String   // "devices", "departments", dll
  recordId   Int?
  oldData    Json?
  newData    Json?
  userId     Int
  user       User     @relation(fields: [userId], references: [id])
  createdAt  DateTime @default(now())
}
```

---

## Backend — Express.js

### Setup

```bash
mkdir backend && cd backend
npm init -y
npm install express prisma @prisma/client bcryptjs jsonwebtoken zod cors helmet morgan
npm install exceljs multer          # untuk import Excel
npm install -D typescript ts-node nodemon @types/express @types/node @types/bcryptjs @types/jsonwebtoken @types/multer @types/cors
npx prisma init
```

### app.ts

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import devicesRoutes from './modules/devices/devices.routes';
import departmentsRoutes from './modules/departments/departments.routes';
import microsoftRoutes from './modules/microsoft/microsoft.routes';  // Office, Visio, Project, Access
import osRoutes from './modules/operating-systems/os.routes';
import unitTypesRoutes from './modules/unit-types/unit-types.routes';
import reportsRoutes from './modules/reports/reports.routes';
import importRoutes from './modules/import/import.routes';
import exportRoutes from './modules/export/export.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/microsoft', microsoftRoutes);   // ?type=OFFICE | VISIO | PROJECT | ACCESS
app.use('/api/operating-systems', osRoutes);
app.use('/api/unit-types', unitTypesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/import', importRoutes);
app.use('/api/export', exportRoutes);

app.use(errorHandler);

export default app;
```

### Auth Middleware

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; role: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
```

### Devices Routes & Controller

```typescript
// modules/devices/devices.schema.ts
import { z } from 'zod';

export const createDeviceSchema = z.object({
  serialNumber: z.string().min(1),
  userName: z.string().optional(),
  departmentId: z.number().int().positive(),
  unitTypeId: z.number().int().positive(),
  operatingSystemId: z.number().int().positive().optional(),
  officeId: z.number().int().positive().optional(),
  visioId: z.number().int().positive().optional(),
  projectId: z.number().int().positive().optional(),
  accessId: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

export const deviceFilterSchema = z.object({
  departmentId: z.coerce.number().optional(),
  unitTypeId: z.coerce.number().optional(),
  officeId: z.coerce.number().optional(),
  search: z.string().optional(),  // cari serial number atau nama user
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});
```

```typescript
// modules/devices/devices.service.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const deviceInclude = {
  department: true,
  unitType: true,
  operatingSystem: true,
  office: true,
  visio: true,
  project: true,
  access: true,
};

export const getDevices = async (filters: any) => {
  const { departmentId, unitTypeId, search, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };
  if (departmentId) where.departmentId = departmentId;
  if (unitTypeId) where.unitTypeId = unitTypeId;
  if (search) {
    where.OR = [
      { serialNumber: { contains: search, mode: 'insensitive' } },
      { userName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.device.findMany({ where, include: deviceInclude, skip, take: limit }),
    prisma.device.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const createDevice = async (data: any, userId: number) => {
  const device = await prisma.device.create({ data, include: deviceInclude });

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      tableName: 'devices',
      recordId: device.id,
      newData: device as any,
      userId,
    },
  });

  return device;
};

export const updateDevice = async (id: number, data: any, userId: number) => {
  const old = await prisma.device.findUnique({ where: { id } });
  const device = await prisma.device.update({ where: { id }, data, include: deviceInclude });

  await prisma.auditLog.create({
    data: {
      action: 'UPDATE',
      tableName: 'devices',
      recordId: id,
      oldData: old as any,
      newData: device as any,
      userId,
    },
  });

  return device;
};

export const deleteDevice = async (id: number, userId: number) => {
  const old = await prisma.device.findUnique({ where: { id } });
  await prisma.device.update({ where: { id }, data: { isActive: false } });

  await prisma.auditLog.create({
    data: { action: 'DELETE', tableName: 'devices', recordId: id, oldData: old as any, userId },
  });
};
```

### Import Excel Service

```typescript
// modules/import/import.service.ts
import ExcelJS from 'exceljs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Mapping lisensi dari format lama: "OEM (11)" -> parse type & version
const parseLicense = (raw: string | undefined) => {
  if (!raw) return null;
  // contoh: "OEM (11)" atau "OLP (2013)"
  const match = raw.match(/^(\w+)\s*\((\w+)\)$/);
  if (!match) return null;
  return { licenseType: match[1], version: match[2] };
};

export const importFromExcel = async (buffer: Buffer, userId: number) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (const worksheet of workbook.worksheets) {
    const deptCode = worksheet.name.trim().toUpperCase();

    // Cari atau buat department
    let dept = await prisma.department.findFirst({ where: { code: deptCode } });
    if (!dept) {
      dept = await prisma.department.create({ data: { code: deptCode, name: deptCode } });
    }

    worksheet.eachRow((row, rowNum) => {
      if (rowNum <= 1) return; // skip header

      const serialNumber = row.getCell(2).text?.trim();
      const unitTypeCode = row.getCell(3).text?.trim().toUpperCase(); // NB or WS
      const userName = row.getCell(4).text?.trim();
      const windowsRaw = row.getCell(6).text?.trim();
      const officeRaw = row.getCell(7).text?.trim();
      const visioRaw = row.getCell(8).text?.trim();
      const projectRaw = row.getCell(9).text?.trim();
      const accessRaw = row.getCell(10).text?.trim();

      if (!serialNumber) return; // skip baris kosong

      // Queue untuk diproses
      processRow({
        serialNumber, unitTypeCode, userName, deptId: dept!.id,
        windowsRaw, officeRaw, visioRaw, projectRaw, accessRaw,
        userId, results,
      });
    });
  }

  return results;
};

async function processRow(params: any) {
  try {
    const { serialNumber, unitTypeCode, userName, deptId, userId, results } = params;

    // Unit type
    let unitType = await prisma.unitType.findFirst({ where: { code: unitTypeCode } });
    if (!unitType) {
      unitType = await prisma.unitType.create({
        data: { code: unitTypeCode, name: unitTypeCode === 'NB' ? 'Notebook' : 'Workstation' },
      });
    }

    // OS
    const osParsed = parseLicense(params.windowsRaw);
    let osId: number | undefined;
    if (osParsed) {
      const os = await prisma.operatingSystem.upsert({
        where: { name: `${params.windowsRaw}` } as any,
        create: { name: params.windowsRaw, version: osParsed.version, licenseType: osParsed.licenseType },
        update: {},
      });
      osId = os.id;
    }

    // Office, Visio, Project, Access (pola sama)
    // ... (disingkat, pola sama dengan OS)

    await prisma.device.upsert({
      where: { serialNumber },
      create: { serialNumber, userName, departmentId: deptId, unitTypeId: unitType.id, operatingSystemId: osId },
      update: { userName, departmentId: deptId, unitTypeId: unitType.id, operatingSystemId: osId },
    });

    await prisma.auditLog.create({
      data: { action: 'IMPORT', tableName: 'devices', newData: { serialNumber }, userId },
    });

    results.success++;
  } catch (err: any) {
    params.results.failed++;
    params.results.errors.push(`${params.serialNumber}: ${err.message}`);
  }
}
```

### Reports Service

```typescript
// modules/reports/reports.service.ts
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
const prisma = new PrismaClient();

export const getSummaryStats = async () => {
  const [totalDevices, totalNB, totalWS, byDepartment, bySoftware] = await Promise.all([
    prisma.device.count({ where: { isActive: true } }),
    prisma.device.count({ where: { isActive: true, unitType: { code: 'NB' } } }),
    prisma.device.count({ where: { isActive: true, unitType: { code: 'WS' } } }),
    prisma.device.groupBy({
      by: ['departmentId'],
      where: { isActive: true },
      _count: true,
    }),
    prisma.device.groupBy({
      by: ['officeId'],
      where: { isActive: true },
      _count: true,
    }),
  ]);

  return { totalDevices, totalNB, totalWS, byDepartment, bySoftware };
};

export const exportToExcel = async (filters: any) => {
  const devices = await prisma.device.findMany({
    where: { isActive: true, ...filters },
    include: {
      department: true, unitType: true, operatingSystem: true,
      office: true, visio: true, project: true, access: true,
    },
    orderBy: [{ department: { code: 'asc' } }, { serialNumber: 'asc' }],
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('IT Audit');

  sheet.columns = [
    { header: 'No.', key: 'no', width: 5 },
    { header: 'Serial Number', key: 'serial', width: 20 },
    { header: 'NB / WS', key: 'type', width: 8 },
    { header: 'User', key: 'user', width: 25 },
    { header: 'Dept.', key: 'dept', width: 10 },
    { header: 'Windows', key: 'windows', width: 16 },
    { header: 'Office', key: 'office', width: 16 },
    { header: 'Visio', key: 'visio', width: 16 },
    { header: 'Project', key: 'project', width: 16 },
    { header: 'Access', key: 'access', width: 16 },
  ];

  // Header styling
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' },
  };

  devices.forEach((d, i) => {
    sheet.addRow({
      no: i + 1,
      serial: d.serialNumber,
      type: d.unitType.code,
      user: d.userName || '',
      dept: d.department.code,
      windows: d.operatingSystem ? `${d.operatingSystem.licenseType} (${d.operatingSystem.version})` : '',
      office: d.office ? `${d.office.licenseType} (${d.office.version})` : '',
      visio: d.visio ? `${d.visio.licenseType} (${d.visio.version})` : '',
      project: d.project ? `${d.project.licenseType} (${d.project.version})` : '',
      access: d.access ? `${d.access.licenseType} (${d.access.version})` : '',
    });
  });

  return workbook.xlsx.writeBuffer();
};
```

---

## Frontend — Next.js 14

### Setup

```bash
npx create-next-app@latest frontend --typescript --tailwind --app
cd frontend
npm install axios react-hook-form @hookform/resolvers zod
npm install @tanstack/react-query
npm install recharts           # untuk chart dashboard
npm install lucide-react       # icons
```

### API Client

```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Hooks

```typescript
// hooks/useDevices.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export const useDevices = (filters: Record<string, any>) => {
  return useQuery({
    queryKey: ['devices', filters],
    queryFn: () => api.get('/devices', { params: filters }).then(r => r.data),
  });
};

export const useCreateDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/devices', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }),
  });
};

export const useImportExcel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return api.post('/import', fd).then(r => r.data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['devices'] }),
  });
};
```

---

## API Endpoints Reference

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login, return JWT |
| POST | `/api/auth/logout` | Invalidate token |
| GET | `/api/auth/me` | Info user aktif |

### Devices (Inventory)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/devices` | List semua device (+ filter, pagination) |
| GET | `/api/devices/:id` | Detail 1 device |
| POST | `/api/devices` | Tambah device baru |
| PUT | `/api/devices/:id` | Update device |
| DELETE | `/api/devices/:id` | Soft delete device |

**Query params GET /api/devices:**
- `departmentId` — filter by dept
- `unitTypeId` — NB atau WS
- `operatingSystemId`, `officeId`, `visioId`, `projectId`, `accessId`
- `search` — cari serial number / nama user
- `page`, `limit`

### Master Data (pola sama untuk semua)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/departments` | List departments |
| POST | `/api/departments` | Tambah department |
| PUT | `/api/departments/:id` | Edit department |
| DELETE | `/api/departments/:id` | Hapus (soft delete) department |

Endpoint yang sama berlaku untuk `/api/operating-systems` dan `/api/unit-types`.

### Microsoft Software (Office, Visio, Project, Access)

Semua dikelola lewat satu endpoint dengan query param `type`:

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/microsoft?type=OFFICE` | List lisensi Office |
| GET | `/api/microsoft?type=VISIO` | List lisensi Visio |
| GET | `/api/microsoft?type=PROJECT` | List lisensi Project |
| GET | `/api/microsoft?type=ACCESS` | List lisensi Access |
| POST | `/api/microsoft` | Tambah entri (body: `{ type, version, licenseType }`) |
| PUT | `/api/microsoft/:id` | Edit entri |
| DELETE | `/api/microsoft/:id` | Hapus (soft delete) entri |

### Reports & Export & Import
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/reports/stats` | Summary counts (total device, per dept, per SW) |
| GET | `/api/reports/departments` | Rekap per departemen |
| GET | `/api/reports/software?type=OFFICE` | Distribusi lisensi per software |
| GET | `/api/reports/audit-log` | Riwayat perubahan data |
| GET | `/api/export` | Download Excel (format identik file audit lama) |
| POST | `/api/import` | Upload file Excel audit lama |

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/it_audit_db"
JWT_SECRET="your-super-secret-key-here"
JWT_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

---

## Halaman Frontend

### Dashboard (`/`)
- Kartu ringkasan: Total Device, Total NB, Total WS
- Bar chart: jumlah device per departemen
- Pie chart: distribusi versi OS & Office
- Tabel aktivitas terbaru dari audit log

### Inventory List (`/devices`)
- Tabel dengan kolom: Serial No, User, Dept, NB/WS, OS, Office, Visio, Project, Access
- Filter panel: Departemen, Unit Type, OS, tiap software MS
- Search box: cari serial number atau nama user
- Tombol: Tambah Device, Export Excel
- Pagination

### Device Form (`/devices/new` dan `/devices/[id]`)
- Form dengan semua field perangkat
- Dropdown dari master data masing-masing
- Validasi Zod di client dan server
- Submit create / update

### Import Excel (`/import`)
- Drag & drop upload file .xlsx
- Preview data per sheet sebelum diproses
- Progress bar proses import
- Laporan hasil: berhasil / gagal / duplikat

### Export Excel (`/export`)
- Pilih departemen atau ekspor semua
- Output multi-sheet (satu sheet per departemen, format identik file lama)

### Master Data — Departemen (`/master/departments`)
- List: kode, nama lengkap, jumlah device
- Tambah, edit, nonaktifkan departemen

### Master Data — Operating System (`/master/operating-systems`)
- List: nama OS, versi (10/11), tipe lisensi (OEM/OLP), jumlah device
- Tambah, edit, nonaktifkan entri OS

### Master Data — Microsoft Software (`/master/microsoft/[office|visio|project|access]`)
- Layout bersama dengan tab switcher: Office / Visio / Project / Access
- Tiap tab: list versi, tipe lisensi, jumlah device yang menggunakan
- Tambah, edit, nonaktifkan entri per software

### Master Data — Unit Type (`/master/unit-types`)
- List: kode (NB/WS), nama lengkap, jumlah device
- Tambah, edit, nonaktifkan tipe unit

### Laporan — Per Departemen (`/reports/departments`)
- Tabel rekap: Dept | Total | NB | WS | Office | Visio | Project | Access
- Klik baris → drill-down list device departemen tersebut
- Export rekap ke Excel

### Laporan — Lisensi Software (`/reports/software`)
- Tab per software: Office / Visio / Project / Access / OS
- Jumlah lisensi per versi, OEM vs OLP
- Device tanpa lisensi software tertentu

### Laporan — Audit Log (`/reports/audit-log`)
- Filter: aksi (CREATE / UPDATE / DELETE / IMPORT), user, tanggal
- Lihat data sebelum & sesudah perubahan
- Pagination, auto-refresh tiap 30 detik

### Pengaturan — Manajemen User (`/settings/users`)
- List user: nama, email, role (Admin / Editor / Viewer), status aktif
- Tambah user baru, atur role, reset password
- Nonaktifkan user tanpa hapus data historis

---

## Struktur Menu Sidebar

```
Dashboard                          /
├── Inventory
│   ├── Perangkat IT               /devices
│   ├── Import Excel               /import
│   └── Export Excel               /export
├── Master Data
│   ├── Departemen                 /master/departments
│   ├── Operating System           /master/operating-systems
│   ├── Microsoft Software
│   │   ├── Office                 /master/microsoft/office
│   │   ├── Visio                  /master/microsoft/visio
│   │   ├── Project                /master/microsoft/project
│   │   └── Access                 /master/microsoft/access
│   └── Unit Type                  /master/unit-types
├── Laporan
│   ├── Per Departemen             /reports/departments
│   ├── Lisensi Software           /reports/software
│   └── Audit Log                  /reports/audit-log
└── Pengaturan
    └── Manajemen User             /settings/users
```

**Role & akses:**
- **Admin** — akses penuh ke semua menu termasuk Master Data, Audit Log, dan Manajemen User
- **Editor** — akses Inventory (CRUD device), Import, Export, Laporan (read)
- **Viewer** — akses read-only: Inventory, Export, Laporan

---

## Urutan Development

1. **Setup project** — init backend Express + Prisma, init frontend Next.js
2. **Database** — buat schema Prisma, migrate, seed data dari Excel lama
3. **Auth module** — login endpoint, JWT middleware, route guard frontend
4. **Master data CRUD** — departments, unit-types, operating-systems
5. **Microsoft Software CRUD** — satu endpoint `/api/microsoft` dengan filter `?type=`
6. **Devices CRUD** — list dengan filter & pagination, create, update, soft delete
7. **Import Excel** — service baca file lama, parse lisensi, upsert ke DB
8. **Export Excel** — generate multi-sheet sesuai format file audit lama
9. **Frontend layout** — Sidebar (dengan expand Microsoft Software), Navbar
10. **Frontend master data** — halaman per master + tab layout Microsoft
11. **Frontend devices** — tabel inventory, filter panel, form device
12. **Frontend import/export** — upload page, preview, progress bar
13. **Dashboard** — stats API + charts Recharts
14. **Laporan** — per departemen, lisensi software, audit log
15. **Manajemen User** — CRUD user + role assignment

---

## Seed Data dari File Lama

Jalankan sekali untuk populate data awal dari file `Audit__03_mei_2019__test.xlsx`:

```bash
# Tambah script di backend/package.json
"seed": "ts-node src/scripts/seed-from-excel.ts"

# Jalankan
npm run seed -- --file=../Audit__03_mei_2019__test.xlsx
```

Script akan:
1. Baca semua sheet (tiap sheet = 1 departemen)
2. Buat department jika belum ada
3. Parse lisensi (format "OEM (11)" → type + version)
4. Upsert semua device berdasarkan serial number
