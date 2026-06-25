import { Router } from "express";
import {
  getTestDrives,
  getTestDriveById,
  createTestDrive,
  updateTestDrive,
  updateTestDriveStatus,
  assignExecutive,
  cancelTestDrive,
} from "./testDriveController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authMiddleware as any);

router.get("/", getTestDrives);
router.post("/", createTestDrive);
router.get("/:id", getTestDriveById);
router.put("/:id", updateTestDrive);
router.patch("/:id/status", updateTestDriveStatus);
router.patch("/:id/assign", assignExecutive);
router.delete("/:id", cancelTestDrive);

export default router;
