import { ColorRepository } from "./colorRepository";
import { prisma } from "../../config/db";

const repo = new ColorRepository();

export class ColorService {
  async getColorsByVehicleId(vehicleId: string) {
    // Confirm vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return repo.findManyByVehicleId(vehicleId);
  }

  async createColor(data: {
    vehicleId: string;
    name: string;
    colorCode: string;
    code?: string | null;
    hexValue?: string | null;
    image?: string | null;
    status?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    // Confirm vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return repo.create({
      vehicleId: data.vehicleId,
      name: data.name,
      colorCode: data.colorCode,
      code: data.code,
      hexValue: data.hexValue || data.colorCode,
      image: data.image,
      status: data.status || "ACTIVE",
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder || 0,
    });
  }

  async updateColor(
    id: string,
    data: {
      vehicleId?: string;
      name?: string;
      colorCode?: string;
      code?: string | null;
      hexValue?: string | null;
      image?: string | null;
      status?: string;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) {
    const existing = await repo.findById(id);
    if (!existing) {
      throw new Error("Color not found");
    }
    return repo.update(id, data);
  }

  async deleteColor(id: string) {
    const existing = await repo.findById(id);
    if (!existing) {
      throw new Error("Color not found");
    }
    return repo.delete(id);
  }
}
