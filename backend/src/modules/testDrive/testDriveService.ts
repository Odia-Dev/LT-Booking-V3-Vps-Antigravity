import { TestDriveRepository, TestDriveFilters } from "./testDriveRepository";
import { TestDrive } from "@prisma/client";
import { prisma } from "../../config/db";
import { CalendarService } from "../../services/calendarService";
import { NotificationService } from "../../services/notificationService";

export class TestDriveService {
  private repo = new TestDriveRepository();

  private async generateUniqueTestDriveId(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await prisma.testDrive.count();
    const sequence = String(count + 1).padStart(4, "0");
    const testDriveId = `TD-${year}-${sequence}`;

    // Verify uniqueness
    const exists = await prisma.testDrive.findUnique({
      where: { testDriveId },
    });

    if (exists) {
      // Add random component if sequence collision
      const random = Math.floor(1000 + Math.random() * 9000);
      return `TD-${year}-${random}`;
    }

    return testDriveId;
  }

  async getTestDriveById(id: string): Promise<TestDrive> {
    const testDrive = await this.repo.getTestDriveById(id);
    if (!testDrive) {
      throw new Error("Test drive appointment not found");
    }
    return testDrive;
  }

  async listTestDrives(filters?: TestDriveFilters): Promise<{ data: TestDrive[]; total: number }> {
    return this.repo.listTestDrives(filters);
  }

  async searchTestDrives(query: string): Promise<TestDrive[]> {
    return this.repo.searchTestDrives(query);
  }

  async listByCustomer(customerId: string): Promise<TestDrive[]> {
    return this.repo.listByCustomer(customerId);
  }

  async listByBranch(branchId: string): Promise<TestDrive[]> {
    return this.repo.listByBranch(branchId);
  }

  async listByExecutive(executiveName: string): Promise<TestDrive[]> {
    return this.repo.listByExecutive(executiveName);
  }

  async listByVehicle(vehicleId: string): Promise<TestDrive[]> {
    return this.repo.listByVehicle(vehicleId);
  }

