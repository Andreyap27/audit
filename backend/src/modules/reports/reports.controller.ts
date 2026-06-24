import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
import { z } from "zod";
import * as service from "./reports.service";

const auditLogFilterSchema = z.object({
  action: z.enum(["CREATE", "UPDATE", "DELETE", "IMPORT", "REASSIGN"]).optional(),
  userId: z.string().uuid().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["action", "tableName", "recordId", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

const softwareTypeSchema = z.object({
  type: z.enum(["OFFICE", "VISIO", "PROJECT", "ACCESS", "OS"]),
});

export const getStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.json(await service.getSummaryStats());
  } catch (err) {
    next(err);
  }
};

export const getDepartmentReport = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.json(await service.getDepartmentReport());
  } catch (err) {
    next(err);
  }
};

export const getSoftwareReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = softwareTypeSchema.safeParse(req.query);
    if (!parsed.success) {
      res
        .status(400)
        .json({
          message:
            "type query param required: OFFICE | VISIO | PROJECT | ACCESS | OS",
        });
      return;
    }
    res.json(await service.getSoftwareReport(parsed.data.type));
  } catch (err) {
    next(err);
  }
};

const loanReportFilterSchema = z.object({
  status: z.enum(["BORROWED", "RETURNED"]).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["borrowerName", "borrowedAt", "returnedAt", "status", "note", "device.serialNumber"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const getLoanReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = loanReportFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation error" });
      return;
    }
    res.json(await service.getLoanReport(parsed.data));
  } catch (err) {
    next(err);
  }
};

export const exportLoanReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { status, dateFrom, dateTo } = req.query as Record<string, string>;
    const buffer = await service.exportLoanReport({ status, dateFrom, dateTo });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="laporan-peminjaman-${Date.now()}.xlsx"`,
    );
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

const returnedToGAFilterSchema = z.object({
  departmentId: z.string().uuid().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["assetCode", "serialNumber", "category", "lastUser", "returnedToGAAt", "returnToGANote"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const getReturnedToGA = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = returnedToGAFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation error" });
      return;
    }
    res.json(await service.getReturnedToGA(parsed.data));
  } catch (err) {
    next(err);
  }
};

export const exportReturnedToGA = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { departmentId, dateFrom, dateTo } = req.query as Record<string, string>;
    const buffer = await service.exportReturnedToGA({ departmentId, dateFrom, dateTo });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="laporan-pengembalian-ga-${Date.now()}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

export const getAuditLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = auditLogFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    res.json(await service.getAuditLog(parsed.data));
  } catch (err) {
    next(err);
  }
};
