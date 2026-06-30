import { BranchRepository, BranchFilters } from "./branchRepository";
import { Branch } from "@prisma/client";

export class BranchService {
  private repo = new BranchRepository();

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-"); // Replace multiple - with single -
  }

  private validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private validatePhone(phone: string): boolean {
    // Basic phone validation: digits, spaces, hyphens, plus sign
    const re = /^[\d\s\-+]{10,20}$/;
    return re.test(phone);
  }

  async getBranchById(id: string): Promise<Branch> {
    const branch = await this.repo.getBranchById(id);
    if (!branch) {
      throw new Error("Branch not found");
    }
    return branch;
  }

  async getBranchBySlug(slug: string): Promise<Branch> {
    const branch = await this.repo.getBranchBySlug(slug);
    if (!branch) {
      throw new Error("Branch not found");
    }
    return branch;
  }

  async listBranches(filters?: BranchFilters): Promise<{ data: Branch[]; total: number }> {
    return this.repo.listBranches(filters);
  }

  async searchBranches(query: string): Promise<Branch[]> {
    return this.repo.searchBranches(query);
  }

  async createBranch(data: {
    name: string;
    slug?: string;
    code: string;
    address: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    phone: string;
    whatsapp?: string | null;
    email: string;
    googleMapsUrl: string;
    workingHours?: string;
    latitude?: number | null;
    longitude?: number | null;
    managerName?: string | null;
    managerPhone?: string | null;
    salesManager?: string | null;
    serviceManager?: string | null;
    sortOrder?: number;
    status?: string;
  }): Promise<Branch> {
    const slug = data.slug || this.slugify(data.name);

    // 1. Duplicate branch checks (code and slug unique)
    const existingBySlug = await this.repo.getBranchBySlug(slug);
    if (existingBySlug) {
      throw new Error("A branch with this name or slug already exists");
    }

    const existingByCode = await prisma.branch.findUnique({
      where: { code: data.code },
    });
    if (existingByCode) {
      throw new Error("A branch with this code already exists");
    }

    // 2. Validate email format
    if (!this.validateEmail(data.email)) {
      throw new Error("Invalid email address format");
    }

    // 3. Validate phone format
    if (!this.validatePhone(data.phone)) {
      throw new Error("Invalid phone number format");
    }

    // 4. Status validation
    if (data.status) {
      const allowedStatuses = ["ACTIVE", "INACTIVE", "ARCHIVED"];
      if (!allowedStatuses.includes(data.status)) {
        throw new Error("Invalid status type");
      }
    }

    // 5. Sort order validation
    if (data.sortOrder !== undefined && data.sortOrder < 0) {
      throw new Error("Sort order must be non-negative");
    }

    return this.repo.createBranch({
      name: data.name,
      slug,
      code: data.code,
      address: data.address,
      city: data.city,
      district: data.district,
      state: data.state,
      pincode: data.pincode,
      phone: data.phone,
      whatsapp: data.whatsapp,
      email: data.email,
      googleMapsUrl: data.googleMapsUrl,
      workingHours: data.workingHours || "9:00 AM - 7:00 PM",
      latitude: data.latitude,
      longitude: data.longitude,
      managerName: data.managerName,
      managerPhone: data.managerPhone,
      salesManager: data.salesManager,
      serviceManager: data.serviceManager,
      sortOrder: data.sortOrder || 0,
      status: data.status || "ACTIVE",
      isActive: data.status ? data.status === "ACTIVE" : true,
    });
  }

  async updateBranch(
    id: string,
    data: {
      name?: string;
      slug?: string;
      code?: string;
      address?: string;
      city?: string;
      district?: string;
      state?: string;
      pincode?: string;
      phone?: string;
      whatsapp?: string | null;
      email?: string;
      googleMapsUrl?: string;
      workingHours?: string;
      latitude?: number | null;
      longitude?: number | null;
      managerName?: string | null;
      managerPhone?: string | null;
      salesManager?: string | null;
      serviceManager?: string | null;
      sortOrder?: number;
      status?: string;
    }
  ): Promise<Branch> {
    const branch = await this.repo.getBranchById(id);
    if (!branch) {
      throw new Error("Branch not found");
    }

    let slug = data.slug;
    if (data.name && !slug) {
      slug = this.slugify(data.name);
    }

    // Duplicate slug check
    if (slug && slug !== branch.slug) {
      const existing = await this.repo.getBranchBySlug(slug);
      if (existing && existing.id !== id) {
        throw new Error("A branch with this name or slug already exists");
      }
    }

    // Duplicate code check
    if (data.code && data.code !== branch.code) {
      const existing = await prisma.branch.findUnique({
        where: { code: data.code },
      });
      if (existing && existing.id !== id) {
        throw new Error("A branch with this code already exists");
      }
    }

    // Validate email
    if (data.email && !this.validateEmail(data.email)) {
      throw new Error("Invalid email address format");
    }

    // Validate phone
    if (data.phone && !this.validatePhone(data.phone)) {
      throw new Error("Invalid phone number format");
    }

    // Status validation
    if (data.status) {
      const allowedStatuses = ["ACTIVE", "INACTIVE", "ARCHIVED"];
      if (!allowedStatuses.includes(data.status)) {
        throw new Error("Invalid status type");
      }
    }

    // Sort order validation
    if (data.sortOrder !== undefined && data.sortOrder < 0) {
      throw new Error("Sort order must be non-negative");
    }

    return this.repo.updateBranch(id, {
      ...data,
      slug: slug || undefined,
      isActive: data.status ? data.status === "ACTIVE" : undefined,
    });
  }

  async deleteBranch(id: string): Promise<Branch> {
    const branch = await this.repo.getBranchById(id);
    if (!branch) {
      throw new Error("Branch not found");
    }
    return this.repo.deleteBranch(id);
  }

  async updateStatus(id: string, status: string): Promise<Branch> {
    const allowedStatuses = ["ACTIVE", "INACTIVE", "ARCHIVED"];
    if (!allowedStatuses.includes(status)) {
      throw new Error("Invalid status type");
    }
    const branch = await this.repo.getBranchById(id);
    if (!branch) {
      throw new Error("Branch not found");
    }
    return this.repo.updateStatus(id, status);
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<Branch> {
    if (sortOrder < 0) {
      throw new Error("Sort order must be non-negative");
    }
    const branch = await this.repo.getBranchById(id);
    if (!branch) {
      throw new Error("Branch not found");
    }
    return this.repo.updateSortOrder(id, sortOrder);
  }

  async getPublicBranches(): Promise<Branch[]> {
    return this.repo.findManyPublic();
  }

  async getPublicBranchBySlug(slug: string): Promise<Branch> {
    const branch = await this.repo.findBySlugPublic(slug);
    if (!branch) {
      throw new Error("Branch not found");
    }
    return branch;
  }
}

// Importing prisma for standalone duplicate checks
import { prisma } from "../../config/db";
