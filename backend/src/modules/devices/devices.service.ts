import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

const deviceInclude = {
  department: true,
  unitType: true,
  operatingSystem: true,
  office: true,
  visio: true,
  project: true,
  access: true,
};

export const getDevices = async (filters: {
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
}) => {
  const { search, page, limit, ...rest } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isActive: true };

  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) where[key] = value;
  }

  if (search) {
    where.OR = [
      { serialNumber: { contains: search, mode: "insensitive" } },
      { userName: { contains: search, mode: "insensitive" } },
      { assetCode: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.device.findMany({
      where,
      include: deviceInclude,
      skip,
      take: limit,
      orderBy: [{ department: { code: "asc" } }, { serialNumber: "asc" }],
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
    departmentId: string;
    unitTypeId: string;
    operatingSystemId?: string;
    officeId?: string;
    visioId?: string;
    projectId?: string;
    accessId?: string;
    notes?: string;
  },
  userId: string,
) => {
  const device = await prisma.device.create({ data, include: deviceInclude });

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      tableName: "devices",
      recordId: device.id,
      newData: device as unknown as object,
      userId,
    },
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
};
