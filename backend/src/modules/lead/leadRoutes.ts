import { Router } from "express";
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStatus,
  assignLead,
  deleteLead,
} from "./leadController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

// Public route for lead creation
router.post("/", createLead);

// Protected routes (Admin only)
router.get("/", authMiddleware as any, getLeads);
router.get("/:id", authMiddleware as any, getLeadById);
router.put("/:id", authMiddleware as any, updateLead);
router.patch("/:id/status", authMiddleware as any, updateLeadStatus);
router.patch("/:id/assign", authMiddleware as any, assignLead);
router.delete("/:id", authMiddleware as any, deleteLead);

export default router;
