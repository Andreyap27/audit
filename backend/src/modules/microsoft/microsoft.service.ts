import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { MsType } from "@prisma/client";

export const getAll = async (type: MsType) => {
  const activeComputer = { isActive: true, category: "COMPUTER" } as const;
  const items = await prisma.microsoftSoftware.findMany({
    where: { type, isActive: true },
    include: {
      officeDevices:   { where: activeComputer, select: { id: true }, take: 1 },
      visioDevices:    { where: activeComputer, select: { id: true }, take: 1 },
      projectDevices:  { where: activeComputer, select: { id: true }, take: 1 },
      accessDevices:   { where: activeComputer, select: { id: true }, take: 1 },
    },
    orderBy: [{ version: "desc" }, { licenseType: "asc" }],
  });
  return items.map(({ officeDevices, visioDevices, projectDevices, accessDevices, ...item }) => {
    const deviceArr =
      type === "OFFICE"  ? officeDevices  :
      type === "VISIO"   ? visioDevices   :
      type === "PROJECT" ? projectDevices :
                           accessDevices;
    return { ...item, usedByDeviceId: deviceArr[0]?.id ?? null };
  });
};

export const getById = async (id: string) => {
  const ms = await prisma.microsoftSoftware.findUnique({ where: { id } });
  if (!ms) throw new AppError("Microsoft software not found", 404);
  return ms;
};

export const create = async (data: {
  type: MsType;
  version: string;
  licenseType: string;
  serialNumber?: string;
  proofPaths?: string[];
}) =>
  prisma.microsoftSoftware.create({
    data: {
      ...data,
      proofPaths: data.proofPaths ?? [],
    },
  });

export const update = async (
  id: string,
  data: {
    type?: MsType;
    version?: string;
    licenseType?: string;
    serialNumber?: string;
    proofPaths?: string[];
    isActive?: boolean;
  },
) => {
  const ms = await prisma.microsoftSoftware.findUnique({ where: { id } });
  if (!ms) throw new AppError("Microsoft software not found", 404);
  return prisma.microsoftSoftware.update({ where: { id }, data });
};

export const remove = async (id: string) => {
  const ms = await prisma.microsoftSoftware.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          officeDevices: { where: { isActive: true } },
          visioDevices: { where: { isActive: true } },
          projectDevices: { where: { isActive: true } },
          accessDevices: { where: { isActive: true } },
        },
      },
    },
  });
  if (!ms) throw new AppError("Microsoft software not found", 404);
  const inUse =
    ms._count.officeDevices +
    ms._count.visioDevices +
    ms._count.projectDevices +
    ms._count.accessDevices;
  if (inUse > 0)
    throw new AppError(
      `Software masih digunakan oleh ${inUse} perangkat aktif`,
      400,
    );
  return prisma.microsoftSoftware.update({
    where: { id },
    data: { isActive: false },
  });
};
