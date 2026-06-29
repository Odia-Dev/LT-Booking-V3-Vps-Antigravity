import { prisma } from "../../config/db";
import { TestDrive } from "@prisma/client";

export interface TestDriveFilters {
  status?: string;
  branchId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export class TestDriveRepository {
  async createTestDrive(data: {
    testDriveId: string;
    customerId?: string | null;
    leadId?: string | null;
    vehicleId: string;
    variantId: string;
    branchId: string;
    preferredDate: Date;
    preferredTime: string;
    status?: string;
    assignedExecutive?: string | null;
    notes?: string | null;
    guestName?: string | null;
    guestEmail?: string | null;
    guestPhone?: string | null;
  }): Promise<TestDrive> {
    return prisma.testDrive.create({
      data,
      include: {
        customer: true,
        lead: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
    });
  }

  async updateTestDrive(
    id: string,
    data: {
      customerId?: string | null;
      leadId?: string | null;
      vehicleId?: string;
      variantId?: string;
      branchId?: string;
      preferredDate?: Date;
      preferredTime?: string;
      status?: string;
      assignedExecutive?: string | null;
      notes?: string | null;
      guestName?: string | null;
      guestEmail?: string | null;
      guestPhone?: string | null;
    }
  ): Promise<TestDrive> {
    return prisma.testDrive.update({
      where: { id },
      data,
      include: {
        customer: true,
        lead: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
    });
  }

  async cancelTestDrive(id: string): Promise<TestDrive> {
    return prisma.testDrive.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        customer: true,
        lead: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
    });
  }

  async getTestDriveById(id: string): Promise<TestDrive | null> {
    return prisma.testDrive.findUnique({
      where: { id },
      include: {
        customer: true,
        lead: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
    });
  }

  async listTestDrives(filters?: TestDriveFilters): Promise<{ data: TestDrive[]; total: number }> {
    const whereClause: any = {};

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.branchId) {
      whereClause.branchId = filters.branchId;
    }

    if (filters?.startDate || filters?.endDate) {
      whereClause.preferredDate = {};
      if (filters.startDate) {
        whereClause.preferredDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.preferredDate.lte = new Date(filters.endDate);
      }
    }

    if (filters?.search) {
      whereClause.OR = [
        { testDriveId: { contains: filters.search, mode: "insensitive" } },
        { assignedExecutive: { contains: filters.search, mode: "insensitive" } },
        { customer: { name: { contains: filters.search, mode: "insensitive" } } },
        { customer: { phone: { contains: filters.search, mode: "insensitive" } } },
        { customer: { email: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.testDrive.findMany({
        where: whereClause,
        orderBy: { preferredDate: "desc" },
        take: limit,
        skip,
        include: {
          customer: true,
          lead: true,
          vehicle: true,
          variant: true,
          branch: true,
        },
      }),
      prisma.testDrive.count({ where: whereClause }),
    ]);

    return { data, total };
  }

  async searchTestDrives(query: string): Promise<TestDrive[]> {
    return prisma.testDrive.findMany({
      where: {
        OR: [
          { testDriveId: { contains: query, mode: "insensitive" } },
          { assignedExecutive: { contains: query, mode: "insensitive" } },
          { customer: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        customer: true,
        lead: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
      orderBy: { preferredDate: "desc" },
    });
  }

  async listByCustomer(customerId: string): Promise<TestDrive[]> {
    return prisma.testDrive.findMany({
      where: { customerId },
      include: {
        customer: true,
        lead: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
      orderBy: { preferredDate: "desc" },
    });
  }

  async listByBranch(branchId: string): Promise<TestDrive[]> {
    return prisma.testDrive.findMany({
      where: { branchId },
      include: {
        customer: true,
        lead: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
      orderBy: { preferredDate: "desc" },
    });
  }

  async listByExecutive(executiveName: string): Promise<TestDrive[]> {
    return prisma.testDrive.findMany({
      where: { assignedExecutive: executiveName },
      include: {
        customer: true,
        lead: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
      orderBy: { preferredDate: "desc" },
    });
  }

  async listByVehicle(vehicleId: string): Promise<TestDrive[]> {
    return prisma.testDrive.findMany({
      where: { vehicleId },
      include: {
        customer: true,
        lead: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
      orderBy: { preferredDate: "desc" },
    });
  }

  async updateStatus(id: string, status: string): Promise<TestDrive> {
    return prisma.testDrive.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        lead: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
    });
  }

  async assignExecutive(id: string, executiveName: string): Promise<TestDrive> {
    return prisma.testDrive.update({
      where: { id },
      data: { assignedExecutive: executiveName },
      include: {
        customer: true,
        lead: true,
        vehicle: true,
        variant: true,
        branch: true,
      },
    });
  }
}
