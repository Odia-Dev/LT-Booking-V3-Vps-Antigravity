import { User, OtpVerification } from "@prisma/client";
import bcrypt from "bcrypt";

export const mockUsers: User[] = [
  {
    id: "admin-id",
    email: "admin@laxmitoyota.co.in",
    phone: null,
    passwordHash: bcrypt.hashSync("admin123", 10),
    name: "Toyota Admin",
    city: "Bhubaneswar",
    state: "Odisha",
    role: "ADMIN",
    address: null,
    preferredBranchId: null,
    communicationPreferences: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const mockOtps: OtpVerification[] = [];

export const offlineState = {
  isOfflineMode: false,
};
