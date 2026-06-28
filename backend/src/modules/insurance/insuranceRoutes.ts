import { Router } from "express";
import { 
  createInsuranceInquiry, 
  getAdminInquiries, 
  updateInsuranceInquiry, 
  getCustomerInquiries 
} from "./insuranceController";
import { authMiddleware, requireRole } from "../../middleware/auth";

const router = Router();

// Public / Customer endpoint
// Supports both authenticated and unauthenticated POSTs
router.post("/public/insurance", createInsuranceInquiry);

// Admin endpoints
router.get("/admin/insurance", authMiddleware, requireRole(["ADMIN", "EXECUTIVE", "FINANCE_EXECUTIVE"]), getAdminInquiries);
router.patch("/admin/insurance/:id", authMiddleware, requireRole(["ADMIN", "EXECUTIVE", "FINANCE_EXECUTIVE"]), updateInsuranceInquiry);

// Customer Dashboard endpoint
router.get("/insurance/my-inquiries", authMiddleware, getCustomerInquiries);

export default router;
