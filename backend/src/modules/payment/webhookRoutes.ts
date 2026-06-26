import { Router } from "express";
import { handleRazorpayWebhook } from "./webhookController";

const router = Router();

// Endpoint for receiving Razorpay webhook alerts (authenticates via signature header check)
router.post("/razorpay", handleRazorpayWebhook);

export default router;
