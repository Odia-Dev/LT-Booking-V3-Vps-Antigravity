import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  let email = "";
  let password = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--email" && args[i + 1]) {
      email = args[i + 1];
    }
    if (args[i] === "--password" && args[i + 1]) {
      password = args[i + 1];
    }
  }

  if (!email || !password) {
    console.error("Usage: npm run create-admin -- --email <email> --password <password>");
    process.exit(1);
  }

  try {
    const existingAdmin = await prisma.user.findUnique({ where: { email } });
    if (existingAdmin) {
      console.error(`User with email ${email} already exists.`);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const crypto = require("crypto");

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "ADMIN",
        name: "Administrator",
        isVerified: true,
        verificationToken: crypto.randomBytes(32).toString('hex'),
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      },
    });

    console.log(`Admin account created successfully for ${email}`);
  } catch (error) {
    console.error("Failed to create admin:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
