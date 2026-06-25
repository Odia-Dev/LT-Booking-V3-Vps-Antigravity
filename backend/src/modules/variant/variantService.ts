import { VariantRepository, VariantFilters } from "./variantRepository";
import { VehicleRepository } from "../vehicle/vehicleRepository";
import { Variant } from "@prisma/client";

export class VariantService {
  private repo = new VariantRepository();
  private vehicleRepo = new VehicleRepository();

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

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

  async getVariantBySlug(slug: string): Promise<Variant> {
    const variant = await this.repo.getVariantBySlug(slug);
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
    bookingAmount?: number;
    engineSize?: string | number;
    waitingPeriodWeeks?: number;
    specs?: any;
  }): Promise<Variant> {
    // 1. Vehicle existence validation
    const vehicle = await this.vehicleRepo.findById(data.vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    // 2. Duplicate name prevention (unique variant name per vehicle)
    const existingVariants = await this.repo.findManyByVehicleId(data.vehicleId);
    const hasDuplicateName = existingVariants.some(
      v => v.name.toLowerCase() === data.name.toLowerCase()
    );
    if (hasDuplicateName) {
      throw new Error("Variant with this name already exists for this vehicle");
    }

    // 3. Price validation
    if (data.price <= 0) {
      throw new Error("Price must be a positive number");
    }

    // 4. Transmission validation
    const allowedTransmissions = ["manual", "automatic", "e-drive"];
    if (!allowedTransmissions.includes(data.transmission.toLowerCase())) {
      throw new Error("Invalid transmission type. Allowed: Manual, Automatic, e-Drive");
    }

    // 5. Fuel validation
    const allowedFuels = ["petrol", "diesel", "hybrid", "electric", "cng"];
    if (!allowedFuels.includes(data.fuelType.toLowerCase())) {
      throw new Error("Invalid fuel type. Allowed: Petrol, Diesel, Hybrid, Electric, CNG");
    }

    // 6. Status validation
    if (data.status) {
      const allowedStatus = ["ACTIVE", "INACTIVE", "ARCHIVED"];
      if (!allowedStatus.includes(data.status.toUpperCase())) {
        throw new Error("Invalid status type. Allowed: ACTIVE, INACTIVE, ARCHIVED");
      }
    }

    // 7. Booking amount validation (if passed)
    if (data.bookingAmount !== undefined && (data.bookingAmount <= 0 || data.bookingAmount > data.price)) {
      throw new Error("Booking amount must be positive and less than the variant price");
    }

    // 8. Engine validation (if passed)
    if (data.engineSize !== undefined) {
      const sizeStr = String(data.engineSize);
      if (sizeStr.trim() === "" || sizeStr.includes("-")) {
        throw new Error("Invalid engine size format");
      }
    }

    // 9. Waiting period validation (if passed)
    if (data.waitingPeriodWeeks !== undefined && data.waitingPeriodWeeks < 0) {
      throw new Error("Waiting period cannot be negative");
    }

    return this.repo.create({
      vehicleId: data.vehicleId,
      name: data.name,
      price: data.price,
      fuelType: data.fuelType,
      transmission: data.transmission,
      seating: data.seating,
      status: data.status || "ACTIVE",
      specs: data.specs,
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
      bookingAmount?: number;
      engineSize?: string | number;
      waitingPeriodWeeks?: number;
      specs?: any;
    }
  ): Promise<Variant> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new Error("Variant not found");
    }

    const vehicleId = data.vehicleId || existing.vehicleId;

    if (data.vehicleId) {
      const vehicle = await this.vehicleRepo.findById(data.vehicleId);
      if (!vehicle) {
        throw new Error("Vehicle not found");
      }
    }

    if (data.name) {
      const existingVariants = await this.repo.findManyByVehicleId(vehicleId);
      const hasDuplicateName = existingVariants.some(
        v => v.id !== id && v.name.toLowerCase() === data.name!.toLowerCase()
      );
      if (hasDuplicateName) {
        throw new Error("Variant with this name already exists for this vehicle");
      }
    }

    if (data.price !== undefined && data.price <= 0) {
      throw new Error("Price must be a positive number");
    }

    if (data.transmission) {
      const allowedTransmissions = ["manual", "automatic", "e-drive"];
      if (!allowedTransmissions.includes(data.transmission.toLowerCase())) {
        throw new Error("Invalid transmission type. Allowed: Manual, Automatic, e-Drive");
      }
    }

    if (data.fuelType) {
      const allowedFuels = ["petrol", "diesel", "hybrid", "electric", "cng"];
      if (!allowedFuels.includes(data.fuelType.toLowerCase())) {
        throw new Error("Invalid fuel type. Allowed: Petrol, Diesel, Hybrid, Electric, CNG");
      }
    }

    if (data.status) {
      const allowedStatus = ["ACTIVE", "INACTIVE", "ARCHIVED"];
      if (!allowedStatus.includes(data.status.toUpperCase())) {
        throw new Error("Invalid status type. Allowed: ACTIVE, INACTIVE, ARCHIVED");
      }
    }

    if (data.bookingAmount !== undefined) {
      const price = data.price !== undefined ? data.price : existing.price;
      if (data.bookingAmount <= 0 || data.bookingAmount > price) {
        throw new Error("Booking amount must be positive and less than the variant price");
      }
    }

    return this.repo.update(id, {
      vehicleId: data.vehicleId,
      name: data.name,
      price: data.price,
      fuelType: data.fuelType,
      transmission: data.transmission,
      seating: data.seating,
      status: data.status,
      specs: data.specs,
    });
  }

  async deleteVariant(id: string): Promise<Variant> {
    const variant = await this.repo.findById(id);
    if (!variant) {
      throw new Error("Variant not found");
    }
    return this.repo.delete(id);
  }

  async listVariants(filters?: VariantFilters): Promise<{ data: Variant[]; total: number }> {
    return this.repo.listVariants(filters);
  }

  async listVariantsByVehicle(vehicleId: string, filters?: Omit<VariantFilters, "vehicleId">): Promise<{ data: Variant[]; total: number }> {
    return this.repo.listVariantsByVehicle(vehicleId, filters);
  }

  async searchVariants(query: string): Promise<Variant[]> {
    return this.repo.searchVariants(query);
  }

  async updateStatus(id: string, status: string): Promise<Variant> {
    const allowedStatus = ["ACTIVE", "INACTIVE", "ARCHIVED"];
    if (!allowedStatus.includes(status.toUpperCase())) {
      throw new Error("Invalid status type. Allowed: ACTIVE, INACTIVE, ARCHIVED");
    }
    const variant = await this.repo.findById(id);
    if (!variant) {
      throw new Error("Variant not found");
    }
    return this.repo.updateStatus(id, status.toUpperCase());
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Variant> {
    if (sortOrder < 0) {
      throw new Error("Sort order must be non-negative");
    }
    return this.repo.updateSortOrder(id, sortOrder);
  }

  async getVariantAndVehicleBySlug(slug: string): Promise<{ variant: Variant; vehicle: any }> {
    const variant = await this.repo.getVariantBySlug(slug);
    if (!variant) {
      throw new Error("Variant not found");
    }
    const vehicle = await this.vehicleRepo.findById(variant.vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return { variant, vehicle };
  }
}
