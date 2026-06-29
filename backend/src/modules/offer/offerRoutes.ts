import { Router } from "express";
import { authMiddleware, requireRole } from "../../middleware/auth";
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from "./offerController";

const publicRouter = Router();
publicRouter.get("/", getOffers);

const adminRouter = Router();
adminRouter.use(authMiddleware as any);
adminRouter.use(requireRole(["ADMIN"]) as any);

adminRouter.get("/", getOffers);
adminRouter.post("/", createOffer);
adminRouter.put("/:id", updateOffer);
adminRouter.delete("/:id", deleteOffer);

export { publicRouter, adminRouter };