  async createTestDrive(data: {
    customerId: string;
    leadId?: string | null;
    vehicleId: string;
    variantId: string;
    branchId: string;
    preferredDate: Date;
    preferredTime: string;
    status?: string;
    assignedExecutive?: string | null;
    notes?: string | null;
  }): Promise<TestDrive> {
    // 1. Validate Customer Exists
    const customer = await prisma.user.findUnique({
      where: { id: data.customerId },
    });
    if (!customer) {
      throw new Error("Customer user does not exist");
    }

    // 2. Validate Vehicle Exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });
    if (!vehicle || vehicle.status !== "ACTIVE") {
      throw new Error("Specified Vehicle does not exist or is inactive");
    }

    // 3. Validate Variant Exists
    const variant = await prisma.variant.findUnique({
      where: { id: data.variantId },
    });
    if (!variant || variant.vehicleId !== data.vehicleId || variant.status !== "ACTIVE") {
      throw new Error("Specified Variant does not exist or does not match vehicle");
    }

    // 4. Validate Branch Exists
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId },
    });
    if (!branch || branch.status !== "ACTIVE") {
      throw new Error("Specified Branch showroom does not exist or is inactive");
    }

    // 5. Optional Lead Validation
    if (data.leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: data.leadId },
      });
      if (!lead) {
        throw new Error("Specified Lead does not exist");
      }
    }

    // 6. Validate Booking Appointment Window
    const now = new Date();
    const preferredDate = new Date(data.preferredDate);

    // Date must be tomorrow or later
    const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    if (preferredDate < startOfTomorrow) {
      throw new Error("Preferred test drive date must be scheduled at least 24 hours in advance");
    }

    // Date must be within next 30 days
    const maxBookingDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);
    if (preferredDate > maxBookingDate) {
      throw new Error("Preferred test drive date cannot be scheduled more than 30 days in advance");
    }

    // 7. Prevent Customer Double Booking on Same Day
    const startOfDay = new Date(preferredDate.getFullYear(), preferredDate.getMonth(), preferredDate.getDate());
    const endOfDay = new Date(preferredDate.getFullYear(), preferredDate.getMonth(), preferredDate.getDate(), 23, 59, 59);

    const existingOnSameDay = await prisma.testDrive.findFirst({
      where: {
        customerId: data.customerId,
        preferredDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
    });

    if (existingOnSameDay) {
      throw new Error("Customer already has a test drive scheduled on this day");
    }

    // 8. Prevent duplicate variant-branch bookings at same day and time slot
    const duplicateBookingSlot = await prisma.testDrive.findFirst({
      where: {
        branchId: data.branchId,
        variantId: data.variantId,
        preferredDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        preferredTime: data.preferredTime,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
    });

    if (duplicateBookingSlot) {
      throw new Error("This time slot is already booked for this variant at the selected showroom branch");
    }

    // 9. Generate unique Test Drive ID
    const testDriveId = await this.generateUniqueTestDriveId();

    const created = await this.repo.createTestDrive({
      ...data,
      testDriveId,
      status: data.status || "REQUESTED",
    });

    try {
      const calendarService = new CalendarService();
      await calendarService.createAppointmentEvent(created);

      // Create reminder event 24h prior to preferred date
      const reminderTime = new Date(created.preferredDate);
      reminderTime.setDate(reminderTime.getDate() - 1);
      await calendarService.createReminderEvent(created, reminderTime);
    } catch (err) {
      console.error("[TestDriveService] Failed to create calendar events:", err);
    }

    try {
      await NotificationService.sendTestDriveEmailConfirmation(created);
      await NotificationService.sendTestDriveSMS(created);
      await NotificationService.sendTestDriveWhatsApp(created);
      await NotificationService.sendTestDrivePushNotification(created);
    } catch (err) {
      console.error("[TestDriveService] Failed to trigger notifications:", err);
    }

    return created;
  }

  async createPublicTestDrive(data: {
    name: string;
    email: string;
    phone: string;
    vehicleId: string;
    variantId: string;
    branchId: string;
    preferredDate: Date;
    preferredTime: string;
    notes?: string | null;
    campaign?: string;
    medium?: string;
    source?: string;
    referrer?: string;
    landingPageUrl?: string;
  }): Promise<TestDrive> {
    // 1. Find or create customer User
    let customer = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone }
        ]
      }
    });

    if (!customer) {
      customer = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: "CUSTOMER"
        }
      });
    }

    // 2. Find or create Lead
    let lead = await prisma.lead.findFirst({
      where: {
        phone: data.phone,
        variantId: data.variantId,
        status: { not: "CANCELLED" }
      }
    });

    if (!lead) {
      const notesPayload = {
        campaign: data.campaign,
        medium: data.medium,
        originalNotes: data.notes,
        referrer: data.referrer,
        landingPageUrl: data.landingPageUrl,
        leadScore: 75,
        priority: "HIGH"
      };

      lead = await prisma.lead.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          type: "TEST_DRIVE",
          source: data.source || "ORGANIC",
          branchId: data.branchId,
          variantId: data.variantId,
          preferredDate: data.preferredDate,
          preferredTime: data.preferredTime,
          notes: JSON.stringify(notesPayload)
        }
      });
    }

    // 3. Create test drive linking to user and lead
    return this.createTestDrive({
      customerId: customer.id,
      leadId: lead.id,
      vehicleId: data.vehicleId,
      variantId: data.variantId,
      branchId: data.branchId,
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      notes: data.notes
    });
  }

  async updateTestDrive(
    id: string,
    data: {
      customerId?: string;
      leadId?: string | null;
      vehicleId?: string;
      variantId?: string;
      branchId?: string;
      preferredDate?: Date;
      preferredTime?: string;
      status?: string;
      assignedExecutive?: string | null;
      notes?: string | null;
    }
  ): Promise<TestDrive> {
    const existing = await this.getTestDriveById(id);

    if (data.customerId) {
      const customer = await prisma.user.findUnique({
        where: { id: data.customerId },
      });
      if (!customer) {
        throw new Error("Customer user does not exist");
      }
    }

    if (data.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: data.vehicleId },
      });
      if (!vehicle || vehicle.status !== "ACTIVE") {
        throw new Error("Specified Vehicle does not exist or is inactive");
      }
    }

    if (data.variantId) {
      const variant = await prisma.variant.findUnique({
        where: { id: data.variantId },
      });
      const vehicleIdToCheck = data.vehicleId || existing.vehicleId;
      if (!variant || variant.vehicleId !== vehicleIdToCheck || variant.status !== "ACTIVE") {
        throw new Error("Specified Variant does not exist or does not match vehicle");
      }
    }

    if (data.branchId) {
      const branch = await prisma.branch.findUnique({
        where: { id: data.branchId },
      });
      if (!branch || branch.status !== "ACTIVE") {
        throw new Error("Specified Branch showroom does not exist or is inactive");
      }
    }

    if (data.preferredDate) {
      const preferredDate = new Date(data.preferredDate);
      const now = new Date();
      const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      if (preferredDate < startOfTomorrow) {
        throw new Error("Preferred test drive date must be scheduled at least 24 hours in advance");
      }
    }

    return this.repo.updateTestDrive(id, data);
  }

  async cancelTestDrive(id: string): Promise<TestDrive> {
    await this.getTestDriveById(id);
    return this.repo.cancelTestDrive(id);
  }

  async updateStatus(id: string, status: string): Promise<TestDrive> {
    await this.getTestDriveById(id);

    const allowedStatuses = ["REQUESTED", "CONFIRMED", "COMPLETED", "BOOKED", "CANCELLED", "NO_SHOW"];
    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid status type");
    }

    const updated = await this.repo.updateStatus(id, status);

    if (status === "COMPLETED") {
      try {
        const calendarService = new CalendarService();
        await calendarService.createCompletionEvent(updated);
      } catch (err) {
        console.error("[TestDriveService] Failed to create completion calendar event:", err);
      }
    }

    return updated;
  }

  async assignExecutive(id: string, executiveName: string): Promise<TestDrive> {
    await this.getTestDriveById(id);
    return this.repo.assignExecutive(id, executiveName);
  }
}
