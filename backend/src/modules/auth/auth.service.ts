import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../middleware/errorHandler";

export const loginService = async (identifier: string, password: string) => {
  const isEmail = identifier.includes("@");
  const user = await prisma.user.findFirst({
    where: isEmail
      ? { email: identifier }
      : { username: identifier },
  });

  if (!user || !user.isActive) {
    throw new AppError("Invalid credentials", 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

export const getMeService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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
