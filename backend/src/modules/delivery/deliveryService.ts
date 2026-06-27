import { DeliveryRepository } from "./deliveryRepository";
import { Delivery, DeliveryChecklist } from "@prisma/client";

export class DeliveryService {
  private repo = new DeliveryRepository();

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
    return this.repo.createDelivery(data);
  }

  async getDeliveryById(id: string): Promise<Delivery | null> {
    return this.repo.getDeliveryById(id);
  }

  async getDeliveryByBookingId(bookingId: string): Promise<Delivery | null> {
    return this.repo.getDeliveryByBookingId(bookingId);
  }

  async listDeliveries(filters: {
    status?: string;
    branchId?: string;
    customerId?: string;
  }): Promise<Delivery[]> {
    return this.repo.listDeliveries(filters);
  }

  async updateChecklist(
    deliveryId: string,
    data: {
      insuranceCompleted?: boolean;
      rtoCompleted?: boolean;
      pdiCompleted?: boolean;
      accessoriesInstalled?: boolean;
      paymentCleared?: boolean;
      documentationCompleted?: boolean;
      vehicleCleaned?: boolean;
      fuelFilled?: boolean;
      photographsTaken?: boolean;
    },
    performedBy: string = "SYSTEM"
  ): Promise<DeliveryChecklist> {
    const updatedChecklist = await this.repo.updateChecklist(deliveryId, data);

    // Add audit note in timeline indicating checklist updates
    await this.repo.addTimelineStep({
      deliveryId,
      statusBefore: "CHECKLIST_UPDATE",
      statusAfter: "CHECKLIST_UPDATE",
      comment: "Delivery checklist milestones updated.",
      performedBy,
    });

    return updatedChecklist;
  }

  async updateDeliveryStatus(
    id: string,
    newStatus: string,
    comment?: string,
    performedBy: string = "SYSTEM"
  ): Promise<Delivery> {
    const delivery = await this.repo.getDeliveryById(id);
    if (!delivery) {
      throw new Error("Delivery record not found");
    }

    if (delivery.status === newStatus) {
      return delivery;
    }

    // Handover Validation: If transition to DELIVERED, checklist must be 100% complete
    if (newStatus === "DELIVERED") {
      const checklist = (delivery as any).checklist;
      if (!checklist) {
        throw new Error("Handover checklist is missing. Cannot mark delivery as completed.");
      }

      const allMilestonesCompleted =
        checklist.insuranceCompleted &&
        checklist.rtoCompleted &&
        checklist.pdiCompleted &&
        checklist.accessoriesInstalled &&
        checklist.paymentCleared &&
        checklist.documentationCompleted &&
        checklist.vehicleCleaned &&
        checklist.fuelFilled &&
        checklist.photographsTaken;

      if (!allMilestonesCompleted) {
        throw new Error(
          "Cannot mark delivery as completed. Handover checklist milestones are incomplete."
        );
      }
    }

    const updateData: any = { status: newStatus };
    if (newStatus === "DELIVERED") {
      updateData.actualDeliveryDate = new Date();
    }

    const updatedDelivery = await this.repo.updateDelivery(id, updateData);

    // Log the transition in the timeline audit log
    await this.repo.addTimelineStep({
      deliveryId: id,
      statusBefore: delivery.status,
      statusAfter: newStatus,
      comment: comment || `Status updated to ${newStatus}.`,
      performedBy,
    });

    return updatedDelivery;
  }
}
