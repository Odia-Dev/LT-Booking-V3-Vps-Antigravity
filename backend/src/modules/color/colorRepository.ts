import { prisma } from "../../config/db";
import { VehicleColor } from "@prisma/client";

export class ColorRepository {
  async findManyByVehicleId(vehicleId: string): Promise<VehicleColor[]> {
    return prisma.vehicleColor.findMany({
      where: { vehicleId },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string): Promise<VehicleColor | null> {
    return prisma.vehicleColor.findUnique({
      where: { id },
    });
  }

  async create(data: {
    vehicleId: string;
    name: string;
    colorCode: string;
    status?: string;
  }): Promise<VehicleColor> {
    return prisma.vehicleColor.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      vehicleId?: string;
      name?: string;
      colorCode?: string;
      status?: string;
    }
  ): Promise<VehicleColor> {
    return prisma.vehicleColor.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<VehicleColor> {
    return prisma.vehicleColor.delete({
      where: { id },
    });
  }
}
