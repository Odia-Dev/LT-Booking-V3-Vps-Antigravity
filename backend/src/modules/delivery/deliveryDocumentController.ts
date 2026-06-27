import { Response } from "express";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { prisma } from "../../config/db";
import { AuthenticatedRequest } from "../../middleware/auth";

// Allowed document type enum
const ALLOWED_DOC_TYPES = [
  "INVOICE",
  "INSURANCE",
  "RC_RECEIPT",
  "CHECKLIST_PDF",
  "DELIVERY_PHOTO",
  "OTHER",
] as const;

const DocumentTypeSchema = z.enum(ALLOWED_DOC_TYPES);

// ─────────────────────────────────────────────
// RBAC helper — admins & executives can upload; customers read-only
// ─────────────────────────────────────────────
function canUpload(role: string): boolean {
  return role === "ADMIN" || role === "SALES_EXECUTIVE" || role === "EXECUTIVE";
}

function hasDeliveryAccess(role: string, delivery: any, userId: string, userEmail?: string | null): boolean {
  if (role === "ADMIN") return true;
  if (role === "SALES_EXECUTIVE" || role === "EXECUTIVE") {
    const byId = delivery.assignedExecutive === userId;
    const byEmail =
      !!userEmail &&
      !!delivery.assignedExecutive &&
      delivery.assignedExecutive.toLowerCase() === userEmail.toLowerCase();
    return byId || byEmail;
  }
  if (role === "CUSTOMER") return delivery.customerId === userId;
  return false;
}

// ─────────────────────────────────────────────
// POST /api/deliveries/:id/documents
// Upload one or more delivery documents
// ─────────────────────────────────────────────
export async function uploadDeliveryDocuments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!canUpload(req.admin.role)) {
      res.status(403).json({ success: false, message: "Forbidden: Only Admins and Executives can upload documents" });
      return;
    }

    const delivery = await prisma.delivery.findUnique({ where: { id: req.params.id } });
    if (!delivery) {
      res.status(404).json({ success: false, message: "Delivery record not found" });
      return;
    }

    if (!hasDeliveryAccess(req.admin.role, delivery, req.admin.id, req.admin.email)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied to this delivery" });
      return;
    }

    // Validate documentType from body
    const parsed = DocumentTypeSchema.safeParse(req.body.documentType);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: `Invalid documentType. Must be one of: ${ALLOWED_DOC_TYPES.join(", ")}`,
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: "No files were uploaded" });
      return;
    }

    const notes: string | undefined = req.body.notes || undefined;
    const uploader = req.admin.email || req.admin.id;

    // Persist each file's metadata to DB
    const created = await Promise.all(
      files.map((file) => {
        const relativePath = path
          .relative(process.cwd(), file.path)
          .replace(/\\/g, "/");
        return prisma.deliveryDocument.create({
          data: {
            deliveryId: delivery.id,
            bookingId: delivery.bookingId,
            uploadedBy: uploader,
            documentType: parsed.data,
            fileName: file.originalname,
            storedName: file.filename,
            filePath: relativePath,
            mimeType: file.mimetype,
            fileSize: file.size,
            notes: notes || null,
          },
        });
      })
    );

    res.status(201).json({
      success: true,
      message: `${created.length} document(s) uploaded successfully`,
      data: created,
    });
  } catch (error: any) {
    console.error("uploadDeliveryDocuments error:", error);
    res.status(500).json({ success: false, message: error.message || "Upload failed" });
  }
}

// ─────────────────────────────────────────────
// GET /api/deliveries/:id/documents
// List all documents for a delivery
// ─────────────────────────────────────────────
export async function getDeliveryDocuments(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const delivery = await prisma.delivery.findUnique({ where: { id: req.params.id } });
    if (!delivery) {
      res.status(404).json({ success: false, message: "Delivery record not found" });
      return;
    }

    if (!hasDeliveryAccess(req.admin.role, delivery, req.admin.id, req.admin.email)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    // Optional documentType filter
    const typeFilter = req.query.type as string | undefined;
    const where: any = { deliveryId: req.params.id };
    if (typeFilter && ALLOWED_DOC_TYPES.includes(typeFilter as any)) {
      where.documentType = typeFilter;
    }

    const documents = await prisma.deliveryDocument.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: documents });
  } catch (error: any) {
    console.error("getDeliveryDocuments error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve documents" });
  }
}

// ─────────────────────────────────────────────
// DELETE /api/deliveries/:id/documents/:docId
// Delete a specific document record + disk file
// ─────────────────────────────────────────────
export async function deleteDeliveryDocument(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!canUpload(req.admin.role)) {
      res.status(403).json({ success: false, message: "Forbidden: Only Admins and Executives can delete documents" });
      return;
    }

    const delivery = await prisma.delivery.findUnique({ where: { id: req.params.id } });
    if (!delivery) {
      res.status(404).json({ success: false, message: "Delivery record not found" });
      return;
    }

    if (!hasDeliveryAccess(req.admin.role, delivery, req.admin.id, req.admin.email)) {
      res.status(403).json({ success: false, message: "Forbidden: Access denied" });
      return;
    }

    const doc = await prisma.deliveryDocument.findUnique({
      where: { id: req.params.docId },
    });
    if (!doc || doc.deliveryId !== req.params.id) {
      res.status(404).json({ success: false, message: "Document not found" });
      return;
    }

    // Remove disk file
    const absolutePath = path.join(process.cwd(), doc.filePath);
    try {
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (fsErr) {
      console.warn("[deleteDeliveryDocument] Could not remove disk file:", fsErr);
    }

    await prisma.deliveryDocument.delete({ where: { id: doc.id } });

    res.status(200).json({ success: true, message: "Document deleted successfully" });
  } catch (error: any) {
    console.error("deleteDeliveryDocument error:", error);
    res.status(500).json({ success: false, message: "Failed to delete document" });
  }
}
