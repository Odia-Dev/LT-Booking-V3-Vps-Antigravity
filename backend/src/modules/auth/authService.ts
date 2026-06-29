import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AuthRepository } from "./authRepository";
import { User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secure_jwt_secret_key_laxmi_toyota";

export class AuthService {
  private repo = new AuthRepository();



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
