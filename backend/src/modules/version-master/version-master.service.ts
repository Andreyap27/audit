import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

export const getVersions = async (category: string) =>
  prisma.versionMaster.findMany({
    where: { category, isActive: true },
    orderBy: { name: "asc" },
  });

export const createVersion = async (category: string, name: string) => {
  const existing = await prisma.versionMaster.findUnique({
    where: { category_name: { category, name } },
  });
  if (existing && existing.isActive)
    throw new AppError("Versi sudah ada", 400);
  if (existing && !existing.isActive)
    return prisma.versionMaster.update({
      where: { id: existing.id },
      data: { isActive: true },
    });
  return prisma.versionMaster.create({ data: { category, name } });
};

export const updateVersion = async (id: string, name: string) => {
  const existing = await prisma.versionMaster.findUnique({ where: { id } });
  if (!existing || !existing.isActive)
    throw new AppError("Versi tidak ditemukan", 404);
  const dup = await prisma.versionMaster.findUnique({
    where: { category_name: { category: existing.category, name } },
  });
  if (dup && dup.id !== id) throw new AppError("Nama versi sudah digunakan", 400);
  return prisma.versionMaster.update({ where: { id }, data: { name } });
};

export const deleteVersion = async (id: string) => {
  const existing = await prisma.versionMaster.findUnique({ where: { id } });
  if (!existing || !existing.isActive)
    throw new AppError("Versi tidak ditemukan", 404);
  return prisma.versionMaster.update({
    where: { id },
    data: { isActive: false },
  });
};
