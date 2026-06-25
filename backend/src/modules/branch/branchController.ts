import { Request, Response } from "express";
import { BranchService } from "./branchService";
import { createBranchSchema, updateBranchSchema, updateBranchStatusSchema } from "./branchValidation";

const service = new BranchService();

export async function getBranches(req: Request, res: Response): Promise<void> {
  try {
    const search = req.query.search as string;
    const status = req.query.status as string;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    if (page || limit) {
      const result = await service.listBranches({ search, status, page, limit });
      res.status(200).json({ success: true, ...result });
      return;
    }

    const branches = await service.searchBranches(search || "");
    res.status(200).json({ success: true, branches });
  } catch (error: any) {
    console.error("getBranches error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve branches" });
  }
}

export async function getBranchById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const branch = await service.getBranchById(id);
    res.status(200).json({ success: true, branch });
  } catch (error: any) {
    console.error("getBranchById error:", error);
    res.status(error.message === "Branch not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to retrieve branch",
    });
  }
}

export async function getBranchBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params;
    const branch = await service.getBranchBySlug(slug);
    res.status(200).json({ success: true, branch });
  } catch (error: any) {
    console.error("getBranchBySlug error:", error);
    res.status(error.message === "Branch not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to retrieve branch by slug",
    });
  }
}

export async function createBranch(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = createBranchSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const branch = await service.createBranch(parseResult.data);
    res.status(201).json({ success: true, message: "Branch created successfully", branch });
  } catch (error: any) {
    console.error("createBranch error:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to create branch" });
  }
}

export async function updateBranch(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateBranchSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const branch = await service.updateBranch(id, parseResult.data);
    res.status(200).json({ success: true, message: "Branch updated successfully", branch });
  } catch (error: any) {
    console.error("updateBranch error:", error);
    res.status(error.message === "Branch not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update branch",
    });
  }
}

export async function updateBranchStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const parseResult = updateBranchStatusSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, errors: parseResult.error.errors });
      return;
    }

    const branch = await service.updateStatus(id, parseResult.data.status);
    res.status(200).json({ success: true, message: "Branch status updated successfully", branch });
  } catch (error: any) {
    console.error("updateBranchStatus error:", error);
    res.status(error.message === "Branch not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to update status",
    });
  }
}

export async function deleteBranch(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await service.deleteBranch(id);
    res.status(200).json({ success: true, message: "Branch deleted successfully" });
  } catch (error: any) {
    console.error("deleteBranch error:", error);
    res.status(error.message === "Branch not found" ? 404 : 400).json({
      success: false,
      message: error.message || "Failed to delete branch",
    });
  }
}
