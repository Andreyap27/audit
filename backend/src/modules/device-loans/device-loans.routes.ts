import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import * as ctrl from "./device-loans.controller";

const router = Router();
router.use(authenticate);

router.get("/", ctrl.getAll);
router.get("/serial/:serialNumber", ctrl.getBySerial);
router.get("/:id", ctrl.getById);
router.post("/", authorize("ADMIN", "EDITOR"), ctrl.create);
router.patch("/:id/return", authorize("ADMIN", "EDITOR"), ctrl.returnDevice);

export default router;