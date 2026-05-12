import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { authenticate, authorize } from "../../middleware/auth";
import { uploadEvidence, uploadEvidenceMultiple } from "./uploads.controller";
import type { Request } from "express";

const baseUploadsDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(baseUploadsDir, { recursive: true });

const buildStorage = () =>
  multer.diskStorage({
    destination: (req: Request, _file, cb) => {
      const module = ((req.query.module as string | undefined)?.trim() || "misc")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      const folder = (req.query.folder as string | undefined)?.trim();
      const safeFolder = folder ? folder.replace(/[^a-zA-Z0-9_-]/g, "_") : "";
      const dest = safeFolder
        ? path.join(baseUploadsDir, module, safeFolder)
        : path.join(baseUploadsDir, module);
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (_req, file, cb) => {
      const safeBase = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
      const ext = path.extname(safeBase) || ".bin";
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMime =
    file.mimetype.startsWith("image/") || file.mimetype === "text/plain";
  const allowedExt = /\.(txt|png|jpg|jpeg|gif|webp)$/i.test(file.originalname);
  if (allowedMime && allowedExt) {
    cb(null, true);
    return;
  }
  cb(new Error("Hanya file .txt atau gambar (png/jpg/jpeg/gif/webp) yang diizinkan"));
};

const storage = buildStorage();

const uploadSingle = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

const uploadMultiple = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter,
});

const router = Router();
router.use(authenticate);

router.post(
  "/evidence",
  authorize("ADMIN", "EDITOR"),
  uploadSingle.single("file"),
  uploadEvidence,
);

router.post(
  "/evidence-multiple",
  authorize("ADMIN", "EDITOR"),
  uploadMultiple.array("files", 10),
  uploadEvidenceMultiple,
);

export default router;
