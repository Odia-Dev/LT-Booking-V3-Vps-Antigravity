import { Router } from "express";
import { createOrder, getPaymentById, getPaymentByOrderId, verifyPayment } from "./paymentController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();
const publicPaymentsRouter = Router();

// Public routes for guest checkout payment flow
publicPaymentsRouter.post("/order", createOrder as any);
publicPaymentsRouter.post("/verify", verifyPayment as any);

// Require active authentication session for administrative operations
router.post("/order", authMiddleware as any, createOrder as any);
router.get("/:id", authMiddleware as any, getPaymentById as any);
router.get("/order/:orderId", authMiddleware as any, getPaymentByOrderId as any);

export { router as default, publicPaymentsRouter };
