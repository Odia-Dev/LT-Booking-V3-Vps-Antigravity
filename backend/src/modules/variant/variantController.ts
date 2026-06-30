import { Request, Response } from "express";
import { VariantService } from "./variantService";
import { createVariantSchema, updateVariantSchema, updateVariantStatusSchema } from "./variantValidation";
import { prisma } from "../../config/db";

const service = new VariantService();

export async function bulkUpdateStatus(req: Request, res: Response): Promise<void> {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || !status) {
      res.status(400).json({ success: false, message: "Invalid payload. 'ids' (array) and 'status' are required." });
      return;
    }
    const allowedStatus = ["ACTIVE", "INACTIVE", "ARCHIVED"];
    if (!allowedStatus.includes(status.toUpperCase())) {
      res.status(400).json({ success: false, message: "Invalid status type. Allowed: ACTIVE, INACTIVE, ARCHIVED" });
      return;
    }

    await prisma.variant.updateMany({
      where: { id: { in: ids } },
      data: { status: status.toUpperCase(), isActive: status.toUpperCase() === "ACTIVE" },
    });

    res.status(200).json({ success: true, message: `Successfully updated status to ${status} for ${ids.length} variants.` });
  } catch (error: any) {
    console.error("bulkUpdateStatus error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to bulk update status" });
  }
}


export async function listVariants(req: Request, res: Response): Promise<void> {
  try {
    const { search, fuelType, transmission, status, vehicleId, minPrice, maxPrice, page, limit } = req.query;

    const filters = {
      search: search ? String(search) : undefined,
      fuelType: fuelType ? String(fuelType) : undefined,
      transmission: transmission ? String(transmission) : undefined,
      status: status ? String(status) : undefined,
      vehicleId: vehicleId ? String(vehicleId) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await service.listVariants(filters);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error("listVariants error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve variants" });
  }
}

export async function getVariantById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const variant = await service.getVariantById(id);
    res.status(200).json({ success: true, variant });
  } catch (error: any) {
    console.error("getVariantById error:", error);
    res.status(error.message === "Variant not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to retrieve variant",
    });
  }
}

export async function getVariantBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const variant = await service.getVariantBySlug(slug);
    res.status(200).json({ success: true, variant });
  } catch (error: any) {
    console.error("getVariantBySlug error:", error);
    res.status(error.message === "Variant not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to retrieve variant",
    });
  }
}

export async function getVariantsByVehicle(req: Request, res: Response): Promise<void> {
  try {
    const { vehicleId } = req.params;
    const { search, fuelType, transmission, status, minPrice, maxPrice, page, limit } = req.query;

    const filters = {
      search: search ? String(search) : undefined,
      fuelType: fuelType ? String(fuelType) : undefined,
      transmission: transmission ? String(transmission) : undefined,
      status: status ? String(status) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    };

    const result = await service.listVariantsByVehicle(vehicleId, filters);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error("getVariantsByVehicle error:", error);
    res.status(error.message === "Vehicle not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to retrieve vehicle variants",
    });
  }
}

export async function createVariant(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createVariantSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const variant = await service.createVariant(parseResult.data);
    res.status(201).json({ success: true, message: "Variant created successfully", variant });
  } catch (error: any) {
    console.error("createVariant error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to create variant" });
  }
}

export async function updateVariant(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateVariantSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const variant = await service.updateVariant(id, parseResult.data);
    res.status(200).json({ success: true, message: "Variant updated successfully", variant });
  } catch (error: any) {
    console.error("updateVariant error:", error);
    res.status(error.message === "Variant not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update variant",
    });
  }
}

export async function updateVariantStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateVariantStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const variant = await service.updateStatus(id, parseResult.data.status);
    res.status(200).json({ success: true, message: "Variant status updated successfully", variant });
  } catch (error: any) {
    console.error("updateVariantStatus error:", error);
    res.status(error.message === "Variant not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update variant status",
    });
  }
}

export async function deleteVariant(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await service.deleteVariant(id);
    res.status(200).json({ success: true, message: "Variant deleted successfully" });
  } catch (error: any) {
    console.error("deleteVariant error:", error);
    res.status(error.message === "Variant not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to delete variant",
    });
  }
}

export async function getPublicVariantsByVehicleSlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const vehicleRepo = new (require("../vehicle/vehicleRepository").VehicleRepository)();
    const vehicle = await vehicleRepo.findBySlug(slug);
    if (!vehicle) {
      res.status(404).json({ success: false, message: "Vehicle not found" });
      return;
    }
    const result = await service.listVariants({ vehicleId: vehicle.id, limit: 100 });
    res.status(200).json({
      success: true,
      vehicle,
      variants: result.data,
    });
  } catch (error: any) {
    console.error("getPublicVariantsByVehicleSlug error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to retrieve public variants" });
  }
}

export async function getPublicVariantBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const { variant, vehicle } = await service.getVariantAndVehicleBySlug(slug);

    // Compute canonical URL and SEO Metadata
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const canonicalUrl = `${frontendUrl}/vehicles/${vehicle.slug}/${slug}`;
    const seoTitle = `${vehicle.name} ${variant.name} - Features & Specifications | Laxmi Toyota`;
    const seoDescription = `Explore ex-showroom price, booking details, features and full technical specifications for the new ${vehicle.name} ${variant.name} variant at Laxmi Toyota.`;

    const openGraph = {
      title: seoTitle,
      description: seoDescription,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: vehicle.heroImage || "",
          alt: `${vehicle.name} ${variant.name}`,
        }
      ]
    };

    // Construct structured JSON-LD Schema
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Car",
      "name": `${vehicle.name} ${variant.name}`,
      "description": seoDescription,
      "image": vehicle.heroImage || "",
      "brand": {
        "@type": "Brand",
        "name": "Toyota"
      },
      "offers": {
        "@type": "Offer",
        "price": variant.price,
        "priceCurrency": "INR",
        "url": canonicalUrl,
        "availability": variant.status === "ACTIVE" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
      },
      "vehicleEngine": {
        "@type": "EngineSpecification",
        "fuelType": variant.fuelType
      }
    };

    res.status(200).json({
      success: true,
      vehicle,
      variant,
      features: variant.specs || {},
      specifications: variant.specs || {},
      seo: {
        title: seoTitle,
        description: seoDescription,
        canonical: canonicalUrl,
        openGraph,
        jsonLd
      }
    });
  } catch (error: any) {
    console.error("getPublicVariantBySlug error:", error);
    res.status(error.message === "Variant not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to retrieve public variant details",
    });
  }
}
