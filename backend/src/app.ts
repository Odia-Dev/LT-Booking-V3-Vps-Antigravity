import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { execSync } from "child_process";
import { prisma } from "./config/db";
import packageJson from "../package.json";
import authRoutes from "./modules/auth/authRoutes";
import profileRoutes from "./modules/profile/profileRoutes";
import { publicRouter as vehicleRoutes, adminRouter as adminVehicleRoutes, publicVehiclesRouter } from "./modules/vehicle/vehicleRoutes";
import { publicRouter as variantRoutes, variantsRouter, adminRouter as adminVariantRoutes } from "./modules/variant/variantRoutes";
import { publicRouter as colorRoutes, adminRouter as adminColorRoutes } from "./modules/color/colorRoutes";
import { publicRouter as branchRoutes, adminRouter as adminBranchRoutes, publicBranchesRouter } from "./modules/branch/branchRoutes";
import leadRoutes, { publicLeadsRouter } from "./modules/lead/leadRoutes";
import testDriveRoutes, { publicTestDriveRouter } from "./modules/testDrive/testDriveRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with credentials
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Request logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/health", async (req: Request, res: Response): Promise<void> => {
  let dbStatus = "connected";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = "disconnected";
  }

  const timestamp = new Date().toISOString();

  if (dbStatus === "disconnected") {
    res.status(503).json({
      success: false,
      database: "disconnected",
      timestamp,
      message: "Database connection failed.",
    });
    return;
  }

  let commit = "unknown";
  try {
    commit = execSync("git rev-parse --short HEAD").toString().trim();
  } catch (e) {}

  let branch = "unknown";
  try {
    branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
  } catch (e) {}

  const version = packageJson.version || "v1.0.0";

  res.status(200).json({
    success: true,
    application: "LT-Booking-V3",
    version,
    commit,
    branch,
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    nodeVersion: process.version,
    database: "connected",
    timestamp,
  });
});

// Route Mounts
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/vehicles", variantRoutes);
app.use("/api/public/vehicles", variantRoutes); // support GET /api/public/vehicles/:slug/variants
app.use("/api/public/vehicles", publicVehiclesRouter);
app.use("/api/variants", variantsRouter);
app.use("/api/public/variants", variantsRouter); // support GET /api/public/variants/:slug
app.use("/api/admin/vehicles", adminVehicleRoutes);
app.use("/api/admin/variants", adminVariantRoutes);
app.use("/api/vehicles", colorRoutes);
app.use("/api/admin/colors", adminColorRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/admin/branches", adminBranchRoutes);
app.use("/api/public/branches", publicBranchesRouter);
app.use("/api/leads", leadRoutes);
app.use("/api/public/leads", publicLeadsRouter);
app.use("/api/test-drives", testDriveRoutes);
app.use("/api/public/test-drives", publicTestDriveRouter);

// Error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Start Server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

export default app;
