import { prisma } from "../../config/db";
import { User, OtpVerification } from "@prisma/client";
import { mockUsers, mockOtps, offlineState } from "../../config/mockDb";

export class AuthRepository {
  private async runWithFallback<T>(dbOp: () => Promise<T>, fallbackOp: () => Promise<T>): Promise<T> {
    if (offlineState.isOfflineMode) {
      return fallbackOp();
    }
    try {
      return await dbOp();
    } catch (error: any) {
      const errMsg = error.message || "";
      if (
        errMsg.includes("Can't reach database") ||
        errMsg.includes("is not running") ||
        errMsg.includes("connect ECONNREFUSED") ||
        error.code === "P1001"
      ) {
        console.warn("⚠️ Database unreachable. Falling back to In-Memory Offline Mode for development.");
        offlineState.isOfflineMode = true;
        return fallbackOp();
      }
      throw error;
    }
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return this.runWithFallback(
      () => prisma.user.findFirst({ where: { phone } }),
      async () => mockUsers.find((u) => u.phone === phone) || null
    );
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.runWithFallback(
      () => prisma.user.findUnique({ where: { email } }),
      async () => mockUsers.find((u) => u.email === email) || null
    );
  }

  async createUser(data: { phone?: string; email?: string; name?: string; role: string; passwordHash?: string }): Promise<User> {
    return this.runWithFallback(
      () => prisma.user.create({ data }),
      async () => {
        const newUser: User = {
          id: Math.random().toString(),
          email: data.email || null,
          phone: data.phone || null,
          passwordHash: data.passwordHash || null,
          name: data.name || null,
          city: null,
          state: null,
          role: data.role || "CUSTOMER",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockUsers.push(newUser);
        return newUser;
      }
    );
  }

  async findOtp(phone: string): Promise<OtpVerification | null> {
    return this.runWithFallback(
      () => prisma.otpVerification.findUnique({ where: { phone } }),
      async () => mockOtps.find((o) => o.phone === phone) || null
    );
  }

  async saveOtp(phone: string, code: string, expiresAt: Date): Promise<OtpVerification> {
    return this.runWithFallback(
      () => prisma.otpVerification.upsert({
        where: { phone },
        update: { code, expiresAt },
        create: { phone, code, expiresAt }
      }),
      async () => {
        const existing = mockOtps.find((o) => o.phone === phone);
        if (existing) {
          existing.code = code;
          existing.expiresAt = expiresAt;
          existing.updatedAt = new Date();
          return existing;
        }
        const newOtp: OtpVerification = {
          id: Math.random().toString(),
          phone,
          code,
          expiresAt,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockOtps.push(newOtp);
        return newOtp;
      }
    );
  }

  async deleteOtp(phone: string): Promise<void> {
    return this.runWithFallback(
      async () => {
        await prisma.otpVerification.delete({ where: { phone } }).catch(() => {});
      },
      async () => {
        const index = mockOtps.findIndex((o) => o.phone === phone);
        if (index !== -1) {
          mockOtps.splice(index, 1);
        }
      }
    );
  }
}
