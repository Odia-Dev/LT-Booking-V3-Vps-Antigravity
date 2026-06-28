import { prisma } from "../../config/db";
import { FinanceApplication, FinanceDocument, FinanceTimeline } from "@prisma/client";

export interface FinanceFilters {
  status?: string;
  branchId?: string;
  customerId?: string;
  vehicleId?: string;
  search?: string;
  assignedExecutive?: string;
  bankName?: string;
  page?: number;
  limit?: number;
}

export class FinanceRepository {
  async createApplication(data: any): Promise<FinanceApplication> {
    return prisma.financeApplication.create({
      data,
      include: {
        customer: true,
        booking: true,
        branch: true,
        vehicle: true,
      },
    });
  }

  async getApplicationById(id: string): Promise<FinanceApplication | null> {
    return prisma.financeApplication.findUnique({
      where: { id },
      include: {
        customer: true,
        booking: true,
        branch: true,
        vehicle: true,
        documents: true,
        timelines: true,
      },
    });
  }

  async updateApplication(id: string, data: any): Promise<FinanceApplication> {
    return prisma.financeApplication.update({
      where: { id },
      data,
      include: {
        customer: true,
        booking: true,
        branch: true,
        vehicle: true,
      },
    });
  }

  async listApplications(filters?: FinanceFilters): Promise<{ data: FinanceApplication[]; total: number }> {
    const whereClause: any = {};

    if (filters?.status) whereClause.status = filters.status;
    if (filters?.branchId) whereClause.branchId = filters.branchId;
    if (filters?.customerId) whereClause.customerId = filters.customerId;
    if (filters?.vehicleId) whereClause.vehicleId = filters.vehicleId;
    if (filters?.assignedExecutive) whereClause.assignedExecutive = filters.assignedExecutive;
    if (filters?.bankName) whereClause.bankName = filters.bankName;

    if (filters?.search) {
      whereClause.OR = [
        { financeId: { contains: filters.search, mode: "insensitive" } },
        { assignedExecutive: { contains: filters.search, mode: "insensitive" } },
        { customer: { name: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.financeApplication.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          customer: true,
          booking: true,
          branch: true,
          vehicle: true,
        },
      }),
      prisma.financeApplication.count({ where: whereClause }),
    ]);

    return { data, total };
  }

  async addDocument(data: any): Promise<FinanceDocument> {
    return prisma.financeDocument.create({
      data,
    });
  }

  async getDocumentById(id: string): Promise<FinanceDocument | null> {
    return prisma.financeDocument.findUnique({
      where: { id },
    });
  }

  async addTimeline(data: any): Promise<FinanceTimeline> {
    return prisma.financeTimeline.create({
      data,
    });
  }

  async deleteApplication(id: string): Promise<FinanceApplication> {
    return prisma.financeApplication.delete({
      where: { id },
    });
  }
}
