import { Request, Response } from "express";
import { FinanceService } from "./financeService";
import {
  createFinanceSchema,
  updateFinanceSchema,
  updateFinanceStatusSchema,
} from "./financeValidation";
import { AuthenticatedRequest } from "../../middleware/auth";

const service = new FinanceService();

export async function getFinanceApplications(req: Request, res: Response): Promise<void> {
  try {
    const adminUser = (req as AuthenticatedRequest).admin;
    
    // RBAC: Customer: Own Applications Only
    if (adminUser?.role === "CUSTOMER") {
      const filters = { customerId: adminUser.id };
      const result = await service.listApplications(filters);
      res.status(200).json({ success: true, ...result });
      return;
    }

    // RBAC: Finance Executive: Assigned Applications
    // If the role is explicitly "FINANCE_EXECUTIVE", filter by their name or ID.
    // Assuming we use assignedExecutive field to track assignments.
    let assignedExecutive = req.query.assignedExecutive as string | undefined;
    if (adminUser?.role === "FINANCE_EXECUTIVE") {
      assignedExecutive = adminUser.id;
    }

    const filters = {
      status: req.query.status as string,
      branchId: req.query.branchId as string,
      assignedExecutive: assignedExecutive,
      bankName: req.query.bankName as string,
      search: req.query.search as string,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await service.listApplications(filters);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error("getFinanceApplications error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve finance applications" });
  }
}

export async function getFinanceApplicationById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const application = await service.getApplication(id);

    if (!application) {
      res.status(404).json({ success: false, message: "Finance application not found" });
      return;
    }
    
    // RBAC Security Check
    const adminUser = (req as AuthenticatedRequest).admin;
    if (adminUser?.role === "CUSTOMER" && application.customerId !== adminUser.id) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }
    if (adminUser?.role === "FINANCE_EXECUTIVE" && application.assignedExecutive !== adminUser.id) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    res.status(200).json({ success: true, application });
  } catch (error: any) {
    console.error("getFinanceApplicationById error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve application details",
    });
  }
}

export async function createFinanceApplication(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createFinanceSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const application = await service.createApplication(parseResult.data);
    res.status(201).json({ success: true, message: "Finance application created successfully", application });
  } catch (error: any) {
    console.error("createFinanceApplication error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to create finance application" });
  }
}

export async function updateFinanceApplication(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateFinanceSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const adminUser = (req as AuthenticatedRequest).admin;
    const performedBy = adminUser?.id || "SYSTEM";

    const existingApplication = await service.getApplication(id);
    if (!existingApplication) {
      res.status(404).json({ success: false, message: "Application not found" });
      return;
    }

    if (adminUser?.role === "CUSTOMER") {
      res.status(403).json({ success: false, message: "Customers cannot update finance applications" });
      return;
    }

    if (adminUser?.role === "FINANCE_EXECUTIVE" && existingApplication.assignedExecutive !== adminUser.id) {
      res.status(403).json({ success: false, message: "Access denied. Not assigned to this application." });
      return;
    }

    const application = await service.updateApplication(id, parseResult.data, performedBy);
    res.status(200).json({ success: true, message: "Finance application updated successfully", application });
  } catch (error: any) {
    console.error("updateFinanceApplication error:", error);
    res.status(error.message === "Application not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update finance application",
    });
  }
}

export async function updateFinanceStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateFinanceStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const adminUser = (req as AuthenticatedRequest).admin;
    const performedBy = adminUser?.id || "SYSTEM";

    const existingApplication = await service.getApplication(id);
    if (!existingApplication) {
      res.status(404).json({ success: false, message: "Application not found" });
      return;
    }

    if (adminUser?.role === "CUSTOMER") {
      res.status(403).json({ success: false, message: "Customers cannot update finance status" });
      return;
    }

    if (adminUser?.role === "FINANCE_EXECUTIVE" && existingApplication.assignedExecutive !== adminUser.id) {
      res.status(403).json({ success: false, message: "Access denied. Not assigned to this application." });
      return;
    }

    const application = await service.updateApplication(id, { status: parseResult.data.status }, performedBy);
    res.status(200).json({ success: true, message: "Finance application status updated successfully", application });
  } catch (error: any) {
    console.error("updateFinanceStatus error:", error);
    res.status(error.message === "Application not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update finance application status",
    });
  }
}

export async function deleteFinanceApplication(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const adminUser = (req as AuthenticatedRequest).admin;
    
    if (adminUser?.role !== "ADMIN") {
      res.status(403).json({ success: false, message: "Access denied. Admins only." });
      return;
    }

    const application = await service.deleteApplication(id);
    res.status(200).json({ success: true, message: "Finance application deleted successfully", application });
  } catch (error: any) {
    console.error("deleteFinanceApplication error:", error);
    res.status(error.message === "Application not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to delete finance application",
    });
  }
}
