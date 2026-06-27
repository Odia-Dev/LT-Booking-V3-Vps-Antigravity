import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { deliveryUpload } from "../../middleware/deliveryUpload";
import {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  updateDeliveryStatus,
  updateDeliveryChecklist,
  deleteDelivery,
} from "./deliveryController";
import {
  uploadDeliveryDocuments,
  getDeliveryDocuments,
  deleteDeliveryDocument,
} from "./deliveryDocumentController";

const router = Router();

// Apply auth session validation globally to all handover endpoints
router.use(authMiddleware as any);

// ── Core Delivery CRUD ──────────────────────────────────────────────────────
router.get("/", getDeliveries as any);
router.get("/:id", getDeliveryById as any);
router.post("/", createDelivery as any);
router.patch("/:id", updateDelivery as any);
router.patch("/:id/status", updateDeliveryStatus as any);
router.patch("/:id/checklist", updateDeliveryChecklist as any);
router.delete("/:id", deleteDelivery as any);

// ── Delivery Documents ──────────────────────────────────────────────────────
// POST   /api/deliveries/:id/documents          Upload 1-5 files (PDF/image)
// GET    /api/deliveries/:id/documents          List all documents
// DELETE /api/deliveries/:id/documents/:docId  Delete a document
router.post(
  "/:id/documents",
  deliveryUpload.array("files", 5) as any,
  uploadDeliveryDocuments as any
);
router.get("/:id/documents", getDeliveryDocuments as any);
router.delete("/:id/documents/:docId", deleteDeliveryDocument as any);

export default router;
