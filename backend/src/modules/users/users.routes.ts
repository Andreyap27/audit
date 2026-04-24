import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import * as ctrl from "./users.controller";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/", ctrl.getAll);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.post("/:id/reset-password", ctrl.resetPassword);

export default router;
