import { prisma } from "../../config/db";
import { Booking } from "@prisma/client";

export interface BookingFilters {
  status?: string; // maps to bookingStatus
  paymentStatus?: string;
  branchId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class BookingRepository {
  async createBooking(data: {
    bookingId: string;
    customerId: string;
    leadId?: string | null;
    testDriveId?: string | null;
    vehicleId: string;
    variantId: string;
    branchId: string;
    bookingAmount: number;
    paymentStatus?: string;
    bookingStatus?: string;
    notes?: string | null;
    paymentGateway?: string | null;
    paymentId?: string | null;
    orderId?: string | null;
  }): Promise<Booking> {
    return prisma.booking.create({
      data,
      include: {
        customer: true,
        lead: true,
        testDrive: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
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
      paymentStatus?: string;
      bookingStatus?: string;
      notes?: string | null;
      paymentGateway?: string | null;
      paymentId?: string | null;
      orderId?: string | null;
    }
  ): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data,
      include: {
        customer: true,
        lead: true,
        testDrive: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
    });
  }

  async cancelBooking(id: string): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data: {
        bookingStatus: "CANCELLED",
      },
      include: {
        customer: true,
        lead: true,
        testDrive: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
    });
  }

  async getBookingById(id: string): Promise<Booking | null> {
    return prisma.booking.findUnique({
      where: { id },
      include: {
        customer: true,
        lead: true,
        testDrive: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
    });
  }

  async getBookingByBookingId(bookingId: string): Promise<Booking | null> {
    return prisma.booking.findUnique({
      where: { bookingId },
      include: {
        customer: true,
        lead: true,
        testDrive: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
    });
  }

  async listBookings(filters?: BookingFilters): Promise<{ data: Booking[]; total: number }> {
    const whereClause: any = {};

    if (filters?.status) {
      whereClause.bookingStatus = filters.status;
    }

    if (filters?.paymentStatus) {
      whereClause.paymentStatus = filters.paymentStatus;
    }

    if (filters?.branchId) {
      whereClause.branchId = filters.branchId;
    }

    if (filters?.startDate || filters?.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = new Date(filters.endDate);
      }
    }

    if (filters?.search) {
      whereClause.OR = [
        { bookingId: { contains: filters.search, mode: "insensitive" } },
        { notes: { contains: filters.search, mode: "insensitive" } },
        { customer: { name: { contains: filters.search, mode: "insensitive" } } },
        { customer: { phone: { contains: filters.search, mode: "insensitive" } } },
        { customer: { email: { contains: filters.search, mode: "insensitive" } } },
        { vehicle: { name: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          customer: true,
          lead: true,
          testDrive: true,
          vehicle: true,
          variant: true,
          branch: true,
        },
      }),
      prisma.booking.count({ where: whereClause }),
    ]);

    return { data, total };
  }

  async searchBookings(query: string): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: {
        OR: [
          { bookingId: { contains: query, mode: "insensitive" } },
          { customer: { name: { contains: query, mode: "insensitive" } } },
          { customer: { phone: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        customer: true,
        lead: true,
        testDrive: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async listBookingsByCustomer(customerId: string): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { customerId },
      include: {
        customer: true,
        lead: true,
        testDrive: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async listBookingsByBranch(branchId: string): Promise<Booking[]> {
    return prisma.booking.findMany({
      where: { branchId },
      include: {
        customer: true,
        lead: true,
        testDrive: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateBookingStatus(id: string, bookingStatus: string): Promise<Booking> {
    return prisma.booking.update({
      where: { id },
      data: { bookingStatus },
      include: {
        customer: true,
        lead: true,
        testDrive: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: string): Promise<Booking> {
    const data: any = { paymentStatus };
    
    // Automatically transition booking status if payment becomes successful
    if (paymentStatus === "SUCCESS") {
      data.bookingStatus = "PAYMENT_SUCCESS";
    } else if (paymentStatus === "FAILED") {
      data.bookingStatus = "PAYMENT_PENDING";
    }

    return prisma.booking.update({
      where: { id },
      data,
      include: {
        customer: true,
        lead: true,
        testDrive: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
    });
  }
}
