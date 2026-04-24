import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../../middleware/auth";
import { importExcel } from "./import.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.originalname.endsWith(".xlsx")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .xlsx files are allowed"));
    }
  },
});

const router = Router();
router.use(authenticate);

router.post(
  "/",
  authorize("ADMIN", "EDITOR"),
  upload.single("file"),
  importExcel,
);

export default router;
