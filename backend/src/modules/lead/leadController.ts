import { Request, Response } from "express";
import { LeadService } from "./leadService";
import { createLeadSchema, updateLeadSchema, updateLeadStatusSchema, assignLeadSchema } from "./leadValidation";

const service = new LeadService();

export async function getLeads(req: Request, res: Response): Promise<void> {
  try {
    const filters: any = {
      status: req.query.status as string,
      source: req.query.source as string,
      type: req.query.type as string,
      branchId: req.query.branchId as string,
      variantId: req.query.variantId as string,
      search: req.query.search as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const result = await service.listLeads(filters);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error("getLeads error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve leads" });
  }
}

export async function getLeadById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const lead = await service.getLeadById(id);
    res.status(200).json({ success: true, lead });
  } catch (error: any) {
    console.error("getLeadById error:", error);
    res.status(error.message === "Lead not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to retrieve lead",
    });
  }
}

export async function createLead(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createLeadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const lead = await service.createLead(parseResult.data);
    res.status(201).json({ success: true, message: "Lead created successfully", lead });
  } catch (error: any) {
    console.error("createLead error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to create lead" });
  }
}

export async function updateLead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateLeadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const lead = await service.updateLead(id, parseResult.data);
    res.status(200).json({ success: true, message: "Lead updated successfully", lead });
  } catch (error: any) {
    console.error("updateLead error:", error);
    res.status(error.message === "Lead not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update lead",
    });
  }
}

export async function updateLeadStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateLeadStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const lead = await service.updateLeadStatus(id, parseResult.data.status);
    res.status(200).json({ success: true, message: "Lead status updated successfully", lead });
  } catch (error: any) {
    console.error("updateLeadStatus error:", error);
    res.status(error.message === "Lead not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update lead status",
    });
  }
}

export async function assignLead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = assignLeadSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const lead = await service.assignLead(id, parseResult.data.executiveName);
    res.status(200).json({ success: true, message: "Lead assigned successfully", lead });
  } catch (error: any) {
    console.error("assignLead error:", error);
    res.status(error.message === "Lead not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to assign lead",
    });
  }
}

export async function deleteLead(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await service.deleteLead(id);
    res.status(200).json({ success: true, message: "Lead deleted successfully" });
  } catch (error: any) {
    console.error("deleteLead error:", error);
    res.status(error.message === "Lead not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to delete lead",
    });
  }
}
