import { prisma } from "../../config/db";
import { User } from "@prisma/client";
import { mockUsers, offlineState } from "../../config/mockDb";

export class AuthRepository {
  private async runWithFallback<T>(dbOp: () => Promise<T>, fallbackOp: () => Promise<T>): Promise<T> {
    if (process.env.NODE_ENV === "production") {
      return dbOp();
    }
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
          address: null,
          preferredBranchId: null,
          communicationPreferences: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          verificationToken: null,
          resetPasswordToken: null,
          isVerified: false,
          verificationTokenExpires: null,
          resetPasswordExpires: null,

        };
        mockUsers.push(newUser);
        return newUser;
      }
    );
  }

}
