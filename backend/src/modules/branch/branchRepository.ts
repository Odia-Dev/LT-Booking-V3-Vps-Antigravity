import { prisma } from "../../config/db";
import { Branch } from "@prisma/client";

export class BranchRepository {
  async findMany(): Promise<Branch[]> {
    return prisma.branch.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findActive(): Promise<Branch[]> {
    return prisma.branch.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string): Promise<Branch | null> {
    return prisma.branch.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<Branch | null> {
    return prisma.branch.findUnique({
      where: { code },
    });
  }

  async create(data: {
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
    status?: string;
    isActive?: boolean;
  }): Promise<Branch> {
    return prisma.branch.create({
      data,
    });
  }

  async update(
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
      status?: string;
      isActive?: boolean;
    }
  ): Promise<Branch> {
    return prisma.branch.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Branch> {
    return prisma.branch.delete({
      where: { id },
    });
  }
}
