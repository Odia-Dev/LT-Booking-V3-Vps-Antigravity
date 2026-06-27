import { Router } from "express";
import { createOrder, getPaymentById, getPaymentByOrderId, verifyPayment, initiateRefund, getRefundHistory, getPayments } from "./paymentController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();
const publicPaymentsRouter = Router();

// Public routes for guest checkout payment flow
publicPaymentsRouter.post("/order", createOrder as any);
publicPaymentsRouter.post("/verify", verifyPayment as any);

// Require active authentication session for operations
router.get("/", authMiddleware as any, getPayments as any);
router.post("/order", authMiddleware as any, createOrder as any);
router.post("/verify", authMiddleware as any, verifyPayment as any);
router.get("/:id", authMiddleware as any, getPaymentById as any);
router.get("/order/:orderId", authMiddleware as any, getPaymentByOrderId as any);
router.post("/:id/refund", authMiddleware as any, initiateRefund as any);
router.get("/:id/refunds", authMiddleware as any, getRefundHistory as any);

export { router as default, publicPaymentsRouter };
