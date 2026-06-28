import { Router } from "express";
import { 
  addInventoryStock, 
  getInventory, 
  getInventoryAlerts, 
  updateInventoryStatus, 
  getPublicInventoryStatus 
} from "./inventoryController";
import { authMiddleware, requireRole } from "../../middleware/auth";

const router = Router();

// Public Frontend Route
router.get("/public/inventory/status", getPublicInventoryStatus);

// Admin Routes
router.get("/admin/inventory", authMiddleware, requireRole(["ADMIN", "EXECUTIVE"]), getInventory);
router.post("/admin/inventory", authMiddleware, requireRole(["ADMIN"]), addInventoryStock);
router.get("/admin/inventory/alerts", authMiddleware, requireRole(["ADMIN", "EXECUTIVE"]), getInventoryAlerts);
router.patch("/admin/inventory/:id", authMiddleware, requireRole(["ADMIN", "EXECUTIVE"]), updateInventoryStatus);

export default router;
