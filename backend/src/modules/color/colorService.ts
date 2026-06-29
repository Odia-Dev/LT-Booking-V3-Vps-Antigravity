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
    image?: string | null;
    status?: string;
  }) {
    // Confirm vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return repo.create(data);
  }

  async updateColor(
    id: string,
    data: {
      vehicleId?: string;
      name?: string;
      colorCode?: string;
      image?: string | null;
      status?: string;
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
