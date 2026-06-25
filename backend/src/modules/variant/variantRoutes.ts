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
} from "./variantController";
import { authMiddleware } from "../../middleware/auth";

// Mounted at /api/vehicles
const publicRouter = Router();
publicRouter.get("/:vehicleId/variants", getVariantsByVehicle);

// Mounted at /api/variants
const variantsRouter = Router();
variantsRouter.get("/", listVariants);
variantsRouter.get("/:id", getVariantById);
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
