import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AuthRepository } from "./authRepository";
import { User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secure_jwt_secret_key_laxmi_toyota";

export class AuthService {
  private repo = new AuthRepository();

  async sendOtp(phone: string): Promise<string> {
    // Generate a secure 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    await this.repo.saveOtp(phone, code, expiresAt);

    // In a live system, this would call SMS APIs. Here we log to console.
    console.log(`[OTP SERVICE] Generated OTP for phone ${phone}: ${code} (Expires in 5 minutes)`);
    return code;
  }

  async verifyOtp(phone: string, code: string): Promise<{ token: string; user: User }> {
    const otpRecord = await this.repo.findOtp(phone);

    if (!otpRecord) {
      throw new Error("OTP not requested or not found");
    }

    if (new Date() > otpRecord.expiresAt) {
      await this.repo.deleteOtp(phone);
      throw new Error("OTP expired");
    }

    if (otpRecord.code !== code) {
      throw new Error("Invalid OTP code");
    }

    // Clear the OTP code after success
    await this.repo.deleteOtp(phone);

    // Retrieve or create Customer User
    let user = await this.repo.findUserByPhone(phone);
    if (!user) {
      user = await this.repo.createUser({
        phone,
        role: "CUSTOMER",
      });
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { token, user };
  }

  async adminLogin(email: string, password: string): Promise<{ token: string; user: User }> {
    let user = await this.repo.findUserByEmail(email);

    // If no admin user exists in DB yet, check env variables for fallback bootstrap
    if (!user && email === (process.env.ADMIN_EMAIL || "admin@laxmitoyota.co.in")) {
      const defaultHash = await bcrypt.hash("admin123", 10);
      const envHash = process.env.ADMIN_PASSWORD_HASH || defaultHash;
      const finalHash = envHash.startsWith("$2") ? envHash : await bcrypt.hash(envHash, 10);
      
      user = await this.repo.createUser({
        email,
        passwordHash: finalHash,
        role: "ADMIN",
        name: "Toyota Admin",
      });
    }

    if (!user || user.role !== "ADMIN" || !user.passwordHash) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    return { token, user };
  }
}
