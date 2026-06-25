import { Router } from "express";
import {
  listVariants,
  getVariantById,
  getVariantBySlug,
  getVariantsByVehicle,
  createVariant,
  updateVariant,
  updateVariantStatus,
  deleteVariant,
  getPublicVariantsByVehicleSlug,
  getPublicVariantBySlug,
} from "./variantController";
import { authMiddleware } from "../../middleware/auth";

// Mounted at /api/vehicles (and /api/public/vehicles)
const publicRouter = Router();
publicRouter.get("/:vehicleId/variants", getVariantsByVehicle);
publicRouter.get("/:slug/variants", getPublicVariantsByVehicleSlug);

// Mounted at /api/variants (and /api/public/variants)
const variantsRouter = Router();
variantsRouter.get("/", listVariants);
variantsRouter.get("/:slug", getPublicVariantBySlug);
variantsRouter.get("/id/:id", getVariantById);
variantsRouter.get("/slug/:slug", getVariantBySlug);

// Admin variants routes - mounted at /api/admin/variants or /api/variants (protected)
// Let's support both or define them under adminRouter.
const adminRouter = Router();
adminRouter.use(authMiddleware as any);
adminRouter.post("/", createVariant);
adminRouter.put("/:id", updateVariant);
adminRouter.patch("/:id/status", updateVariantStatus);
adminRouter.delete("/:id", deleteVariant);

export { publicRouter, variantsRouter, adminRouter };
