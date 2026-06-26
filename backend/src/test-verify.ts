process.env.NODE_ENV = "development";
import http from "http";
import { AuthRepository } from "./modules/auth/authRepository";
import { ProfileRepository } from "./modules/profile/profileRepository";
import { User, OtpVerification } from "@prisma/client";
import bcrypt from "bcrypt";

// -----------------------------------------------------------------------------
// Isolated Test Environment Mock Database (No impact on production code paths)
// -----------------------------------------------------------------------------
const mockUsers: User[] = [
  {
    id: "admin-id",
    email: "admin@laxmitoyota.co.in",
    phone: null,
    passwordHash: bcrypt.hashSync("admin123", 10),
    name: "Toyota Admin",
    city: "Bhubaneswar",
    state: "Odisha",
    role: "ADMIN",
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];
const mockOtps: OtpVerification[] = [];

// Overriding prototype methods for offline test isolation
AuthRepository.prototype.findUserByPhone = async function (phone: string) {
  return mockUsers.find((u) => u.phone === phone) || null;
};

AuthRepository.prototype.findUserByEmail = async function (email: string) {
  return mockUsers.find((u) => u.email === email) || null;
};

AuthRepository.prototype.createUser = async function (data: any) {
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
};

AuthRepository.prototype.findOtp = async function (phone: string) {
  return mockOtps.find((o) => o.phone === phone) || null;
};

AuthRepository.prototype.saveOtp = async function (phone: string, code: string, expiresAt: Date) {
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
};

AuthRepository.prototype.deleteOtp = async function (phone: string) {
  const index = mockOtps.findIndex((o) => o.phone === phone);
  if (index !== -1) {
    mockOtps.splice(index, 1);
  }
};

ProfileRepository.prototype.findUserById = async function (id: string) {
  return mockUsers.find((u) => u.id === id) || null;
};

ProfileRepository.prototype.updateProfile = async function (id: string, data: any) {
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
};

import { prisma } from "./config/db";
(prisma as any).$queryRaw = async () => [1];

import app from "./app";

async function verifyAll() {
  console.log("Starting production-grade security and API audit tests (M02/M03)...\n");

  let server: http.Server | null = null;
  const PORT = 5001;

  try {
    server = app.listen(PORT);

    const query = (path: string, method: string = "GET", payload?: any, headers: Record<string, string> = {}) => {
      return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }>((resolve, reject) => {
        const bodyStr = payload ? JSON.stringify(payload) : "";
        const reqHeaders: Record<string, string> = { ...headers };
        if (bodyStr) {
          reqHeaders["content-type"] = "application/json";
          reqHeaders["content-length"] = Buffer.byteLength(bodyStr).toString();
        }

        const req = http.request(
          {
            hostname: "localhost",
            port: PORT,
            path,
            method,
            headers: reqHeaders,
          },
          (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
              resolve({
                status: res.statusCode || 0,
                headers: res.headers,
                body: data,
              });
            });
          }
        );
        req.on("error", reject);
        if (bodyStr) {
          req.write(bodyStr);
        }
        req.end();
      });
    };

    // 1. Health check endpoint
    const healthRes = await query("/health");
    if (healthRes.status === 200 && JSON.parse(healthRes.body).success === true) {
      console.log("✓ /health endpoint returns 200");
    } else {
      throw new Error(`Health check failed: Status ${healthRes.status}, Body: ${healthRes.body}`);
    }

    // Edge Case Tests:
    
    // 2. Invalid OTP
    console.log("Testing Invalid OTP...");
    await query("/api/auth/send-otp", "POST", { phone: "+919876543211" });
    const invalidOtpRes = await query("/api/auth/verify-otp", "POST", {
      phone: "+919876543211",
      code: "000000",
    });
    if (invalidOtpRes.status === 400) {
      console.log("✓ Invalid OTP correctly rejected with 400");
    } else {
      throw new Error(`Failed Invalid OTP test: status ${invalidOtpRes.status}`);
    }

    // 3. Expired OTP
    console.log("Testing Expired OTP...");
    const otpRecord = mockOtps.find(o => o.phone === "+919876543211");
    if (otpRecord) {
      otpRecord.expiresAt = new Date(Date.now() - 1000); // Backdate expiry
    }
    const expiredOtpRes = await query("/api/auth/verify-otp", "POST", {
      phone: "+919876543211",
      code: otpRecord?.code || "123456",
    });
    if (expiredOtpRes.status === 400) {
      console.log("✓ Expired OTP correctly rejected with 400");
    } else {
      throw new Error(`Failed Expired OTP test: status ${expiredOtpRes.status}`);
    }

    // 3. Reused OTP
    console.log("Testing Reused OTP...");
    const sendRes = await query("/api/auth/send-otp", "POST", { phone: "+919876543212" });
    const code = JSON.parse(sendRes.body).code;
    const verify1 = await query("/api/auth/verify-otp", "POST", { phone: "+919876543212", code });
    if (verify1.status === 200) {
      const verify2 = await query("/api/auth/verify-otp", "POST", { phone: "+919876543212", code });
      if (verify2.status === 400) {
        console.log("✓ OTP reuse correctly prevented (OTP deleted on first use)");
      } else {
        throw new Error(`Failed OTP reuse test: second verify returned status ${verify2.status}`);
      }
    } else {
      throw new Error("First verification failed unexpectedly");
    }

    // 4. Missing JWT
    console.log("Testing Missing JWT...");
    const missingJwtRes = await query("/api/auth/me", "GET");
    if (missingJwtRes.status === 401) {
      console.log("✓ Missing JWT/cookie correctly rejected with 401");
    } else {
      throw new Error(`Failed Missing JWT test: status ${missingJwtRes.status}`);
    }

    // 5. Invalid JWT
    console.log("Testing Invalid JWT...");
    const invalidJwtRes = await query("/api/auth/me", "GET", undefined, {
      cookie: "admin_session=invalid_jwt_token_payload",
    });
    if (invalidJwtRes.status === 401) {
      console.log("✓ Invalid JWT/cookie correctly rejected with 401");
    } else {
      throw new Error(`Failed Invalid JWT test: status ${invalidJwtRes.status}`);
    }

    // 6. Admin Wrong Password
    console.log("Testing Admin Wrong Password...");
    const adminWrongRes = await query("/api/auth/login", "POST", {
      email: "admin@laxmitoyota.co.in",
      password: "wrongpassword",
    });
    if (adminWrongRes.status === 401) {
      console.log("✓ Admin wrong password correctly rejected with 401");
    } else {
      throw new Error(`Failed Admin wrong password test: status ${adminWrongRes.status}`);
    }

    // 7. Logout Flow
    console.log("Testing Logout Flow...");
    const logoutRes = await query("/api/auth/logout", "POST");
    const setCookieHeader = logoutRes.headers["set-cookie"];
    if (logoutRes.status === 200 && setCookieHeader && setCookieHeader[0] && (setCookieHeader[0].includes("1970") || setCookieHeader[0].includes("Max-Age=0") || setCookieHeader[0].includes("expires="))) {
      console.log("✓ Logout flow clears secure session cookies correctly");
    } else {
      throw new Error(`Failed Logout flow check: ${JSON.stringify(setCookieHeader)}`);
    }

    // 8. User Profile retrieval and updates
    console.log("Testing Profile APIs...");
    const custOtpSendRes = await query("/api/auth/send-otp", "POST", { phone: "+919876543220" });
    const custOtpBody = JSON.parse(custOtpSendRes.body);
    const custOtpVerifyRes = await query("/api/auth/verify-otp", "POST", {
      phone: "+919876543220",
      code: custOtpBody.code,
    });
    const custCookie = custOtpVerifyRes.headers["set-cookie"]?.[0];
    if (!custCookie) {
      throw new Error("Customer cookie missing");
    }

    // GET /api/profile (Authorized)
    const getProfileRes = await query("/api/profile", "GET", undefined, {
      cookie: custCookie,
    });
    const getProfileBody = JSON.parse(getProfileRes.body);
    if (getProfileRes.status === 200 && getProfileBody.success && getProfileBody.profile.phone === "+919876543220") {
      console.log("✓ GET /api/profile retrieves own profile details");
    } else {
      throw new Error(`Failed GET profile: Status ${getProfileRes.status}, Body: ${getProfileRes.body}`);
    }

    // PUT /api/profile (Authorized update)
    const updateProfileRes = await query("/api/profile", "PUT", {
      name: "John Customer",
      email: "john@example.com",
      city: "Cuttack",
      state: "Odisha",
    }, {
      cookie: custCookie,
    });
    const updateProfileBody = JSON.parse(updateProfileRes.body);
    if (updateProfileRes.status === 200 && updateProfileBody.success && updateProfileBody.profile.name === "John Customer" && updateProfileBody.profile.city === "Cuttack") {
      console.log("✓ PUT /api/profile updates profile parameters successfully");
    } else {
      throw new Error(`Failed PUT profile: Status ${updateProfileRes.status}, Body: ${updateProfileRes.body}`);
    }

    // GET /api/profile (Unauthorized / missing JWT)
    const unauthProfileRes = await query("/api/profile", "GET");
    if (unauthProfileRes.status === 401) {
      console.log("✓ Unauthorized profile requests correctly rejected with 401");
    } else {
      throw new Error(`Failed Unauthorized profile check: Status ${unauthProfileRes.status}`);
    }

    console.log("\nAll security and audit checks PASSED successfully!");
  } catch (error) {
    console.error("\nAudit failed:", error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
  }
}

verifyAll();
