import fs from "fs";
import path from "path";
import { DeviceCategory, Prisma } from "@prisma/client";
import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

type TxClient = Prisma.TransactionClient;

const generateAssetCode = async (tx?: TxClient): Promise<string> => {
  const client = tx ?? prisma;
  const last = await client.device.findFirst({
    where: { assetCode: { startsWith: "RTS-" } },
    orderBy: { assetCode: "desc" },
    select: { assetCode: true },
  });
  let next = 1;
  if (last?.assetCode) {
    const num = parseInt(last.assetCode.replace("RTS-", ""), 10);
    if (!isNaN(num)) next = num + 1;
  }
  return `RTS-${String(next).padStart(6, "0")}`;
};

export const getNextAssetCode = () => generateAssetCode();

const LICENSE_FIELDS = [
  { field: "operatingSystemId", label: "OS" },
  { field: "officeId",          label: "Microsoft Office" },
  { field: "visioId",           label: "Microsoft Visio" },
  { field: "projectId",         label: "Microsoft Project" },
  { field: "accessId",          label: "Microsoft Access" },
] as const;

const checkLicenseAvailability = async (
  tx: TxClient,
  data: Partial<Record<string, unknown>>,
  excludeDeviceId?: string,
) => {
  for (const { field, label } of LICENSE_FIELDS) {
    const value = data[field];
    if (!value || value === null) continue;
    const conflict = await tx.device.findFirst({
      where: {
        [field]: value as string,
        isActive: true,
        ...(excludeDeviceId ? { id: { not: excludeDeviceId } } : {}),
      },
      select: { serialNumber: true },
    });
    if (conflict)
      throw new AppError(
        `Lisensi ${label} ini sudah digunakan oleh perangkat ${conflict.serialNumber}`,
        400,
      );
  }
};

const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");

