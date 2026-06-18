import { VariantRepository } from "./variantRepository";
import { VehicleRepository } from "../vehicle/vehicleRepository";
import { Variant } from "@prisma/client";

export class VariantService {
  private repo = new VariantRepository();
  private vehicleRepo = new VehicleRepository();

  async getVariantsByVehicleId(vehicleId: string): Promise<Variant[]> {
    const vehicle = await this.vehicleRepo.findById(vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return this.repo.findManyByVehicleId(vehicleId);
  }

  async getVariantById(id: string): Promise<Variant> {
    const variant = await this.repo.findById(id);
    if (!variant) {
      throw new Error("Variant not found");
    }
    return variant;
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
    const vehicle = await this.vehicleRepo.findById(data.vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return this.repo.create(data);
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
    const variant = await this.repo.findById(id);
    if (!variant) {
      throw new Error("Variant not found");
    }

    if (data.vehicleId) {
      const vehicle = await this.vehicleRepo.findById(data.vehicleId);
      if (!vehicle) {
        throw new Error("Vehicle not found");
      }
    }

    return this.repo.update(id, data);
  }

  async deleteVariant(id: string): Promise<Variant> {
    const variant = await this.repo.findById(id);
    if (!variant) {
      throw new Error("Variant not found");
    }
    return this.repo.delete(id);
  }
}
