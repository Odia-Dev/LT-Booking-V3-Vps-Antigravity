import { Router } from "express";
import {
  getVehicles,
  getVehicleById,
  getVehicleBySlug,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle,
} from "./vehicleController";
import { authMiddleware } from "../../middleware/auth";

const publicRouter = Router();
publicRouter.get("/", getVehicles);
publicRouter.get("/slug/:slug", getVehicleBySlug);
publicRouter.get("/:id", getVehicleById);

const adminRouter = Router();
adminRouter.use(authMiddleware as any);
adminRouter.post("/", createVehicle);
adminRouter.put("/:id", updateVehicle);
adminRouter.patch("/:id/status", updateVehicleStatus);
adminRouter.delete("/:id", deleteVehicle);

export { publicRouter, adminRouter };