const deleteProofFile = (relativePath: string | null) => {
  if (!relativePath) return;
  const rel = relativePath.replace(/^\/uploads\//, "");
  const fullPath = path.join(UPLOADS_DIR, rel);
  fs.unlink(fullPath, () => undefined);
};

const deleteProofDir = (serialNumber: string | null) => {
  if (!serialNumber) return;
  const safeSerial = serialNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
  // Remove both old path (evidence/) and new path (devices/) for cleanup
  for (const sub of ["evidence", "devices"]) {
    fs.rm(path.join(UPLOADS_DIR, sub, safeSerial), { recursive: true, force: true }, () => undefined);
  }
};

const deviceInclude = {
  department: true,
  unitType: true,
  operatingSystem: true,
  office: true,
  visio: true,
  project: true,
  access: true,
};

const labelSoftware = (name: string, version: string, licenseType: string) =>
  `${name} ${version} ${licenseType}`;

const buildHistorySnapshot = (device: {
  userName: string | null;
  department: { code: string; name: string } | null;
  unitType: { code: string; name: string } | null;
  operatingSystem: { version: string; licenseType: string } | null;
  office: { version: string; licenseType: string } | null;
  visio: { version: string; licenseType: string } | null;
  project: { version: string; licenseType: string } | null;
  access: { version: string; licenseType: string } | null;
  serialNumberProofPaths: string[];
}) => ({
  userName: device.userName,
  departmentCode: device.department?.code,
  departmentName: device.department?.name,
  unitTypeCode: device.unitType?.code,
  unitTypeName: device.unitType?.name,
  operatingSystemLabel: device.operatingSystem
    ? `${device.operatingSystem.version} ${device.operatingSystem.licenseType}`
    : null,
  officeLabel: device.office
    ? labelSoftware("Office", device.office.version, device.office.licenseType)
    : null,
  visioLabel: device.visio
    ? labelSoftware("Visio", device.visio.version, device.visio.licenseType)
    : null,
  projectLabel: device.project
    ? labelSoftware(
        "Project",
        device.project.version,
        device.project.licenseType,
      )
    : null,
  accessLabel: device.access
    ? labelSoftware("Access", device.access.version, device.access.licenseType)
    : null,
  serialNumberProofPath: device.serialNumberProofPaths[0] ?? null,
});

const buildOrderBy = (sortBy?: string, sortOrder: "asc" | "desc" = "asc") => {
  const dir = sortOrder;
  switch (sortBy) {
    case "createdAt":    return [{ createdAt: dir }];
    case "serialNumber": return [{ serialNumber: dir }];
    case "userName":     return [{ userName: dir }];
    case "dept":         return [{ department: { code: dir } }];
    case "notes":        return [{ notes: dir }];
    case "assetCode":    return [{ assetCode: dir }];
    default:             return [{ createdAt: "desc" as const }];
  }
};

export const getDevices = async (filters: {
  category?: string;
  departmentId?: string;
  unitTypeId?: string;
  operatingSystemId?: string;
  officeId?: string;
  visioId?: string;
  projectId?: string;
  accessId?: string;
  search?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const {
    search, page, limit,
    operatingSystemId, officeId, visioId, projectId, accessId,
    sortBy, sortOrder,
    ...rest
  } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isActive: true };

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) where[key] = value;
  }

  // Filter software by version+licenseType so all records with the same label match
  if (operatingSystemId) {
    const os = await prisma.operatingSystem.findUnique({
      where: { id: operatingSystemId },
      select: { version: true, licenseType: true },
    });
    if (os) where.operatingSystem = { version: os.version, licenseType: os.licenseType };
  }

  if (officeId) {
    const sw = await prisma.microsoftSoftware.findUnique({
      where: { id: officeId },
      select: { version: true, licenseType: true },
    });
    if (sw) where.office = { version: sw.version, licenseType: sw.licenseType };
  }

  if (visioId) {
    const sw = await prisma.microsoftSoftware.findUnique({
      where: { id: visioId },
      select: { version: true, licenseType: true },
    });
    if (sw) where.visio = { version: sw.version, licenseType: sw.licenseType };
  }

  if (projectId) {
    const sw = await prisma.microsoftSoftware.findUnique({
      where: { id: projectId },
      select: { version: true, licenseType: true },
    });
    if (sw) where.project = { version: sw.version, licenseType: sw.licenseType };
  }

  if (accessId) {
    const sw = await prisma.microsoftSoftware.findUnique({
      where: { id: accessId },
      select: { version: true, licenseType: true },
    });
    if (sw) where.access = { version: sw.version, licenseType: sw.licenseType };
  }

  if (search) {
    where.OR = [
      { serialNumber: { contains: search, mode: "insensitive" } },
      { userName: { contains: search, mode: "insensitive" } },
      { assetCode: { contains: search, mode: "insensitive" } },
      { notes: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.device.findMany({
      where,
      include: deviceInclude,
      skip,
      take: limit,
      orderBy: buildOrderBy(sortBy, sortOrder),
    }),
    prisma.device.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getDeviceById = async (id: string) => {
  const device = await prisma.device.findUnique({
    where: { id },
    include: deviceInclude,
  });
  if (!device || !device.isActive) throw new AppError("Device not found", 404);
  return device;
};

export const createDevice = async (
  data: {
    serialNumber: string;
    assetCode?: string;
    userName?: string;
    category?: DeviceCategory;
    canBeLent?: boolean;
    departmentId: string;
    unitTypeId?: string;
    operatingSystemId?: string;
    officeId?: string;
    visioId?: string;
    projectId?: string;
    accessId?: string;
    notes?: string;
    serialNumberProofPaths?: string[];
    hardwareImagePaths?: string[];
  },
  userId: string,
) => {
  const device = await prisma.$transaction(async (tx) => {
    await checkLicenseAvailability(tx, data);
    const assetCode = data.assetCode ?? await generateAssetCode(tx);
    const created = await tx.device.create({ data: { ...data, assetCode }, include: deviceInclude });

    await tx.deviceAssignmentHistory.create({
      data: {
        deviceId: created.id,
        ...buildHistorySnapshot(created),
      },
    });

    await tx.auditLog.create({
      data: {
        action: "CREATE",
        tableName: "devices",
        recordId: created.id,
        newData: created as unknown as object,
        userId,
      },
    });

    return created;
  });

  return device;
};

export const updateDevice = async (
  id: string,
  data: Record<string, unknown>,
  userId: string,
) => {
  const existing = await prisma.device.findUnique({ where: { id } });
  if (!existing || !existing.isActive)
    throw new AppError("Device not found", 404);

  await checkLicenseAvailability(prisma, data, id);

  const device = await prisma.device.update({
    where: { id },
    data,
    include: deviceInclude,
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      tableName: "devices",
      recordId: id,
      oldData: existing as unknown as object,
      newData: device as unknown as object,
      userId,
    },
  });

  return device;
};

export const deleteDevice = async (id: string, userId: string) => {
  const existing = await prisma.device.findUnique({ where: { id } });
  if (!existing || !existing.isActive)
    throw new AppError("Device not found", 404);

  await prisma.device.update({ where: { id }, data: { isActive: false } });

  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      tableName: "devices",
      recordId: id,
      oldData: existing as unknown as object,
      userId,
    },
  });

  for (const p of existing.serialNumberProofPaths) deleteProofFile(p);
  for (const p of existing.hardwareImagePaths) deleteProofFile(p);
  deleteProofDir(existing.serialNumber);
};

