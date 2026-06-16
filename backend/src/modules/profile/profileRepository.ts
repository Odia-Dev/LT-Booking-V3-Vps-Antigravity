import { prisma } from "../../config/db";
import { User } from "@prisma/client";

export class ProfileRepository {
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async updateProfile(
    id: string,
    data: { name?: string; email?: string; phone?: string; city?: string; state?: string }
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}
