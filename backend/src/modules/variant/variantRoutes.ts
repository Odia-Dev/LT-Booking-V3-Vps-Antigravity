import { Router } from "express";
import { getVariants, createVariant, updateVariant, deleteVariant } from "./variantController";
import { authMiddleware } from "../../middleware/auth";

const publicRouter = Router();
publicRouter.get("/:vehicleId/variants", getVariants);

const adminRouter = Router();
adminRouter.use(authMiddleware as any);
adminRouter.post("/", createVariant);
adminRouter.put("/:id", updateVariant);
adminRouter.delete("/:id", deleteVariant);

export { publicRouter, adminRouter };
