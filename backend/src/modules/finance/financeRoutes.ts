import { Router } from "express";
import {
  getFinanceApplications,
  getFinanceApplicationById,
  createFinanceApplication,
  updateFinanceApplication,
  updateFinanceStatus,
  deleteFinanceApplication,
  uploadFinanceDocument,
  getFinanceDocumentPreview,
  downloadFinanceDocument,
} from "./financeController";
import { financeUpload } from "../../middleware/financeUpload";
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

// Document Routes
router.post("/:id/documents", financeUpload.array("documents", 10), uploadFinanceDocument as any);
router.get("/:id/documents/:docId/preview", getFinanceDocumentPreview);
router.get("/:id/documents/:docId/download", downloadFinanceDocument);

export default router;
