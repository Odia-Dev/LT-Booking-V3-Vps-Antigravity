import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Seed Branches
  const branch1 = await prisma.branch.upsert({
    where: { slug: "laxmi-toyota-headquarters" },
    update: {},
    create: {
      name: "Laxmi Toyota Headquarters",
      slug: "laxmi-toyota-headquarters",
      address: "123 Toyota Ring Road, Central Business District",
      phone: "+91 98765 43210",
      email: "info@laxmitoyota.co.in",
      googleMapsUrl: "https://maps.google.com/?q=Toyota",
      workingHours: "9:00 AM - 7:00 PM",
      managerName: "Rajesh Kumar",
      isActive: true,
    },
  });

  const branch2 = await prisma.branch.upsert({
    where: { slug: "laxmi-toyota-east" },
    update: {},
    create: {
      name: "Laxmi Toyota East",
      slug: "laxmi-toyota-east",
      address: "45 East Expressway Lane, Industrial Hub",
      phone: "+91 98765 43211",
      email: "east@laxmitoyota.co.in",
      googleMapsUrl: "https://maps.google.com/?q=Toyota+East",
      workingHours: "9:00 AM - 6:00 PM",
      managerName: "Amit Sharma",
      isActive: true,
    },
  });

  console.log("Branches seeded:", { branch1, branch2 });

  // 2. Seed Vehicle
  const vehicle = await prisma.vehicle.upsert({
    where: { slug: "fortuner" },
    update: {},
    create: {
      name: "Fortuner",
      slug: "fortuner",
      brand: "Toyota",
      tagline: "The Uncontested Leader",
      description: "Experience the power, prestige, and off-road capability of the Toyota Fortuner. Built for all terrains.",
      exShowroomMin: 3343000,
      exShowroomMax: 5144000,
      status: "ACTIVE",
    },
  });

  console.log("Vehicle seeded:", vehicle);

  // 3. Seed Variant
  const variant1 = await prisma.variant.create({
    data: {
      vehicleId: vehicle.id,
      name: "2.8L 4x2 MT (Diesel)",
      fuelType: "Diesel",
      transmission: "Manual",
      price: 3593000,
      specs: {
        engineCC: "2755 cc",
        mileage: "14.4 kmpl",
        seats: "7 Seater",
        maxPower: "201 bhp @ 3400 rpm",
      },
    },
  });

  const variant2 = await prisma.variant.create({
    data: {
      vehicleId: vehicle.id,
      name: "2.8L 4x4 AT (Diesel)",
      fuelType: "Diesel",
      transmission: "Automatic",
      price: 4260000,
      specs: {
        engineCC: "2755 cc",
        mileage: "14.2 kmpl",
        seats: "7 Seater",
        maxPower: "201 bhp @ 3000 rpm",
      },
    },
  });

  console.log("Variants seeded:", { variant1, variant2 });

  // 4. Seed Colors
  const color1 = await prisma.vehicleColor.create({
    data: {
      vehicleId: vehicle.id,
      name: "Attitude Black",
      hexCode: "#000000",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1611234567/attitude_black.png",
    },
  });

  const color2 = await prisma.vehicleColor.create({
    data: {
      vehicleId: vehicle.id,
      name: "Super White",
      hexCode: "#FFFFFF",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1611234568/super_white.png",
    },
  });

  console.log("Colors seeded:", { color1, color2 });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
