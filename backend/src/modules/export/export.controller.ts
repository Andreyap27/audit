import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
import { z } from "zod";
import { exportToExcel } from "../reports/reports.service";

const exportFilterSchema = z.object({
  departmentId: z
    .union([z.string().min(1), z.array(z.string().min(1))])
    .optional(),
});

export const exportExcel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const parsed = exportFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation error" });
      return;
    }

    const buffer = await exportToExcel(parsed.data);
    const filename = `IT_Audit_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
