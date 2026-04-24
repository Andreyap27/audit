import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import * as ctrl from "./devices.controller";

const router = Router();
router.use(authenticate);

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", authorize("ADMIN", "EDITOR"), ctrl.create);
router.put("/:id", authorize("ADMIN", "EDITOR"), ctrl.update);
router.delete("/:id", authorize("ADMIN", "EDITOR"), ctrl.remove);

export default router;
