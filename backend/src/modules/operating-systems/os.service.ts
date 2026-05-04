import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

export const getAll = async () =>
  prisma.operatingSystem.findMany({
    where: { isActive: true },
    include: { _count: { select: { devices: true } } },
    orderBy: [{ version: "asc" }, { licenseType: "asc" }],
  });

export const getById = async (id: string) => {
  const os = await prisma.operatingSystem.findUnique({ where: { id } });
  if (!os) throw new AppError("Operating system not found", 404);
  return os;
};

export const create = async (data: {
  name: string;
  version: string;
  licenseType: string;
  serialNumber?: string;
  proofPaths?: string[];
}) =>
  prisma.operatingSystem.create({
    data: {
      ...data,
      proofPaths: data.proofPaths ?? [],
    },
  });

export const update = async (
  id: string,
  data: {
    name?: string;
    version?: string;
    licenseType?: string;
    serialNumber?: string;
    proofPaths?: string[];
    isActive?: boolean;
  },
) => {
  const os = await prisma.operatingSystem.findUnique({ where: { id } });
  if (!os) throw new AppError("Operating system not found", 404);
  return prisma.operatingSystem.update({ where: { id }, data });
};

export const remove = async (id: string) => {
  const os = await prisma.operatingSystem.findUnique({
    where: { id },
    include: { _count: { select: { devices: true } } },
  });
  if (!os) throw new AppError("Operating system not found", 404);
  if (os._count.devices > 0)
    throw new AppError(
      `OS masih digunakan oleh ${os._count.devices} perangkat`,
      400,
    );
  return prisma.operatingSystem.update({
    where: { id },
    data: { isActive: false },
  });
};
