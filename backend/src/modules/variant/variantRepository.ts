import { prisma } from "../../config/db";
import { Variant } from "@prisma/client";

export interface VariantFilters {
  search?: string;
  fuelType?: string;
  transmission?: string;
  status?: string;
  vehicleId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export class VariantRepository {
  async findManyByVehicleId(vehicleId: string): Promise<Variant[]> {
    return prisma.variant.findMany({
      where: { vehicleId },
      orderBy: { price: "asc" },
    });
  }

  async findById(id: string): Promise<Variant | null> {
    return prisma.variant.findUnique({
      where: { id },
    });
  }

  async getVariantById(id: string): Promise<Variant | null> {
    return this.findById(id);
  }

  async getVariantBySlug(slug: string): Promise<Variant | null> {
    // Since Variant schema does not have a 'slug' field, we match name case-insensitively.
    // Replace hyphens with spaces for a matching attempt, or fetch all and check slugified value in JS.
    const all = await prisma.variant.findMany();
    const slugify = (text: string) =>
      text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
    return all.find(v => slugify(v.name) === slug) || null;
  }

  async createVariant(data: {
    vehicleId: string;
    name: string;
    price: number;
    fuelType: string;
    transmission: string;
    seating: number;
    status?: string;
  }): Promise<Variant> {
    return this.create(data);
  }

  async create(data: {
    vehicleId: string;
    name: string;
    price: number;
    fuelType: string;
    transmission: string;
    seating: number;
    status?: string;
  }): Promise<Variant> {
    return prisma.variant.create({
      data,
    });
  }

  async updateVariant(
    id: string,
    data: {
      vehicleId?: string;
      name?: string;
      price?: number;
      fuelType?: string;
      transmission?: string;
      seating?: number;
      status?: string;
    }
  ): Promise<Variant> {
    return this.update(id, data);
  }

  async update(
    id: string,
    data: {
      vehicleId?: string;
      name?: string;
      price?: number;
      fuelType?: string;
      transmission?: string;
      seating?: number;
      status?: string;
    }
  ): Promise<Variant> {
    return prisma.variant.update({
      where: { id },
      data,
    });
  }

  async deleteVariant(id: string): Promise<Variant> {
    return this.delete(id);
  }

  async delete(id: string): Promise<Variant> {
    return prisma.variant.delete({
      where: { id },
    });
  }

  async listVariants(filters?: VariantFilters): Promise<{ data: Variant[]; total: number }> {
    const where: any = {};

    if (filters?.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }

    if (filters?.fuelType) {
      where.fuelType = { equals: filters.fuelType, mode: "insensitive" };
    }

    if (filters?.transmission) {
      where.transmission = { equals: filters.transmission, mode: "insensitive" };
    }

    if (filters?.status) {
      where.status = { equals: filters.status, mode: "insensitive" };
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters?.search) {
      where.name = { contains: filters.search, mode: "insensitive" };
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.variant.findMany({
        where,
        orderBy: { price: "asc" },
        take: limit,
        skip,
      }),
      prisma.variant.count({ where }),
    ]);

    return { data, total };
  }

  async listVariantsByVehicle(vehicleId: string, filters?: Omit<VariantFilters, "vehicleId">): Promise<{ data: Variant[]; total: number }> {
    return this.listVariants({ ...filters, vehicleId });
  }

  async searchVariants(query: string): Promise<Variant[]> {
    return prisma.variant.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      orderBy: { price: "asc" },
    });
  }

  async updateStatus(id: string, status: string): Promise<Variant> {
    return prisma.variant.update({
      where: { id },
      data: { status },
    });
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Variant> {
    // Variant schema does not support sortOrder; return unchanged variant mapping.
    const exists = await this.findById(id);
    if (!exists) {
      throw new Error("Variant not found");
    }
    return exists;
  }
}
