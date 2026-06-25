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
import { authMiddleware } from "../../middleware/auth";

const router = Router();
const publicTestDriveRouter = Router();

// Public route for guest customer booking
publicTestDriveRouter.post("/", createPublicTestDrive);

// All routes require authentication
router.use(authMiddleware as any);

router.get("/", getTestDrives);
router.post("/", createTestDrive);
router.get("/:id", getTestDriveById);
router.put("/:id", updateTestDrive);
router.patch("/:id/status", updateTestDriveStatus);
router.patch("/:id/assign", assignExecutive);
router.delete("/:id", cancelTestDrive);

export { router as default, publicTestDriveRouter };
