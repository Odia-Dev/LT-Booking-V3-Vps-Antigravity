import { Router } from "express";
import {
  getFinanceApplications,
  getFinanceApplicationById,
  createFinanceApplication,
  updateFinanceApplication,
  updateFinanceStatus,
  deleteFinanceApplication,
} from "./financeController";
import { authMiddleware, requireRole } from "../../middleware/auth";

const router = Router();

// Apply authentication middleware to all finance routes
router.use(authMiddleware as any);

router.get("/", getFinanceApplications);
router.get("/:id", getFinanceApplicationById);
router.post("/", createFinanceApplication);
router.patch("/:id", updateFinanceApplication);
router.patch("/:id/status", updateFinanceStatus);
router.delete("/:id", deleteFinanceApplication);

export default router;
