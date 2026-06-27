import { Request, Response } from "express";
import { TestDriveService } from "./testDriveService";
import {
  createTestDriveSchema,
  updateTestDriveSchema,
  updateTestDriveStatusSchema,
  assignExecutiveSchema,
  createPublicTestDriveSchema,
} from "./testDriveValidation";
import { AuthenticatedRequest } from "../../middleware/auth";

const service = new TestDriveService();

export async function getTestDrives(req: Request, res: Response): Promise<void> {
  try {
    const adminUser = (req as AuthenticatedRequest).admin;
    let customerId = req.query.customerId as string;

    // Enforce role boundaries: customer can only query their own
    if (adminUser?.role === "CUSTOMER") {
      customerId = adminUser.id;
    }

    const branchId = req.query.branchId as string;
    const vehicleId = req.query.vehicleId as string;
    const executiveName = req.query.executiveName as string;

    if (customerId) {
      const appointments = await service.listByCustomer(customerId);
      res.status(200).json({ success: true, appointments });
      return;
    }
    
    // Customers cannot perform open listings
    if (adminUser?.role === "CUSTOMER") {
      res.status(200).json({ success: true, appointments: [] });
      return;
    }

    if (branchId && !req.query.page) {
      const appointments = await service.listByBranch(branchId);
      res.status(200).json({ success: true, appointments });
      return;
    }
    if (vehicleId) {
      const appointments = await service.listByVehicle(vehicleId);
      res.status(200).json({ success: true, appointments });
      return;
    }
    if (executiveName) {
      const appointments = await service.listByExecutive(executiveName);
      res.status(200).json({ success: true, appointments });
      return;
    }

    const filters = {
      status: req.query.status as string,
      branchId: req.query.branchId as string,
      search: req.query.search as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await service.listTestDrives(filters);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error("getTestDrives error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve test drive appointments" });
  }
}

export async function getTestDriveById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const appointment = await service.getTestDriveById(id);
    
    // Security Check: Customer can only access their own record
    const adminUser = (req as AuthenticatedRequest).admin;
    if (adminUser?.role === "CUSTOMER" && appointment.customerId !== adminUser.id) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    res.status(200).json({ success: true, appointment });
  } catch (error: any) {
    console.error("getTestDriveById error:", error);
    res.status(error.message === "Test drive appointment not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to retrieve appointment details",
    });
  }
}

export async function createTestDrive(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createTestDriveSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const appointment = await service.createTestDrive(parseResult.data);
    res.status(201).json({ success: true, message: "Test drive scheduled successfully", appointment });
  } catch (error: any) {
    console.error("createTestDrive error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to schedule test drive" });
  }
}

export async function updateTestDrive(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateTestDriveSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const appointment = await service.updateTestDrive(id, parseResult.data);
    res.status(200).json({ success: true, message: "Appointment updated successfully", appointment });
  } catch (error: any) {
    console.error("updateTestDrive error:", error);
    res.status(error.message === "Test drive appointment not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update appointment",
    });
  }
}

export async function updateTestDriveStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateTestDriveStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const appointment = await service.updateStatus(id, parseResult.data.status);
    res.status(200).json({ success: true, message: "Appointment status updated successfully", appointment });
  } catch (error: any) {
    console.error("updateTestDriveStatus error:", error);
    res.status(error.message === "Test drive appointment not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update appointment status",
    });
  }
}

export async function assignExecutive(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = assignExecutiveSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const appointment = await service.assignExecutive(id, parseResult.data.executiveName);
    res.status(200).json({ success: true, message: "Executive assigned successfully", appointment });
  } catch (error: any) {
    console.error("assignExecutive error:", error);
    res.status(error.message === "Test drive appointment not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to assign executive",
    });
  }
}

export async function cancelTestDrive(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const appointment = await service.cancelTestDrive(id);
    res.status(200).json({ success: true, message: "Test drive cancelled successfully", appointment });
  } catch (error: any) {
    console.error("cancelTestDrive error:", error);
    res.status(error.message === "Test drive appointment not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to cancel test drive appointment",
    });
  }
}

export async function createPublicTestDrive(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createPublicTestDriveSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const appointment = await service.createPublicTestDrive(parseResult.data);
    res.status(201).json({ success: true, message: "Test drive scheduled successfully", appointment });
  } catch (error: any) {
    console.error("createPublicTestDrive error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to schedule test drive" });
  }
}
