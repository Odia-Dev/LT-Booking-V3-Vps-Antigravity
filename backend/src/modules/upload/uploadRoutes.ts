import { Router, Request, Response } from "express";
import { authMiddleware, requireRole } from "../../middleware/auth";
import { imageUpload } from "../../middleware/upload";

const adminRouter = Router();

adminRouter.use(authMiddleware as any);
adminRouter.use(requireRole(["ADMIN"]) as any);

adminRouter.post("/image", imageUpload.single("file"), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "No file uploaded" });
    return;
  }

  // Construct relative URL for the frontend to use
  const fileUrl = `/uploads/images/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    url: fileUrl,
  });
});

export { adminRouter };
