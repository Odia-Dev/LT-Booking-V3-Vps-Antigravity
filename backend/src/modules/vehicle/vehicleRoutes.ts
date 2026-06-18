import { Router } from "express";
import { getVehicles, getVehicleBySlug, createVehicle, updateVehicle, deleteVehicle } from "./vehicleController";
import { authMiddleware } from "../../middleware/auth";

const publicRouter = Router();
publicRouter.get("/", getVehicles);
publicRouter.get("/:slug", getVehicleBySlug);

const adminRouter = Router();
adminRouter.use(authMiddleware as any);
adminRouter.post("/", createVehicle);
adminRouter.put("/:id", updateVehicle);
adminRouter.delete("/:id", deleteVehicle);

export { publicRouter, adminRouter };
