import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

export const getAll = async () =>
  prisma.operatingSystem.findMany({
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
  const os = await prisma.operatingSystem.findUnique({ where: { id } });
  if (!os) throw new AppError("Operating system not found", 404);
  return prisma.operatingSystem.update({
    where: { id },
    data: { isActive: false },
  });
};
