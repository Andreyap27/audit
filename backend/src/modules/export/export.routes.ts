import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { exportExcel } from "./export.controller";

const router = Router();
router.use(authenticate);

router.get("/", exportExcel);

export default router;
