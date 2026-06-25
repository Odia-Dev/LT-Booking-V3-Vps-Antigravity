import { Router } from "express";
import {
  getBranches,
  getBranchById,
  getBranchBySlug,
  createBranch,
  updateBranch,
  updateBranchStatus,
  deleteBranch,
} from "./branchController";
import { authMiddleware } from "../../middleware/auth";

const publicRouter = Router();
publicRouter.get("/", getBranches);
publicRouter.get("/slug/:slug", getBranchBySlug);
publicRouter.get("/:id", getBranchById);

const adminRouter = Router();
adminRouter.use(authMiddleware as any);
adminRouter.post("/", createBranch);
adminRouter.put("/:id", updateBranch);
adminRouter.patch("/:id/status", updateBranchStatus);
adminRouter.delete("/:id", deleteBranch);

export { publicRouter, adminRouter };
