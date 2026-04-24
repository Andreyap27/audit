import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
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

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export default app;
