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
import { authMiddleware, requireRole } from "../../middleware/auth";
import { publicLeadRateLimiter, spamProtection } from "../../middleware/rateLimiter";

const router = Router();
const publicLeadsRouter = Router();

// Public route for lead creation (available on both endpoints)
publicLeadsRouter.post("/", publicLeadRateLimiter, spamProtection, createLead);
router.post("/", publicLeadRateLimiter, spamProtection, createLead);

// Protected routes (Admin only)
router.get("/", authMiddleware as any, requireRole(["ADMIN"]) as any, getLeads);
router.get("/:id", authMiddleware as any, requireRole(["ADMIN"]) as any, getLeadById);
router.put("/:id", authMiddleware as any, requireRole(["ADMIN"]) as any, updateLead);
router.patch("/:id/status", authMiddleware as any, requireRole(["ADMIN"]) as any, updateLeadStatus);
router.patch("/:id/assign", authMiddleware as any, requireRole(["ADMIN"]) as any, assignLead);
router.delete("/:id", authMiddleware as any, requireRole(["ADMIN"]) as any, deleteLead);

export { router as default, publicLeadsRouter };
