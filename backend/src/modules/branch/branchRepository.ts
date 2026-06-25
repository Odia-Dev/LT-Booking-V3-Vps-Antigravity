import { prisma } from "../../config/db";
import { Branch } from "@prisma/client";

export interface BranchFilters {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class BranchRepository {
  async createBranch(data: {
    name: string;
    slug: string;
    code: string;
    address: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    googleMapsUrl: string;
    workingHours?: string;
    latitude?: number | null;
    longitude?: number | null;
    managerName?: string | null;
    managerPhone?: string | null;
    salesManager?: string | null;
    serviceManager?: string | null;
    sortOrder?: number;
    status?: string;
    isActive?: boolean;
  }): Promise<Branch> {
    return prisma.branch.create({
      data,
    });
  }

  async updateBranch(
    id: string,
    data: {
      name?: string;
      slug?: string;
      code?: string;
      address?: string;
      city?: string;
      district?: string;
      state?: string;
      pincode?: string;
      phone?: string;
      email?: string;
      googleMapsUrl?: string;
      workingHours?: string;
      latitude?: number | null;
      longitude?: number | null;
      managerName?: string | null;
      managerPhone?: string | null;
      salesManager?: string | null;
      serviceManager?: string | null;
      sortOrder?: number;
      status?: string;
      isActive?: boolean;
    }
  ): Promise<Branch> {
    return prisma.branch.update({
      where: { id },
      data,
    });
  }

  async deleteBranch(id: string): Promise<Branch> {
    // Soft delete: update status to ARCHIVED and set isActive to false
    return prisma.branch.update({
      where: { id },
      data: {
        status: "ARCHIVED",
        isActive: false,
      },
    });
  }

  async getBranchById(id: string): Promise<Branch | null> {
    return prisma.branch.findUnique({
      where: { id },
    });
  }

  async getBranchBySlug(slug: string): Promise<Branch | null> {
    return prisma.branch.findUnique({
      where: { slug },
    });
  }

  async listBranches(filters?: BranchFilters): Promise<{ data: Branch[]; total: number }> {
    const whereClause: any = {};

    if (filters?.status) {
      whereClause.status = filters.status;
    } else {
      whereClause.status = { not: "ARCHIVED" };
    }

    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { code: { contains: filters.search, mode: "insensitive" } },
        { city: { contains: filters.search, mode: "insensitive" } },
        { district: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.branch.findMany({
        where: whereClause,
        orderBy: { sortOrder: "asc" },
        take: limit,
        skip,
      }),
      prisma.branch.count({ where: whereClause }),
    ]);

    return { data, total };
  }

  async searchBranches(query: string): Promise<Branch[]> {
    return prisma.branch.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
          { district: { contains: query, mode: "insensitive" } },
        ],
        status: { not: "ARCHIVED" },
      },
      orderBy: { sortOrder: "asc" },
    });
  }

  async updateStatus(id: string, status: string): Promise<Branch> {
    return prisma.branch.update({
      where: { id },
      data: {
        status,
        isActive: status === "ACTIVE",
      },
    });
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Branch> {
    return prisma.branch.update({
      where: { id },
      data: { sortOrder },
    });
  }
}
