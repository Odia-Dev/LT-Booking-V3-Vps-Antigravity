import { Router } from "express";
import { getBookings, getBookingById } from "./bookingController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

router.get("/", authMiddleware as any, getBookings as any);
router.get("/:id", authMiddleware as any, getBookingById as any);

export default router;
