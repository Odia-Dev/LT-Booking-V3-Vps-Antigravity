import { Request, Response, NextFunction } from "express";

const ipRequestMap = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // Max 5 requests per minute

export function publicLeadRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "anonymous";
  const now = Date.now();

  const record = ipRequestMap.get(ip);

  if (!record || now > record.resetTime) {
    ipRequestMap.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    next();
    return;
  }

  if (record.count >= MAX_REQUESTS) {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again in a minute.",
    });
    return;
  }

  record.count += 1;
  next();
}

export function spamProtection(req: Request, res: Response, next: NextFunction): void {
  const { name, phone, email, notes, message } = req.body;

  // 1. Phone validation: should only contain digits and space/hyphen/plus
  if (phone) {
    const cleanPhone = phone.replace(/[\s\-\+]/g, "");
    if (!/^\d+$/.test(cleanPhone)) {
      res.status(400).json({ success: false, message: "Spam detected: invalid phone digits" });
      return;
    }
  }

  // 2. Spam keyword checking
  const spamKeywords = ["bitcoin", "crypto", "viagra", "casino", "free money", "lottery winner", "make money online"];
  const contentToCheck = `${name || ""} ${email || ""} ${notes || ""} ${message || ""}`.toLowerCase();

  for (const keyword of spamKeywords) {
    if (contentToCheck.includes(keyword)) {
      res.status(400).json({ success: false, message: "Request flagged as spam" });
      return;
    }
  }

  next();
}
