import { prisma } from "../config/db";
import { CalendarEvent } from "@prisma/client";

export interface ICalendarProvider {
  createEvent(event: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees: string[];
  }): Promise<{ externalId: string }>;

  updateEvent(externalId: string, event: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<void>;

  deleteEvent(externalId: string): Promise<void>;
}

export class GoogleCalendarProvider implements ICalendarProvider {
  async createEvent(event: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees: string[];
  }): Promise<{ externalId: string }> {
    console.log(`[Google Calendar] Mock creating event: "${event.title}"`);
    return { externalId: `gcal-${Math.random().toString(36).substring(2, 9)}` };
  }

  async updateEvent(externalId: string, event: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<void> {
    console.log(`[Google Calendar] Mock updating event ${externalId}`);
  }

  async deleteEvent(externalId: string): Promise<void> {
    console.log(`[Google Calendar] Mock deleting event ${externalId}`);
  }
}

export class OutlookCalendarProvider implements ICalendarProvider {
  async createEvent(event: {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees: string[];
  }): Promise<{ externalId: string }> {
    console.log(`[Outlook Calendar] Mock creating event: "${event.title}"`);
    return { externalId: `outlook-${Math.random().toString(36).substring(2, 9)}` };
  }

  async updateEvent(externalId: string, event: {
    title?: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
  }): Promise<void> {
    console.log(`[Outlook Calendar] Mock updating event ${externalId}`);
  }

  async deleteEvent(externalId: string): Promise<void> {
    console.log(`[Outlook Calendar] Mock deleting event ${externalId}`);
  }
}

export class CalendarService {
  private googleProvider = new GoogleCalendarProvider();
  private outlookProvider = new OutlookCalendarProvider();

  // Create local appointment and sync to providers
  async createAppointmentEvent(testDrive: any): Promise<CalendarEvent> {
    const title = `Test Drive Appointment: ${testDrive.testDriveId}`;
    const description = `Test drive for ${testDrive.vehicle?.name || "Vehicle"} (${testDrive.variant?.name || "Variant"}) at ${testDrive.branch?.name || "Branch"}. Customer: ${testDrive.customer?.name || "Guest"}`;
    
    // Create local CalendarEvent entry in DB
    const event = await prisma.calendarEvent.create({
      data: {
        testDriveId: testDrive.id,
        type: "APPOINTMENT",
        title,
        description,
        eventDate: testDrive.preferredDate,
        status: "PENDING",
      }
    });

    // Mock syncing to Google & Outlook
    try {
      const attendees = [];
      if (testDrive.customer?.email) attendees.push(testDrive.customer.email);
      if (testDrive.branch?.email) attendees.push(testDrive.branch.email);

      const startTime = new Date(testDrive.preferredDate);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

      const gcalRes = await this.googleProvider.createEvent({
        title,
        description,
        startTime,
        endTime,
        attendees,
      });

      const outlookRes = await this.outlookProvider.createEvent({
        title,
        description,
        startTime,
        endTime,
        attendees,
      });

      // Update event status
      await prisma.calendarEvent.update({
        where: { id: event.id },
        data: {
          status: "SYNCED",
          externalId: `${gcalRes.externalId}|${outlookRes.externalId}`,
          provider: "GOOGLE_OUTLOOK_MOCK",
        }
      });
    } catch (err) {
      console.error("[CalendarService] Sync to external providers failed:", err);
    }

    return event;
  }

  // Create local reminder and sync
  async createReminderEvent(testDrive: any, reminderTime: Date): Promise<CalendarEvent> {
    const title = `Reminder: Test Drive ${testDrive.testDriveId}`;
    const description = `Friendly reminder for your upcoming test drive at ${testDrive.branch?.name || "Branch"}`;

    return prisma.calendarEvent.create({
      data: {
        testDriveId: testDrive.id,
        type: "REMINDER",
        title,
        description,
        eventDate: reminderTime,
        status: "PENDING",
      }
    });
  }

  // Complete local event
  async createCompletionEvent(testDrive: any): Promise<CalendarEvent> {
    const title = `Completed: Test Drive ${testDrive.testDriveId}`;
    const description = `Test drive successfully completed. Thank you for your feedback!`;

    // Mark appointment as synced/completed, and create a completion marker event
    await prisma.calendarEvent.updateMany({
      where: {
        testDriveId: testDrive.id,
        type: "APPOINTMENT",
      },
      data: {
        status: "COMPLETED",
      }
    });

    return prisma.calendarEvent.create({
      data: {
        testDriveId: testDrive.id,
        type: "COMPLETION",
        title,
        description,
        eventDate: new Date(),
        status: "COMPLETED",
      }
    });
  }
}
