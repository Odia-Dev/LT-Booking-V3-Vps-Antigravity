import { Router } from "express";
import {
  getTestDrives,
  getTestDriveById,
  createTestDrive,
  updateTestDrive,
  updateTestDriveStatus,
  assignExecutive,
  cancelTestDrive,
  createPublicTestDrive,
} from "./testDriveController";
import { authMiddleware, requireRole } from "../../middleware/auth";

const router = Router();
const publicTestDriveRouter = Router();

// Public route for guest customer booking
publicTestDriveRouter.post("/", createPublicTestDrive);

// All routes require authentication
router.use(authMiddleware as any);

// GET routes allow both ADMIN and CUSTOMER (filtered internally)
router.get("/", getTestDrives);
router.get("/:id", getTestDriveById);

// Mutation routes require ADMIN role
router.post("/", requireRole(["ADMIN"]) as any, createTestDrive);
router.put("/:id", requireRole(["ADMIN"]) as any, updateTestDrive);
router.patch("/:id/status", requireRole(["ADMIN"]) as any, updateTestDriveStatus);
router.patch("/:id/assign", requireRole(["ADMIN"]) as any, assignExecutive);
router.delete("/:id", requireRole(["ADMIN"]) as any, cancelTestDrive);

export { router as default, publicTestDriveRouter };
