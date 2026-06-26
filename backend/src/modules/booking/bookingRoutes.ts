import { Router } from "express";
import {
  getBookings,
  getBookingById,
  getBookingByBookingId,
  createBooking,
  updateBooking,
  updateBookingStatus,
  updatePaymentStatus,
  cancelBooking,
  deleteBooking,
} from "./bookingController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();

// All booking endpoints require active authentication session
router.use(authMiddleware as any);

router.get("/", getBookings);
router.get("/:id", getBookingById);
router.get("/booking-id/:bookingId", getBookingByBookingId);
router.post("/", createBooking);
router.put("/:id", updateBooking);
router.patch("/:id/status", updateBookingStatus);
router.patch("/:id/payment-status", updatePaymentStatus);
router.patch("/:id/cancel", cancelBooking);
router.delete("/:id", deleteBooking);

export default router;
