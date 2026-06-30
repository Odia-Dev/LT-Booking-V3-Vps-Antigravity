import { prisma } from "../../config/db";
import { Vehicle } from "@prisma/client";

export interface VehicleFilters {
  category?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

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

    // Default status is ACTIVE when searching publicly
    whereClause.status = { not: "ARCHIVED" };

    return prisma.vehicle.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
  }

  async listVehicles(filters?: VehicleFilters): Promise<{ data: Vehicle[]; total: number }> {
    const whereClause: any = {};

    if (filters?.category) {
      whereClause.category = filters.category;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    } else {
      whereClause.status = { not: "ARCHIVED" };
    }

    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.vehicle.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.vehicle.count({ where: whereClause }),
    ]);

    return { data, total };
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

  async getVehicleById(id: string): Promise<Vehicle | null> {
    return this.findById(id);
  }

  async getVehicleBySlug(slug: string): Promise<Vehicle | null> {
    return this.findBySlug(slug);
  }

  async createVehicle(data: {
    name: string;
    slug: string;
    category: string;
    description?: string;
    shortDescription?: string;
    heroImage?: string;
    thumbnail?: string;
    gallery?: any;
    brochure?: string;
    youtubeUrl?: string;
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    startingPrice?: number;
    onRoadPrice?: number;
    bookingAmount?: number;
    sortOrder?: number;
    modelCode?: string;
    fuelType?: string;
    transmission?: string;
    mileage?: string;
    engine?: string;
    seatingCapacity?: number;
    bootSpace?: string;
    groundClearance?: string;
    warranty?: string;
    isFeatured?: boolean;
    isActive?: boolean;
  }): Promise<Vehicle> {
    return this.create(data);
  }

  async create(data: {
    name: string;
    slug: string;
    category: string;
    description?: string;
    shortDescription?: string;
    heroImage?: string;
    thumbnail?: string;
    gallery?: any;
    brochure?: string;
    youtubeUrl?: string;
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    startingPrice?: number;
    onRoadPrice?: number;
    bookingAmount?: number;
    sortOrder?: number;
    modelCode?: string;
    fuelType?: string;
    transmission?: string;
    mileage?: string;
    engine?: string;
    seatingCapacity?: number;
    bootSpace?: string;
    groundClearance?: string;
    warranty?: string;
    isFeatured?: boolean;
    isActive?: boolean;
  }): Promise<Vehicle> {
    return prisma.vehicle.create({
      data,
    });
  }

  async updateVehicle(
    id: string,
    data: {
      name?: string;
      slug?: string;
      category?: string;
      description?: string;
      shortDescription?: string;
      heroImage?: string;
      thumbnail?: string;
      gallery?: any;
      brochure?: string;
      youtubeUrl?: string;
      status?: string;
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
      startingPrice?: number;
      onRoadPrice?: number;
      bookingAmount?: number;
      sortOrder?: number;
      modelCode?: string;
      fuelType?: string;
      transmission?: string;
      mileage?: string;
      engine?: string;
      seatingCapacity?: number;
      bootSpace?: string;
      groundClearance?: string;
      warranty?: string;
      isFeatured?: boolean;
      isActive?: boolean;
    }
  ): Promise<Vehicle> {
    return this.update(id, data);
  }

  async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      category?: string;
      description?: string;
      shortDescription?: string;
      heroImage?: string;
      thumbnail?: string;
      gallery?: any;
      brochure?: string;
      youtubeUrl?: string;
      status?: string;
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
      startingPrice?: number;
      onRoadPrice?: number;
      bookingAmount?: number;
      sortOrder?: number;
      modelCode?: string;
      fuelType?: string;
      transmission?: string;
      mileage?: string;
      engine?: string;
      seatingCapacity?: number;
      bootSpace?: string;
      groundClearance?: string;
      warranty?: string;
      isFeatured?: boolean;
      isActive?: boolean;
    }
  ): Promise<Vehicle> {
    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async deleteVehicle(id: string): Promise<Vehicle> {
    return this.delete(id);
  }

  async delete(id: string): Promise<Vehicle> {
    // Soft delete by updating status to ARCHIVED
    return prisma.vehicle.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  }

  async searchVehicles(query: string): Promise<Vehicle[]> {
    return prisma.vehicle.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
        status: { not: "ARCHIVED" },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(id: string, status: string): Promise<Vehicle> {
    return prisma.vehicle.update({
      where: { id },
      data: { status },
    });
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Vehicle> {
    return prisma.vehicle.update({
      where: { id },
      data: { sortOrder },
    });
  }

  async findManyPublic(filters?: { category?: string; search?: string }): Promise<Vehicle[]> {
    const whereClause: any = {
      status: { in: ["ACTIVE", "UPCOMING"] }
    };

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
      orderBy: { sortOrder: "asc" },
    });
  }

  async findBySlugPublic(slug: string): Promise<any | null> {
    return prisma.vehicle.findFirst({
      where: {
        slug,
        status: { in: ["ACTIVE", "UPCOMING"] }
      },
      include: {
        variants: {
          where: { status: "ACTIVE" },
        },
      },
    });
  }
}
