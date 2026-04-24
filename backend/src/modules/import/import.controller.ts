import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";
import { importFromExcel } from "./import.service";

export const importExcel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      res
        .status(400)
        .json({
          message:
            'No file uploaded. Send an xlsx file as multipart/form-data field "file".',
        });
      return;
    }

    const results = await importFromExcel(req.file.buffer, req.user!.id);
    res.json(results);
  } catch (err) {
    next(err);
  }
};
