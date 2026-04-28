import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

export const getAll = async () =>
  prisma.unitType.findMany({
    include: { _count: { select: { devices: true } } },
    orderBy: { code: "asc" },
  });

export const getById = async (id: string) => {
  const ut = await prisma.unitType.findUnique({ where: { id } });
  if (!ut) throw new AppError("Unit type not found", 404);
  return ut;
};

export const create = async (data: {
  code: string;
  name: string;
}) => prisma.unitType.create({ data });

export const update = async (
  id: string,
  data: { code?: string; name?: string; isActive?: boolean },
) => {
  const ut = await prisma.unitType.findUnique({ where: { id } });
  if (!ut) throw new AppError("Unit type not found", 404);
  return prisma.unitType.update({ where: { id }, data });
};

export const remove = async (id: string) => {
  const ut = await prisma.unitType.findUnique({ where: { id } });
  if (!ut) throw new AppError("Unit type not found", 404);
  return prisma.unitType.update({ where: { id }, data: { isActive: false } });
};
