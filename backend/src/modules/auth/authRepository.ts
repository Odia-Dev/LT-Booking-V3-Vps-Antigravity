import { prisma } from "../../config/db";
import { User, OtpVerification } from "@prisma/client";

export class AuthRepository {
  async findUserByPhone(phone: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { phone },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: { phone?: string; email?: string; name?: string; role: string; passwordHash?: string }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async findOtp(phone: string): Promise<OtpVerification | null> {
    return prisma.otpVerification.findUnique({
      where: { phone },
    });
  }

  async saveOtp(phone: string, code: string, expiresAt: Date): Promise<OtpVerification> {
    return prisma.otpVerification.upsert({
      where: { phone },
      update: {
        code,
        expiresAt,
      },
      create: {
        phone,
        code,
        expiresAt,
      },
    });
  }

  async deleteOtp(phone: string): Promise<void> {
    await prisma.otpVerification.delete({
      where: { phone },
    }).catch(() => {
      // Ignore if not found
    });
  }
}
