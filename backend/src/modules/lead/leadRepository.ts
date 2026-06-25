import { prisma } from "../../config/db";
import { Lead } from "@prisma/client";

export interface LeadFilters {
  status?: string;
  source?: string;
  type?: string;
  branchId?: string;
  variantId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class LeadRepository {
  async createLead(data: {
    name: string;
    email: string;
    phone: string;
    type: string;
    status?: string;
    source?: string;
    notes?: string | null;
    preferredDate?: Date | null;
    preferredTime?: string | null;
    branchId?: string | null;
    variantId?: string | null;
  }): Promise<Lead> {
    return prisma.lead.create({
      data,
      include: {
        branch: true,
        variant: {
          include: {
            vehicle: true,
          },
        },
      },
    });
  }

  async updateLead(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      type?: string;
      status?: string;
      source?: string;
      notes?: string | null;
      preferredDate?: Date | null;
      preferredTime?: string | null;
      branchId?: string | null;
      variantId?: string | null;
    }
  ): Promise<Lead> {
    return prisma.lead.update({
      where: { id },
      data,
      include: {
        branch: true,
        variant: {
          include: {
            vehicle: true,
          },
        },
      },
    });
  }

  async deleteLead(id: string): Promise<Lead> {
    // Soft delete: update status to CANCELLED
    return prisma.lead.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
      include: {
        branch: true,
        variant: {
          include: {
            vehicle: true,
          },
        },
      },
    });
  }

  async getLeadById(id: string): Promise<Lead | null> {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        branch: true,
        variant: {
          include: {
            vehicle: true,
          },
        },
      },
    });
  }

  async listLeads(filters?: LeadFilters): Promise<{ data: Lead[]; total: number }> {
    const whereClause: any = {};

    if (filters?.status) {
      whereClause.status = filters.status;
    } else {
      // Exclude CANCELLED (soft deleted) by default
      whereClause.status = { not: "CANCELLED" };
    }

    if (filters?.source) {
      whereClause.source = filters.source;
    }

    if (filters?.type) {
      whereClause.type = filters.type;
    }

    if (filters?.branchId) {
      whereClause.branchId = filters.branchId;
    }

    if (filters?.variantId) {
      whereClause.variantId = filters.variantId;
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
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
        { notes: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.lead.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          branch: true,
          variant: {
            include: {
              vehicle: true,
            },
          },
        },
      }),
      prisma.lead.count({ where: whereClause }),
    ]);

    return { data, total };
  }

  async searchLeads(query: string): Promise<Lead[]> {
    return prisma.lead.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
        ],
        status: { not: "CANCELLED" },
      },
      orderBy: { createdAt: "desc" },
      include: {
        branch: true,
        variant: {
          include: {
            vehicle: true,
          },
        },
      },
    });
  }

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    return prisma.lead.update({
      where: { id },
      data: { status },
      include: {
        branch: true,
        variant: {
          include: {
            vehicle: true,
          },
        },
      },
    });
  }

  async assignLead(id: string, executiveName: string): Promise<Lead> {
    const lead = await this.getLeadById(id);
    if (!lead) {
      throw new Error("Lead not found");
    }

    let notesObj: any = {};
    if (lead.notes) {
      try {
        notesObj = JSON.parse(lead.notes);
      } catch (e) {
        notesObj = { rawNotes: lead.notes };
      }
    }

    notesObj.assignedExecutive = executiveName;

    return prisma.lead.update({
      where: { id },
      data: {
        notes: JSON.stringify(notesObj),
      },
      include: {
        branch: true,
        variant: {
          include: {
            vehicle: true,
          },
        },
      },
    });
  }

  async updatePriority(id: string, priority: string): Promise<Lead> {
    const lead = await this.getLeadById(id);
    if (!lead) {
      throw new Error("Lead not found");
    }

    let notesObj: any = {};
    if (lead.notes) {
      try {
        notesObj = JSON.parse(lead.notes);
      } catch (e) {
        notesObj = { rawNotes: lead.notes };
      }
    }

    notesObj.priority = priority;

    return prisma.lead.update({
      where: { id },
      data: {
        notes: JSON.stringify(notesObj),
      },
      include: {
        branch: true,
        variant: {
          include: {
            vehicle: true,
          },
        },
      },
    });
  }
}
