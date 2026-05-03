import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";

export const uploadEvidence = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const serialNumber = (req.query.serialNumber as string | undefined)?.trim();
    const safeSerial = serialNumber
      ? serialNumber.replace(/[^a-zA-Z0-9_-]/g, "_")
      : "";

    const relativePath = safeSerial
      ? `/uploads/evidence/${safeSerial}/${req.file.filename}`
      : `/uploads/evidence/${req.file.filename}`;

    res.status(201).json({
      message: "File uploaded",
      path: relativePath,
      url: relativePath,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadEvidenceMultiple = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      res.status(400).json({ message: "No files uploaded" });
      return;
    }

    const folder = (req.query.folder as string | undefined)?.trim();
    const safeFolder = folder ? folder.replace(/[^a-zA-Z0-9_-]/g, "_") : "";

    const results = files.map((file) => {
      const relativePath = safeFolder
        ? `/uploads/evidence/${safeFolder}/${file.filename}`
        : `/uploads/evidence/${file.filename}`;
      return {
        path: relativePath,
        url: relativePath,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };
    });

    res.status(201).json({ message: "Files uploaded", files: results });
  } catch (err) {
    next(err);
  }
};
