import { Router } from "express";
import { getColors, createColor, updateColor, deleteColor } from "./colorController";
import { authMiddleware } from "../../middleware/auth";

const publicRouter = Router();
publicRouter.get("/:vehicleId/colors", getColors);

const adminRouter = Router();
adminRouter.use(authMiddleware as any);
adminRouter.post("/", createColor);
adminRouter.put("/:id", updateColor);
adminRouter.delete("/:id", deleteColor);

export { publicRouter, adminRouter };
