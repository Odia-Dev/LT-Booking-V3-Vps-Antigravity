import { prisma } from "../../config/db";
import { Delivery, DeliveryChecklist, DeliveryTimeline } from "@prisma/client";

export class DeliveryRepository {
  async createDelivery(data: {
    bookingId: string;
    customerId: string;
    vehicleId: string;
    variantId: string;
    branchId: string;
    assignedExecutive?: string;
    scheduledDate?: Date;
    notes?: string;
  }): Promise<Delivery> {
    return prisma.$transaction(async (tx) => {
      // 1. Create the delivery record
      const delivery = await tx.delivery.create({
        data: {
          bookingId: data.bookingId,
          customerId: data.customerId,
          vehicleId: data.vehicleId,
          variantId: data.variantId,
          branchId: data.branchId,
          assignedExecutive: data.assignedExecutive || null,
          status: "SCHEDULED",
          scheduledDate: data.scheduledDate || null,
          notes: data.notes || null,
        },
      });

      // 2. Create the associated empty checklist
      await tx.deliveryChecklist.create({
        data: {
          deliveryId: delivery.id,
          paymentCleared: false,
          insuranceIssued: false,
          rtoCompleted: false,
          pdiCompleted: false,
          accessoriesInstalled: false,
          fuelFilled: false,
          cleaningCompleted: false,
          documentationPrepared: false,
          deliveryKitPrepared: false,
          customerOrientationCompleted: false,
        },
      });

      // 3. Create the initial timeline step
      await tx.deliveryTimeline.create({
        data: {
          deliveryId: delivery.id,
          statusBefore: "NONE",
          statusAfter: "SCHEDULED",
          comment: "Delivery handover process initiated and scheduled.",
          performedBy: "SYSTEM",
        },
      });

      return delivery;
    });
  }

  async getDeliveryById(id: string): Promise<Delivery | null> {
    return prisma.delivery.findUnique({
      where: { id },
      include: {
        booking: true,
        customer: true,
        vehicle: true,
        variant: true,
        branch: true,
        checklist: true,
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async getDeliveryByBookingId(bookingId: string): Promise<Delivery | null> {
    return prisma.delivery.findUnique({
      where: { bookingId },
      include: {
        booking: true,
        customer: true,
        vehicle: true,
        variant: true,
        branch: true,
        checklist: true,
        timeline: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  async listDeliveries(filters: {
    status?: string;
    branchId?: string;
    customerId?: string;
  }): Promise<Delivery[]> {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.branchId) where.branchId = filters.branchId;
    if (filters.customerId) where.customerId = filters.customerId;

    return prisma.delivery.findMany({
      where,
      include: {
        booking: true,
        customer: true,
        vehicle: true,
        variant: true,
        branch: true,
        checklist: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateDelivery(
    id: string,
    data: {
      status?: string;
      assignedExecutive?: string;
      scheduledDate?: Date | null;
      actualDeliveryDate?: Date | null;
      notes?: string;
    }
  ): Promise<Delivery> {
    return prisma.delivery.update({
      where: { id },
      data,
    });
  }

  async updateChecklist(
    deliveryId: string,
    data: {
      paymentCleared?: boolean;
      insuranceIssued?: boolean;
      rtoCompleted?: boolean;
      pdiCompleted?: boolean;
      accessoriesInstalled?: boolean;
      fuelFilled?: boolean;
      cleaningCompleted?: boolean;
      documentationPrepared?: boolean;
      deliveryKitPrepared?: boolean;
      customerOrientationCompleted?: boolean;
    }
  ): Promise<DeliveryChecklist> {
    return prisma.deliveryChecklist.update({
      where: { deliveryId },
      data,
    });
  }

  async addTimelineStep(data: {
    deliveryId: string;
    statusBefore: string;
    statusAfter: string;
    comment?: string;
    performedBy?: string;
  }): Promise<DeliveryTimeline> {
    return prisma.deliveryTimeline.create({
      data: {
        deliveryId: data.deliveryId,
        statusBefore: data.statusBefore,
        statusAfter: data.statusAfter,
        comment: data.comment || null,
        performedBy: data.performedBy || "SYSTEM",
      },
    });
  }
}
