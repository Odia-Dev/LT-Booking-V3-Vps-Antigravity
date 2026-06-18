import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./modules/auth/authRoutes";
import profileRoutes from "./modules/profile/profileRoutes";
import { publicRouter as vehicleRoutes, adminRouter as adminVehicleRoutes } from "./modules/vehicle/vehicleRoutes";

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
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ success: true });
});

// Route Mounts
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/admin/vehicles", adminVehicleRoutes);

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
