import { ProfileRepository } from "./profileRepository";
import { User } from "@prisma/client";

export class ProfileService {
  private repo = new ProfileRepository();

  async getProfile(userId: string): Promise<User> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new Error("User profile not found");
    }
    return user;
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string; phone?: string; city?: string; state?: string }
  ): Promise<User> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new Error("User profile not found");
    }
    return this.repo.updateProfile(userId, data);
  }
}
