import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

export const getDepartments = async () => {
  return prisma.department.findMany({
    include: { _count: { select: { devices: true } } },
    orderBy: { code: "asc" },
  });
};

export const getDepartmentById = async (id: string) => {
  const dept = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { devices: true } } },
  });
  if (!dept) throw new AppError("Department not found", 404);
  return dept;
};

export const createDepartment = async (data: {
  code: string;
  name: string;
  description?: string;
}) => {
  return prisma.department.create({ data });
};

export const updateDepartment = async (
  id: string,
  data: { code?: string; name?: string; description?: string; isActive?: boolean },
) => {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw new AppError("Department not found", 404);
  return prisma.department.update({ where: { id }, data });
};

export const deleteDepartment = async (id: string) => {
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw new AppError("Department not found", 404);

  const deviceCount = await prisma.device.count({
    where: { departmentId: id, isActive: true },
  });
  if (deviceCount > 0)
    throw new AppError("Cannot delete department with active devices", 400);

  return prisma.department.update({ where: { id }, data: { isActive: false } });
};
