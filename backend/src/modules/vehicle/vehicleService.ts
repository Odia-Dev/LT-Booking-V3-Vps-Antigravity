import { VehicleRepository } from "./vehicleRepository";
import { Vehicle } from "@prisma/client";

export class VehicleService {
  private repo = new VehicleRepository();

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-"); // Replace multiple - with single -
  }

  async getVehicles(filters?: { category?: string; search?: string }): Promise<Vehicle[]> {
    return this.repo.findMany(filters);
  }

  async getVehicleBySlug(slug: string): Promise<Vehicle> {
    const vehicle = await this.repo.findBySlug(slug);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return vehicle;
  }

  async createVehicle(data: {
    name: string;
    slug?: string;
    category: string;
    description?: string;
    heroImage?: string;
    status?: string;
    seoTitle?: string;
    seoDescription?: string;
  }): Promise<Vehicle> {
    const slug = data.slug || this.slugify(data.name);

    // Check for unique slug conflict
    const existing = await this.repo.findBySlug(slug);
    if (existing) {
      throw new Error("A vehicle with this name or slug already exists");
    }

    return this.repo.create({
      ...data,
      slug,
    });
  }

  async updateVehicle(
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
    const vehicle = await this.repo.findById(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    let slug = data.slug;
    if (data.name && !slug) {
      slug = this.slugify(data.name);
    }

    if (slug && slug !== vehicle.slug) {
      const existing = await this.repo.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new Error("A vehicle with this name or slug already exists");
      }
    }

    return this.repo.update(id, {
      ...data,
      slug: slug || undefined,
    });
  }

  async deleteVehicle(id: string): Promise<Vehicle> {
    const vehicle = await this.repo.findById(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return this.repo.delete(id);
  }
}
