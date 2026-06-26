import { BookingRepository, BookingFilters } from "./bookingRepository";
import { Booking } from "@prisma/client";
import { prisma } from "../../config/db";

export class BookingService {
  private repo = new BookingRepository();

  private async generateUniqueBookingId(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `LT-${year}${month}-`;

    const count = await prisma.booking.count({
      where: {
        bookingId: {
          startsWith: prefix,
        },
      },
    });

    let nextSeq = count + 1;
    let bookingId = `${prefix}${String(nextSeq).padStart(6, "0")}`;

    let exists = await prisma.booking.findUnique({
      where: { bookingId },
    });

    let attempts = 0;
    while (exists && attempts < 10) {
      nextSeq += 1;
      bookingId = `${prefix}${String(nextSeq).padStart(6, "0")}`;
      exists = await prisma.booking.findUnique({
        where: { bookingId },
      });
      attempts += 1;
    }

    if (exists) {
      const random = Math.floor(100000 + Math.random() * 900000);
      bookingId = `${prefix}${random}`;
    }

    return bookingId;
  }

  async getBookingById(id: string): Promise<Booking> {
    const booking = await this.repo.getBookingById(id);
    if (!booking) {
      throw new Error("Booking record not found");
    }
    return booking;
  }

  async getBookingByBookingId(bookingId: string): Promise<Booking> {
    const booking = await this.repo.getBookingByBookingId(bookingId);
    if (!booking) {
      throw new Error("Booking record not found");
    }
    return booking;
  }

  async listBookings(filters?: BookingFilters): Promise<{ data: Booking[]; total: number }> {
    return this.repo.listBookings(filters);
  }

  async searchBookings(query: string): Promise<Booking[]> {
    return this.repo.searchBookings(query);
  }

  async listBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return this.repo.listBookingsByCustomer(customerId);
  }

  async listBookingsByBranch(branchId: string): Promise<Booking[]> {
    return this.repo.listBookingsByBranch(branchId);
  }

  async createBooking(data: {
    customerId: string;
    leadId?: string | null;
    testDriveId?: string | null;
    vehicleId: string;
    variantId: string;
    branchId: string;
    bookingAmount: number;
    notes?: string | null;
    assignedExecutive?: string | null;
    paymentGateway?: string | null;
    paymentId?: string | null;
    orderId?: string | null;
  }): Promise<Booking> {
    // 1. Validate Customer Exists
    const customer = await prisma.user.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      throw new Error("Customer user does not exist");
    }

    // 2. Validate Vehicle Exists & Active
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });
    if (!vehicle || vehicle.status !== "ACTIVE") {
      throw new Error("Specified Vehicle does not exist or is inactive");
    }

    // 3. Validate Variant Exists, Matches Vehicle, & Active
    const variant = await prisma.variant.findUnique({
      where: { id: data.variantId },
    });
    if (!variant || variant.vehicleId !== data.vehicleId || variant.status !== "ACTIVE") {
      throw new Error("Specified Variant does not exist or does not match vehicle");
    }

    // 4. Validate Branch Exists & Active
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId },
    });
    if (!branch || !branch.isActive || branch.status !== "ACTIVE") {
      throw new Error("Specified Branch does not exist or is inactive");
    }

    // 5. Validate bookingAmount
    if (!data.bookingAmount || data.bookingAmount <= 0) {
      throw new Error("Booking amount must be a positive number");
    }

    // 6. Prevent Duplicate Active Bookings for same customer and vehicle
    const activeBooking = await prisma.booking.findFirst({
      where: {
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        bookingStatus: {
          notIn: ["CANCELLED", "REFUNDED", "EXPIRED"],
        },
      },
    });
    if (activeBooking) {
      throw new Error("Customer already has an active booking for this vehicle");
    }

    // 7. Generate Atomic Unique Booking ID
    const bookingId = await this.generateUniqueBookingId();

    return this.repo.createBooking({
      ...data,
      bookingId,
      paymentStatus: "PENDING",
      bookingStatus: "INITIATED",
    });
  }

  async updateBooking(
    id: string,
    data: {
      customerId?: string;
      leadId?: string | null;
      testDriveId?: string | null;
      vehicleId?: string;
      variantId?: string;
      branchId?: string;
      bookingAmount?: number;
      bookingStatus?: string;
      paymentStatus?: string;
      assignedExecutive?: string | null;
      notes?: string | null;
      paymentGateway?: string | null;
      paymentId?: string | null;
      orderId?: string | null;
    }
  ): Promise<Booking> {
    const existing = await this.getBookingById(id);

    // If changing vehicle/customer, run duplicate checks
    const targetCustomer = data.customerId || existing.customerId;
    const targetVehicle = data.vehicleId || existing.vehicleId;

    if (data.customerId || data.vehicleId) {
      const activeBooking = await prisma.booking.findFirst({
        where: {
          id: { not: id },
          customerId: targetCustomer,
          vehicleId: targetVehicle,
          bookingStatus: {
            notIn: ["CANCELLED", "REFUNDED", "EXPIRED"],
          },
        },
      });
      if (activeBooking) {
        throw new Error("Customer already has another active booking for this vehicle");
      }
    }

    // If updating vehicle/variant/branch, check exists
    if (data.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
      if (!vehicle || vehicle.status !== "ACTIVE") {
        throw new Error("Specified Vehicle does not exist or is inactive");
      }
    }

    if (data.variantId) {
      const vehicleId = data.vehicleId || existing.vehicleId;
      const variant = await prisma.variant.findUnique({ where: { id: data.variantId } });
      if (!variant || variant.vehicleId !== vehicleId || variant.status !== "ACTIVE") {
        throw new Error("Specified Variant does not exist or does not match vehicle");
      }
    }

    if (data.branchId) {
      const branch = await prisma.branch.findUnique({ where: { id: data.branchId } });
      if (!branch || !branch.isActive || branch.status !== "ACTIVE") {
        throw new Error("Specified Branch does not exist or is inactive");
      }
    }

    if (data.bookingAmount !== undefined && data.bookingAmount <= 0) {
      throw new Error("Booking amount must be a positive number");
    }

    return this.repo.updateBooking(id, data);
  }

  async cancelBooking(id: string): Promise<Booking> {
    await this.getBookingById(id);
    return this.repo.cancelBooking(id);
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    await this.getBookingById(id);
    return this.repo.updateBookingStatus(id, status);
  }

  async updatePaymentStatus(id: string, status: string): Promise<Booking> {
    await this.getBookingById(id);
    return this.repo.updatePaymentStatus(id, status);
  }
}
