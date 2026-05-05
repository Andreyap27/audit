import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import "dotenv/config";

import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.routes";
import devicesRoutes from "./modules/devices/devices.routes";
import departmentsRoutes from "./modules/departments/departments.routes";
import microsoftRoutes from "./modules/microsoft/microsoft.routes";
import osRoutes from "./modules/operating-systems/os.routes";
import unitTypesRoutes from "./modules/unit-types/unit-types.routes";
import reportsRoutes from "./modules/reports/reports.routes";
import importRoutes from "./modules/import/import.routes";
import exportRoutes from "./modules/export/export.routes";
import usersRoutes from "./modules/users/users.routes";
import uploadsRoutes from "./modules/uploads/uploads.routes";
import deviceLoansRoutes from "./modules/device-loans/device-loans.routes";
import versionMasterRoutes from "./modules/version-master/version-master.routes";
import { env } from "./config/env";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", (_req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  res.removeHeader("X-Frame-Options");
  next();
}, express.static(path.resolve(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/devices", devicesRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/microsoft", microsoftRoutes);
app.use("/api/operating-systems", osRoutes);
app.use("/api/unit-types", unitTypesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/import", importRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use("/api/device-loans", deviceLoansRoutes);
app.use("/api/version-master", versionMasterRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
