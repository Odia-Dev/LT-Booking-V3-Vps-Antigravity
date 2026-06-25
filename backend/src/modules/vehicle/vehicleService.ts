import { VehicleRepository, VehicleFilters } from "./vehicleRepository";
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

  async listVehicles(filters?: VehicleFilters): Promise<{ data: Vehicle[]; total: number }> {
    return this.repo.listVehicles(filters);
  }

  async getVehicleById(id: string): Promise<Vehicle> {
    const vehicle = await this.repo.findById(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return vehicle;
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
    sortOrder?: number;
    startingPrice?: number;
    bookingAmount?: number;
    thumbnail?: string;
    gallery?: string[];
    brochure?: string;
    youtubeUrl?: string;
  }): Promise<Vehicle> {
    const slug = data.slug || this.slugify(data.name);

    // 1. Duplicate vehicle check & slug conflict prevention
    const existing = await this.repo.findBySlug(slug);
    if (existing) {
      throw new Error("A vehicle with this name or slug already exists");
    }

    // 2. Category validation
    const allowedCategories = ["SUV", "MPV", "Hatchback", "Sedan"];
    if (!allowedCategories.includes(data.category)) {
      throw new Error("Invalid vehicle category. Allowed categories: SUV, MPV, Hatchback, Sedan");
    }

    // 3. Status validation
    if (data.status) {
      const allowedStatuses = ["ACTIVE", "INACTIVE", "ARCHIVED", "UPCOMING"];
      if (!allowedStatuses.includes(data.status)) {
        throw new Error("Invalid status type");
      }
    }

    // 4. Default SEO metadata fallback
    const seoTitle = data.seoTitle || `${data.name} - Toyota Model Specs & Booking | Laxmi Toyota`;
    const seoDescription = data.seoDescription || `Discover the all-new ${data.name} specifications, features, and official test drive booking details at Laxmi Toyota.`;

    // 5. Price & Booking validation
    if (data.startingPrice !== undefined && data.startingPrice < 0) {
      throw new Error("Starting price cannot be negative");
    }
    if (data.bookingAmount !== undefined && data.bookingAmount < 0) {
      throw new Error("Booking deposit amount cannot be negative");
    }

    return this.repo.create({
      name: data.name,
      slug,
      category: data.category,
      description: data.description,
      startingPrice: data.startingPrice,
      bookingAmount: data.bookingAmount,
      heroImage: data.heroImage,
      thumbnail: data.thumbnail,
      gallery: data.gallery,
      brochure: data.brochure,
      youtubeUrl: data.youtubeUrl,
      status: data.status || "ACTIVE",
      seoTitle,
      seoDescription,
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
      sortOrder?: number;
      startingPrice?: number;
      bookingAmount?: number;
      thumbnail?: string;
      gallery?: string[];
      brochure?: string;
      youtubeUrl?: string;
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

    if (data.category) {
      const allowedCategories = ["SUV", "MPV", "Hatchback", "Sedan"];
      if (!allowedCategories.includes(data.category)) {
        throw new Error("Invalid vehicle category. Allowed categories: SUV, MPV, Hatchback, Sedan");
      }
    }

    if (data.status) {
      const allowedStatuses = ["ACTIVE", "INACTIVE", "ARCHIVED", "UPCOMING"];
      if (!allowedStatuses.includes(data.status)) {
        throw new Error("Invalid status type");
      }
    }

    if (data.startingPrice !== undefined && data.startingPrice < 0) {
      throw new Error("Starting price cannot be negative");
    }
    if (data.bookingAmount !== undefined && data.bookingAmount < 0) {
      throw new Error("Booking deposit amount cannot be negative");
    }

    return this.repo.update(id, {
      name: data.name,
      slug: slug || undefined,
      category: data.category,
      description: data.description,
      startingPrice: data.startingPrice,
      bookingAmount: data.bookingAmount,
      heroImage: data.heroImage,
      thumbnail: data.thumbnail,
      gallery: data.gallery,
      brochure: data.brochure,
      youtubeUrl: data.youtubeUrl,
      status: data.status,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    });
  }

  async deleteVehicle(id: string): Promise<Vehicle> {
    const vehicle = await this.repo.findById(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return this.repo.delete(id);
  }

  async searchVehicles(query: string): Promise<Vehicle[]> {
    return this.repo.searchVehicles(query);
  }

  async updateStatus(id: string, status: string): Promise<Vehicle> {
    const allowedStatuses = ["ACTIVE", "INACTIVE", "ARCHIVED", "UPCOMING"];
    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid status type");
    }
    const vehicle = await this.repo.findById(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return this.repo.updateStatus(id, status);
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Vehicle> {
    if (sortOrder < 0) {
      throw new Error("Sort order must be non-negative");
    }
    const vehicle = await this.repo.findById(id);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return this.repo.updateSortOrder(id, sortOrder);
  }

  async getPublicVehicles(filters?: { category?: string; search?: string }): Promise<Vehicle[]> {
    return this.repo.findManyPublic(filters);
  }

  async getPublicVehicleBySlug(slug: string): Promise<any> {
    const vehicle = await this.repo.findBySlugPublic(slug);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
    return vehicle;
  }
}
