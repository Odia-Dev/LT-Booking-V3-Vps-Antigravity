import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  getDeliveries,
  getDeliveryById,
  createDelivery,
  updateDelivery,
  updateDeliveryStatus,
  updateDeliveryChecklist,
  deleteDelivery,
} from "./deliveryController";

const router = Router();

// Apply auth session validation globally to all handover endpoints
router.use(authMiddleware as any);

router.get("/", getDeliveries as any);
router.get("/:id", getDeliveryById as any);
router.post("/", createDelivery as any);
router.patch("/:id", updateDelivery as any);
router.patch("/:id/status", updateDeliveryStatus as any);
router.patch("/:id/checklist", updateDeliveryChecklist as any);
router.delete("/:id", deleteDelivery as any);

export default router;
