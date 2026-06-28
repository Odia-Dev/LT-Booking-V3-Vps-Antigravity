import { Router } from "express";
import { 
  createExchangeInquiry, 
  getAdminInquiries, 
  updateExchangeInquiry, 
  getCustomerInquiries 
} from "./exchangeController";
import { authMiddleware, requireRole } from "../../middleware/auth";
import { exchangeUpload } from "../../middleware/exchangeUpload";

const router = Router();

// Public / Customer endpoint
// Use multer middleware to handle up to 5 image uploads
router.post("/public/exchange", exchangeUpload.array("images", 5), createExchangeInquiry);

// Admin endpoints
router.get("/admin/exchange", authMiddleware, requireRole(["ADMIN", "EXECUTIVE", "FINANCE_EXECUTIVE"]), getAdminInquiries);
router.patch("/admin/exchange/:id", authMiddleware, requireRole(["ADMIN", "EXECUTIVE", "FINANCE_EXECUTIVE"]), updateExchangeInquiry);

// Customer Dashboard endpoint
router.get("/exchange/my-inquiries", authMiddleware, getCustomerInquiries);

export default router;
