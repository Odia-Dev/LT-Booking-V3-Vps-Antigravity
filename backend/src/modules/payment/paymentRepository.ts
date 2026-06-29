import { prisma } from "../../config/db";
import { Payment, Prisma } from "@prisma/client";

export interface PaymentFilters {
  status?: string;
  customerId?: string;
  page?: number;
  limit?: number;
}

export class PaymentRepository {
  async createPayment(data: {
    bookingId: string;
    customerId?: string | null;
    razorpayOrderId: string;
    amount: number;
    currency?: string;
  }): Promise<Payment> {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          bookingId: data.bookingId,
          customerId: data.customerId || null,
          razorpayOrderId: data.razorpayOrderId,
          amount: data.amount,
          currency: data.currency || "INR",
          status: "CREATED",
        },
      });

      // Create initial audit log
      await tx.paymentAudit.create({
        data: {
          paymentId: payment.id,
          fromStatus: "NONE",
          toStatus: "CREATED",
          action: "ORDER_CREATED",
          metadata: { razorpayOrderId: data.razorpayOrderId },
        },
      });

      return payment;
    });
  }

  async updatePayment(
    id: string,
    data: Prisma.PaymentUpdateInput,
    auditData?: {
      fromStatus: string;
      toStatus: string;
      action: string;
      metadata?: any;
    }
  ): Promise<Payment> {
    return prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id },
        data,
      });

      if (auditData) {
        await tx.paymentAudit.create({
          data: {
            paymentId: id,
            fromStatus: auditData.fromStatus,
            toStatus: auditData.toStatus,
            action: auditData.action,
            metadata: auditData.metadata || null,
          },
        });
      }

      return updatedPayment;
    });
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        booking: true,
        audits: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async getPaymentByOrderId(razorpayOrderId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { razorpayOrderId },
      include: {
        booking: true,
        audits: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async getPaymentByBookingId(bookingId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: true,
        audits: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async listPayments(filters: PaymentFilters = {}): Promise<{ data: Payment[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    const [data, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { booking: true },
      }),
      prisma.payment.count({ where }),
    ]);

    return { data, total };
  }
}
