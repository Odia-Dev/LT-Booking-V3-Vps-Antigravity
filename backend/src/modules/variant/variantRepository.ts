import { prisma } from "../../config/db";
import { Variant } from "@prisma/client";

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

  async delete(id: string): Promise<Variant> {
    return prisma.variant.delete({
      where: { id },
    });
  }
}
