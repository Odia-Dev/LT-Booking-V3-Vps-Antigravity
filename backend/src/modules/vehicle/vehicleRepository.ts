import { prisma } from "../../config/db";
import { Vehicle } from "@prisma/client";

export class VehicleRepository {
  async findMany(filters?: { category?: string; search?: string }): Promise<Vehicle[]> {
    const whereClause: any = {};

    if (filters?.category) {
      whereClause.category = filters.category;
    }

    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.vehicle.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
  }

  async findBySlug(slug: string): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({
      where: { slug },
    });
  }

  async findById(id: string): Promise<Vehicle | null> {
    return prisma.vehicle.findUnique({
      where: { id },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    category: string;
    description?: string;
    heroImage?: string;
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
  }): Promise<Vehicle> {
    return prisma.vehicle.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      category?: string;
      description?: string;
      heroImage?: string;
      status?: string;
      seoTitle?: string;
      seoDescription?: string;
    }
  ): Promise<Vehicle> {
    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Vehicle> {
    return prisma.vehicle.delete({
      where: { id },
    });
  }
}
