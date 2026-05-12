import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth";

const buildRelativePath = (req: AuthRequest, filename: string): string => {
  const module = ((req.query.module as string | undefined)?.trim() || "misc")
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  const folder = (req.query.folder as string | undefined)?.trim();
  const safeFolder = folder ? folder.replace(/[^a-zA-Z0-9_-]/g, "_") : "";
  return safeFolder
    ? `/uploads/${module}/${safeFolder}/${filename}`
    : `/uploads/${module}/${filename}`;
};

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

    const relativePath = buildRelativePath(req, req.file.filename);

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

    const results = files.map((file) => {
      const relativePath = buildRelativePath(req, file.filename);
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
