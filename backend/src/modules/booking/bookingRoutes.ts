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
  createPublicBooking,
} from "./bookingController";
import { authMiddleware } from "../../middleware/auth";

const router = Router();
const publicBookingsRouter = Router();

// Public route for customer checkout bookings
publicBookingsRouter.post("/", createPublicBooking);

// Protected booking endpoints require active authentication session
router.get("/", authMiddleware as any, getBookings);
router.get("/:id", authMiddleware as any, getBookingById);
router.get("/booking-id/:bookingId", authMiddleware as any, getBookingByBookingId);
router.post("/", authMiddleware as any, createBooking);
router.put("/:id", authMiddleware as any, updateBooking);
router.patch("/:id/status", authMiddleware as any, updateBookingStatus);
router.patch("/:id/payment-status", authMiddleware as any, updatePaymentStatus);
router.patch("/:id/cancel", authMiddleware as any, cancelBooking);
router.delete("/:id", authMiddleware as any, deleteBooking);

export { router as default, publicBookingsRouter };
