import { Router } from "express";
import { getPayments, getPaymentById } from "./paymentController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.get("/", authMiddleware as any, getPayments as any);
router.get("/:id", authMiddleware as any, getPaymentById as any);

export default router;
