import bcrypt from "bcryptjs";
import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";

const SALT_ROUNDS = 12;

export const getAll = async () =>
  prisma.user.findMany({
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

export const getById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

export const create = async (data: {
  username: string;
  email: string;
  password: string;
  role: "ADMIN" | "EDITOR" | "VIEWER";
}) => {
  const hashed = await bcrypt.hash(data.password, SALT_ROUNDS);
  return prisma.user.create({
    data: { ...data, password: hashed },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
};

export const update = async (
  id: string,
  data: {
    username?: string;
    email?: string;
    role?: "ADMIN" | "EDITOR" | "VIEWER";
    isActive?: boolean;
  },
) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
};

export const resetPassword = async (id: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
};
