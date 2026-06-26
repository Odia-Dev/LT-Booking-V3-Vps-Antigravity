import { Router } from "express";
import { createOrder, getPaymentById, getPaymentByOrderId } from "./paymentController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

// Require active authentication session for all payment operations
router.post("/order", authMiddleware as any, createOrder as any);
router.get("/:id", authMiddleware as any, getPaymentById as any);
router.get("/order/:orderId", authMiddleware as any, getPaymentByOrderId as any);

export default router;
