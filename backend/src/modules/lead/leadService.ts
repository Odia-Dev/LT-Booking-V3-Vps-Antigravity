import { LeadRepository, LeadFilters } from "./leadRepository";
import { Lead } from "@prisma/client";
import { prisma } from "../../config/db";
import { NotificationService } from "../../services/notificationService";

export class LeadService {
  private repo = new LeadRepository();

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private validatePhone(phone: string): boolean {
    const re = /^[\d\s\-+]{10,20}$/;
    return re.test(phone);
  }

  private async detectDuplicate(email: string, phone: string, variantId?: string | null, branchId?: string | null): Promise<boolean> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existing = await prisma.lead.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ],
        variantId: variantId || undefined,
        branchId: branchId || undefined,
        createdAt: {
          gte: twentyFourHoursAgo
        },
        status: { not: "CANCELLED" }
      }
    });
    return !!existing;
  }

  private calculateLeadScoreAndPriority(data: {
    type: string;
    source?: string;
    email: string;
    phone: string;
    notes?: string | null;
  }): { score: number; priority: "HIGH" | "MEDIUM" | "LOW" } {
    let score = 50; // Base score

    // Type of inquiry
    if (data.type === "TEST_DRIVE") {
      score += 25; // High purchase intent
    } else if (data.type === "FINANCE" || data.type === "EXCHANGE") {
      score += 15;
    } else if (data.type === "SERVICE") {
      score += 10;
    }

    // Source validation & score
    if (data.source === "GOOGLE_ADS" || data.source === "META_ADS") {
      score += 10; // Paid traffic usually has higher intent
    }

    // Completeness of profile
    if (data.email && data.phone && data.notes) {
      score += 10;
    }

    // Caps
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    let priority: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
    if (score >= 75) {
      priority = "HIGH";
    } else if (score < 50) {
      priority = "LOW";
    }

    return { score, priority };
  }

  async getLeadById(id: string): Promise<Lead> {
    const lead = await this.repo.getLeadById(id);
    if (!lead) {
      throw new Error("Lead not found");
    }
    return lead;
  }

  async listLeads(filters?: LeadFilters): Promise<{ data: Lead[]; total: number }> {
    return this.repo.listLeads(filters);
  }

  async searchLeads(query: string): Promise<Lead[]> {
    return this.repo.searchLeads(query);
  }

  async createLead(data: {
    name: string;
    email: string;
    phone: string;
    type: string;
    source?: string;
    notes?: string | null;
    preferredDate?: Date | null;
    preferredTime?: string | null;
    branchId?: string | null;
    variantId?: string | null;
    campaign?: string;
    medium?: string;
    message?: string;
    interestedModel?: string;
    preferredContactTime?: string;
    assignedExecutive?: string;
  }): Promise<Lead> {
    // 1. Phone & Email validation
    if (!this.validateEmail(data.email)) {
      throw new Error("Invalid email address format");
    }
    if (!this.validatePhone(data.phone)) {
      throw new Error("Invalid phone number format");
    }

    // 2. Lead type validation
    const allowedTypes = ["TEST_DRIVE", "SERVICE", "FINANCE", "EXCHANGE", "GENERAL"];
    if (!allowedTypes.includes(data.type)) {
      throw new Error("Invalid lead type");
    }

    // 3. Lead source validation
    const allowedSources = ["ORGANIC", "GOOGLE_ADS", "META_ADS", "REFERRAL", "DIRECT"];
    const source = data.source || "ORGANIC";
    if (data.source && !allowedSources.includes(data.source)) {
      throw new Error("Invalid lead source");
    }

    // 4. Branch validation
    if (data.branchId) {
      const branchExists = await prisma.branch.findUnique({
        where: { id: data.branchId }
      });
      if (!branchExists) {
        throw new Error("Specified Branch does not exist");
      }
    }

    // 5. Variant validation
    if (data.variantId) {
      const variantExists = await prisma.variant.findUnique({
        where: { id: data.variantId }
      });
      if (!variantExists) {
        throw new Error("Specified Variant does not exist");
      }
    }

    // 6. Duplicate detection
    const isDuplicate = await this.detectDuplicate(data.email, data.phone, data.variantId, data.branchId);
    if (isDuplicate) {
      throw new Error("A duplicate lead with same contact info was submitted recently");
    }

    // 7. Scoring and Priority assignment
    const { score, priority } = this.calculateLeadScoreAndPriority({
      type: data.type,
      source,
      email: data.email,
      phone: data.phone,
      notes: data.notes
    });

    // 8. Bundle extra fields in the notes JSON structure
    const notesPayload = {
      campaign: data.campaign,
      medium: data.medium,
      message: data.message || data.notes,
      interestedModel: data.interestedModel,
      preferredContactTime: data.preferredContactTime || data.preferredTime,
      assignedExecutive: data.assignedExecutive,
      leadScore: score,
      priority: priority,
      originalNotes: data.notes
    };

    const lead = await this.repo.createLead({
      name: data.name,
      email: data.email,
      phone: data.phone,
      type: data.type,
      status: "NEW",
      source: source,
      notes: JSON.stringify(notesPayload),
      preferredDate: data.preferredDate,
      preferredTime: data.preferredContactTime || data.preferredTime,
      branchId: data.branchId,
      variantId: data.variantId
    });

    // Trigger async notification notifications
    NotificationService.sendEmailNotification(lead).catch(console.error);
    NotificationService.sendAdminNotification(lead).catch(console.error);
    NotificationService.triggerWebhook(lead).catch(console.error);
    NotificationService.triggerWhatsAppHook(lead).catch(console.error);

    return lead;
  }

  async updateLead(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      type?: string;
      source?: string;
      notes?: string | null;
      preferredDate?: Date | null;
      preferredTime?: string | null;
      branchId?: string | null;
      variantId?: string | null;
      campaign?: string;
      medium?: string;
      message?: string;
      interestedModel?: string;
      preferredContactTime?: string;
      assignedExecutive?: string;
      priority?: string;
      status?: string;
    }
  ): Promise<Lead> {
    const existing = await this.repo.getLeadById(id);
    if (!existing) {
      throw new Error("Lead not found");
    }

    if (data.email && !this.validateEmail(data.email)) {
      throw new Error("Invalid email address format");
    }
    if (data.phone && !this.validatePhone(data.phone)) {
      throw new Error("Invalid phone number format");
    }

    if (data.branchId) {
      const branchExists = await prisma.branch.findUnique({
        where: { id: data.branchId }
      });
      if (!branchExists) {
        throw new Error("Specified Branch does not exist");
      }
    }

    if (data.variantId) {
      const variantExists = await prisma.variant.findUnique({
        where: { id: data.variantId }
      });
      if (!variantExists) {
        throw new Error("Specified Variant does not exist");
      }
    }

    // Extract current metadata from notes
    let notesObj: any = {};
    if (existing.notes) {
      try {
        notesObj = JSON.parse(existing.notes);
      } catch (e) {
        notesObj = { originalNotes: existing.notes };
      }
    }

    if (data.campaign !== undefined) notesObj.campaign = data.campaign;
    if (data.medium !== undefined) notesObj.medium = data.medium;
    if (data.message !== undefined) notesObj.message = data.message;
    if (data.interestedModel !== undefined) notesObj.interestedModel = data.interestedModel;
    if (data.preferredContactTime !== undefined) notesObj.preferredContactTime = data.preferredContactTime;
    if (data.assignedExecutive !== undefined) notesObj.assignedExecutive = data.assignedExecutive;
    if (data.priority !== undefined) notesObj.priority = data.priority;

    return this.repo.updateLead(id, {
      name: data.name,
      email: data.email,
      phone: data.phone,
      type: data.type,
      status: data.status,
      source: data.source,
      notes: JSON.stringify(notesObj),
      preferredDate: data.preferredDate,
      preferredTime: data.preferredContactTime || data.preferredTime,
      branchId: data.branchId,
      variantId: data.variantId
    });
  }

  async deleteLead(id: string): Promise<Lead> {
    const existing = await this.repo.getLeadById(id);
    if (!existing) {
      throw new Error("Lead not found");
    }
    return this.repo.deleteLead(id);
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    const allowedStatuses = ["NEW", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid status type");
    }
    const existing = await this.repo.getLeadById(id);
    if (!existing) {
      throw new Error("Lead not found");
    }
    return this.repo.updateLeadStatus(id, status);
  }

  async assignLead(id: string, executiveName: string): Promise<Lead> {
    const existing = await this.repo.getLeadById(id);
    if (!existing) {
      throw new Error("Lead not found");
    }
    return this.repo.assignLead(id, executiveName);
  }

  async updatePriority(id: string, priority: string): Promise<Lead> {
    const allowedPriorities = ["HIGH", "MEDIUM", "LOW"];
    if (!allowedPriorities.includes(priority)) {
      throw new Error("Invalid priority type");
    }
    const existing = await this.repo.getLeadById(id);
    if (!existing) {
      throw new Error("Lead not found");
    }
    return this.repo.updatePriority(id, priority);
  }
}