export const reassignDevice = async (
  id: string,
  data: {
    userName: string;
    departmentId?: string;
    unitTypeId?: string;
    operatingSystemId: string;
    officeId?: string | null;
    visioId?: string | null;
    projectId?: string | null;
    accessId?: string | null;
    reassignmentNote?: string;
    serialNumberProofPaths?: string[];
  },
  userId: string,
) => {
  const existing = await prisma.device.findUnique({ where: { id } });
  if (!existing || !existing.isActive)
    throw new AppError("Device not found", 404);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.deviceAssignmentHistory.updateMany({
      where: { deviceId: id, endedAt: null },
      data: { endedAt: new Date() },
    });

    const reassigned = await tx.device.update({
      where: { id },
      data: {
        userName: data.userName,
        departmentId: data.departmentId,
        unitTypeId: data.unitTypeId,
        operatingSystemId: data.operatingSystemId,
        officeId: data.officeId ?? null,
        visioId: data.visioId ?? null,
        projectId: data.projectId ?? null,
        accessId: data.accessId ?? null,
        serialNumberProofPaths: data.serialNumberProofPaths ?? [],
      },
      include: deviceInclude,
    });

    await tx.deviceAssignmentHistory.create({
      data: {
        deviceId: reassigned.id,
        reassignmentNote: data.reassignmentNote,
        ...buildHistorySnapshot(reassigned),
      },
    });

    await tx.auditLog.create({
      data: {
        action: "REASSIGN",
        tableName: "devices",
        recordId: id,
        oldData: existing as unknown as object,
        newData: reassigned as unknown as object,
        userId,
      },
    });

    return reassigned;
  });

  return updated;
};

export const returnDeviceToGA = async (
  id: string,
  note: string,
  userId: string,
) => {
  const existing = await prisma.device.findUnique({ where: { id } });
  if (!existing || !existing.isActive)
    throw new AppError("Device not found", 404);

  const device = await prisma.device.update({
    where: { id },
    data: { isActive: false, returnedToGAAt: new Date(), returnedToGANote: note, reactivationNote: null },
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      tableName: "devices",
      recordId: id,
      oldData: existing as unknown as object,
      newData: device as unknown as object,
      userId,
    },
  });

  deleteProofDir(existing.serialNumber);
  return device;
};

export const reactivateDevice = async (id: string, note: string, userId: string) => {
  const existing = await prisma.device.findUnique({ where: { id } });
  if (!existing) throw new AppError("Device not found", 404);
  if (existing.isActive) throw new AppError("Perangkat masih aktif", 400);

  const device = await prisma.device.update({
    where: { id },
    data: { isActive: true, returnedToGAAt: null, returnedToGANote: null, reactivationNote: note },
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      tableName: "devices",
      recordId: id,
      oldData: existing as unknown as object,
      newData: device as unknown as object,
      userId,
    },
  });

  return device;
};

export const getDeviceAssignmentHistory = async (deviceId: string) => {
  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) throw new AppError("Device not found", 404);

  return prisma.deviceAssignmentHistory.findMany({
    where: { deviceId },
    orderBy: [{ assignedAt: "desc" }],
  });
};
