import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import { execSync } from "child_process";
import { prisma } from "./config/db";
import packageJson from "../package.json";
import authRoutes from "./modules/auth/authRoutes";
import profileRoutes from "./modules/profile/profileRoutes";
import dashboardProfileRoutes from "./modules/profile/dashboardProfileRoutes";
import notificationRoutes from "./modules/notification/notificationRoutes";
import dashboardNotificationRoutes from "./modules/notification/dashboardNotificationRoutes";
import { publicRouter as vehicleRoutes, adminRouter as adminVehicleRoutes, publicVehiclesRouter } from "./modules/vehicle/vehicleRoutes";
import { publicRouter as variantRoutes, variantsRouter, adminRouter as adminVariantRoutes } from "./modules/variant/variantRoutes";
import { publicRouter as colorRoutes, adminRouter as adminColorRoutes } from "./modules/color/colorRoutes";
import { publicRouter as branchRoutes, adminRouter as adminBranchRoutes, publicBranchesRouter } from "./modules/branch/branchRoutes";
import leadRoutes, { publicLeadsRouter } from "./modules/lead/leadRoutes";
import testDriveRoutes, { publicTestDriveRouter } from "./modules/testDrive/testDriveRoutes";
import dashboardTestDriveRoutes from "./modules/testDrive/dashboardTestDriveRoutes";
import bookingRoutes, { publicBookingsRouter } from "./modules/booking/bookingRoutes";
import dashboardBookingRoutes from "./modules/booking/dashboardBookingRoutes";
import paymentRoutes, { publicPaymentsRouter } from "./modules/payment/paymentRoutes";
import dashboardPaymentRoutes from "./modules/payment/dashboardPaymentRoutes";
import webhookRoutes from "./modules/payment/webhookRoutes";
import deliveryRoutes from "./modules/delivery/deliveryRoutes";
import financeRoutes from "./modules/finance/financeRoutes";
import insuranceRoutes from "./modules/insurance/insuranceRoutes";
import exchangeRoutes from "./modules/exchange/exchangeRoutes";
import analyticsRoutes from "./modules/analytics/analyticsRoutes";
import inventoryRoutes from "./modules/inventory/inventoryRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust front-facing Nginx proxy
app.set("trust proxy", 1);

// Disable X-Powered-By header to prevent technology disclosure
app.disable("x-powered-by");

// Apply basic security headers with Helmet
app.use(helmet());

// Compress response bodies for optimized bandwidth usage
app.use(compression());

// Secure CORS origin configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [process.env.FRONTEND_URL || "http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Set strict JSON and URL-encoded request payload limits with raw body verification support
app.use(
  express.json({
    limit: "50kb",
    verify: (req: any, _res: any, buf: Buffer) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "50kb" }));
app.use(cookieParser());

// Define rate limiters for critical paths (Returns HTTP 429 when exceeded)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

const publicLeadsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { success: false, message: "Too many lead submissions. Please try again in a minute." },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

const testDriveLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { success: false, message: "Too many test drive requests. Please try again in a minute." },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

const bookingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { success: false, message: "Too many booking requests. Please try again in a minute." },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

const dashboardLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: { success: false, message: "Too many dashboard requests. Please slow down." },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

// Protect critical endpoints with rate limiters
app.use("/api/auth/login", loginLimiter);
app.use("/api/public/leads", publicLeadsLimiter);
app.use("/api/test-drives", testDriveLimiter);
app.use("/api/public/test-drives", testDriveLimiter);
app.use("/api/bookings", bookingLimiter);
app.use("/api/dashboard", dashboardLimiter);
app.use("/api/public/bookings", bookingLimiter);

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
app.use("/api/dashboard/profile", dashboardProfileRoutes);
app.use("/api/dashboard/bookings", dashboardBookingRoutes);
app.use("/api/dashboard/payments", dashboardPaymentRoutes);
app.use("/api/dashboard/test-drives", dashboardTestDriveRoutes);
app.use("/api/dashboard/notifications", dashboardNotificationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api", insuranceRoutes);
app.use("/api", exchangeRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", inventoryRoutes);
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
app.use("/api/bookings", bookingRoutes);
app.use("/api/public/bookings", publicBookingsRouter);
app.use("/api/payments", paymentRoutes);
app.use("/api/public/payments", publicPaymentsRouter);
app.use("/api/webhooks", webhookRoutes);

// Serve uploaded delivery documents as static files (secured path)
// Only accessible with valid auth — direct URL access requires the relative path
app.use(
  "/uploads",
  helmet.noSniff(),
  express.static(path.join(__dirname, "..", "uploads"), {
    dotfiles: "deny",
    index: false,
  })
);

// Error handler middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);

  // Multer-specific errors (file size, unexpected field, invalid type)
  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ success: false, message: "File too large. Maximum allowed size is 10MB." });
    return;
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    res.status(400).json({ success: false, message: "Unexpected file field. Use the 'files' field name." });
    return;
  }
  if (err.message && err.message.startsWith("Unsupported file type")) {
    res.status(415).json({ success: false, message: err.message });
    return;
  }

  const isProduction = process.env.NODE_ENV === "production";

  res.status(err.status || 500).json({
    success: false,
    message: isProduction ? "Internal server error" : err.message || "Internal server error",
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

// Start Server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });
}

export default app;
