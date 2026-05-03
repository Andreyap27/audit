import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { MsType } from "@prisma/client";

export const getAll = async (type: MsType) =>
  prisma.microsoftSoftware.findMany({
    where: { type },
    include: {
      _count: {
        select: {
          officeDevices: true,
          visioDevices: true,
          projectDevices: true,
          accessDevices: true,
        },
      },
    },
    orderBy: [{ version: "desc" }, { licenseType: "asc" }],
  });

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
  const ms = await prisma.microsoftSoftware.findUnique({ where: { id } });
  if (!ms) throw new AppError("Microsoft software not found", 404);
  return prisma.microsoftSoftware.update({
    where: { id },
    data: { isActive: false },
  });
};
