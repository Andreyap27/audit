import prisma from "../../config/database";
import { AppError } from "../../middleware/errorHandler";
import { CreateLoanInput, ReturnLoanInput } from "./device-loans.schema";

const deviceInclude = { department: true, unitType: true };

export const getLoanBySerial = async (serialNumber: string) => {
  const device = await prisma.device.findUnique({
    where: { serialNumber, isActive: true },
    include: {
      ...deviceInclude,
      loans: {
        where: { status: "BORROWED" },
        orderBy: { borrowedAt: "desc" as const },
        take: 1,
      },
    },
  });
  if (!device) throw new AppError("Perangkat tidak ditemukan", 404);
  const activeLoan = device.loans[0] ?? null;
  const { loans: _, ...deviceData } = device;
  return { device: deviceData, activeLoan };
};

export const createLoan = async (input: CreateLoanInput, userId: string) => {
  const device = await prisma.device.findUnique({
    where: { id: input.deviceId, isActive: true },
  });
  if (!device) throw new AppError("Perangkat tidak ditemukan", 404);
  const existingLoan = await prisma.deviceLoan.findFirst({
    where: { deviceId: input.deviceId, status: "BORROWED" },
  });
  if (existingLoan) {
    throw new AppError(
      `Perangkat sedang dipinjam oleh ${existingLoan.borrowerName}`,
      409,
    );
  }
  return prisma.deviceLoan.create({
    data: { deviceId: input.deviceId, borrowerName: input.borrowerName, createdBy: userId },
    include: { device: { include: deviceInclude } },
  });
};

export const returnLoan = async (id: string, input: ReturnLoanInput) => {
  const loan = await prisma.deviceLoan.findUnique({ where: { id } });
  if (!loan) throw new AppError("Data peminjaman tidak ditemukan", 404);
  if (loan.status === "RETURNED") throw new AppError("Perangkat ini sudah dikembalikan", 400);
  return prisma.deviceLoan.update({
    where: { id },
    data: {
      status: "RETURNED",
      returnedAt: new Date(),
      returnPhotoPath: input.returnPhotoPath,
      note: input.note ?? null,
    },
    include: { device: { include: deviceInclude } },
  });
};

export const getLoans = async (params: {
  page?: number; limit?: number; status?: string; search?: string;
}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = {};
  if (params.status && ["BORROWED", "RETURNED"].includes(params.status)) {
    where.status = params.status;
  }
  if (params.search) {
    where.OR = [
      { borrowerName: { contains: params.search, mode: "insensitive" } },
      { device: { serialNumber: { contains: params.search, mode: "insensitive" } } },
    ];
  }
  const [data, total] = await prisma.$transaction([
    prisma.deviceLoan.findMany({
      where, skip, take: limit,
      orderBy: { borrowedAt: "desc" },
      include: { device: { include: deviceInclude } },
    }),
    prisma.deviceLoan.count({ where }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getLoanById = async (id: string) => {
  const loan = await prisma.deviceLoan.findUnique({
    where: { id },
    include: { device: { include: deviceInclude } },
  });
  if (!loan) throw new AppError("Data peminjaman tidak ditemukan", 404);
  return loan;
};