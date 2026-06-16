import { prisma } from "../../config/db";
import { User } from "@prisma/client";
import { mockUsers, offlineState } from "../../config/mockDb";

export class ProfileRepository {
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
        console.warn("⚠️ Database unreachable. Falling back to In-Memory Offline Mode for profile operations.");
        offlineState.isOfflineMode = true;
        return fallbackOp();
      }
      throw error;
    }
  }

  async findUserById(id: string): Promise<User | null> {
    return this.runWithFallback(
      () => prisma.user.findUnique({ where: { id } }),
      async () => mockUsers.find((u) => u.id === id) || null
    );
  }

  async updateProfile(
    id: string,
    data: { name?: string; email?: string; phone?: string; city?: string; state?: string }
  ): Promise<User> {
    return this.runWithFallback(
      () => prisma.user.update({
        where: { id },
        data,
      }),
      async () => {
        const user = mockUsers.find((u) => u.id === id);
        if (!user) {
          throw new Error("User not found");
        }
        if (data.name !== undefined) user.name = data.name;
        if (data.email !== undefined) user.email = data.email;
        if (data.phone !== undefined) user.phone = data.phone;
        if (data.city !== undefined) user.city = data.city;
        if (data.state !== undefined) user.state = data.state;
        user.updatedAt = new Date();
        return user;
      }
    );
  }
}
