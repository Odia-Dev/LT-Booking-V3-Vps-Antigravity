import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Allowed MIME types for delivery documents
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Max 10MB per file
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

// Disk storage: files go into uploads/delivery/<deliveryId>/
const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    const deliveryId = req.params.id || "unknown";
    const dir = path.join(process.cwd(), "uploads", "delivery", deliveryId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, safeName);
  },
});

// File type filter: reject unsupported formats
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, JPEG, PNG, WEBP.`));
  }
};

export const deliveryUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: 5 },
});
