import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as ctrl from "./reports.controller";

const router = Router();
router.use(authenticate);

router.get("/stats", ctrl.getStats);
router.get("/departments", ctrl.getDepartmentReport);
router.get("/software", ctrl.getSoftwareReport);
router.get("/audit-log", ctrl.getAuditLog);

export default router;
