import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // Clear existing catalog data
  console.log("Cleaning database...");
  await prisma.vehicleColor.deleteMany({});
  await prisma.variant.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.branch.deleteMany({});

  // 1. Seed Branches
  const branch1 = await prisma.branch.upsert({
    where: { slug: "laxmi-toyota-headquarters" },
    update: {},
    create: {
      name: "Laxmi Toyota Headquarters",
      slug: "laxmi-toyota-headquarters",
      address: "123 Toyota Ring Road, Central Business District, Bhubaneswar, Odisha",
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
      address: "45 East Expressway Lane, Industrial Hub, Cuttack, Odisha",
      phone: "+91 98765 43211",
      email: "east@laxmitoyota.co.in",
      googleMapsUrl: "https://maps.google.com/?q=Toyota+East",
      workingHours: "9:00 AM - 6:00 PM",
      managerName: "Amit Sharma",
      isActive: true,
    },
  });

  console.log("Branches seeded successfully.");

  // 2. Seed Toyota Vehicles
  const vehiclesData = [
    {
      name: "Urban Cruiser Hyryder",
      slug: "urban-cruiser-hyryder",
      category: "SUV",
      description: "Experience Strong Hybrid technology with superior fuel efficiency and panoramic sunroof design.",
      heroImage: "https://res.cloudinary.com/demo/image/upload/v1611234567/hyryder.png",
      status: "ACTIVE",
      seoTitle: "Book Toyota Urban Cruiser Hyryder | Laxmi Toyota",
      seoDescription: "Secure your Toyota Urban Cruiser Hyryder online today. Strong Hybrid mileage and luxury design starting at ₹11.14 Lakh.",
    },
    {
      name: "Urban Cruiser Taisor",
      slug: "urban-cruiser-taisor",
      category: "SUV",
      description: "Make way for the bold dynamic compact SUV with head-up display and turbo engine performance.",
      heroImage: "https://res.cloudinary.com/demo/image/upload/v1611234567/taisor.png",
      status: "ACTIVE",
      seoTitle: "Book Toyota Urban Cruiser Taisor | Laxmi Toyota",
      seoDescription: "Book the bold compact SUV Toyota Taisor online. Dynamic styling and smart connectivity starting at ₹7.74 Lakh.",
    },
    {
      name: "Rumion",
      slug: "rumion",
      category: "MPV",
      description: "The spacious 7-seater MPV built for family comfort, high fuel economy, and standard safety features.",
      heroImage: "https://res.cloudinary.com/demo/image/upload/v1611234567/rumion.png",
      status: "ACTIVE",
      seoTitle: "Book Toyota Rumion | Family MPV Online | Laxmi Toyota",
      seoDescription: "Book the Toyota Rumion MPV. Spacious 7-seater comfort, smart specifications, and reliable performance starting at ₹10.44 Lakh.",
    },
    {
      name: "Glanza",
      slug: "glanza",
      category: "Hatchback",
      description: "Advanced intelligence hatchback featuring auto climate controls, head-up display, and supreme mileage.",
      heroImage: "https://res.cloudinary.com/demo/image/upload/v1611234567/glanza.png",
      status: "ACTIVE",
      seoTitle: "Book Toyota Glanza Hatchback Online | Laxmi Toyota",
      seoDescription: "Secure your Toyota Glanza online. Advanced hatchback styling with smart features and automatic AMT options starting at ₹6.86 Lakh.",
    },
    {
      name: "Fortuner",
      slug: "fortuner",
      category: "SUV",
      description: "The uncontested leader in SUV design, offering massive off-road torque and standard safety protocols.",
      heroImage: "https://res.cloudinary.com/demo/image/upload/v1611234567/fortuner.png",
      status: "ACTIVE",
      seoTitle: "Book Toyota Fortuner SUV Online | Laxmi Toyota",
      seoDescription: "Book the legendary Toyota Fortuner SUV. Unmatched torque, luxury off-road capabilities, and high presence starting at ₹33.43 Lakh.",
    },
    {
      name: "Fortuner Legender",
      slug: "fortuner-legender",
      category: "SUV",
      description: "Elite premium SUV edition with distinct split grille layouts, dual-tone interiors, and aggressive road presence.",
      heroImage: "https://res.cloudinary.com/demo/image/upload/v1611234567/legender.png",
      status: "ACTIVE",
      seoTitle: "Book Toyota Fortuner Legender | Laxmi Toyota",
      seoDescription: "Secure the premium Toyota Fortuner Legender online. Aggressive design and elite specifications.",
    },
    {
      name: "Innova Crysta",
      slug: "innova-crysta",
      category: "MPV",
      description: "The gold standard of luxury MPV travel. Durable chassis, spacious passenger seats, and high resale value.",
      heroImage: "https://res.cloudinary.com/demo/image/upload/v1611234567/crysta.png",
      status: "ACTIVE",
      seoTitle: "Book Toyota Innova Crysta MPV | Laxmi Toyota",
      seoDescription: "Secure the legendary Innova Crysta online. Gold standard of MPV comfort, diesel performance, and high durability.",
    },
    {
      name: "Innova Hycross",
      slug: "innova-hycross",
      category: "MPV",
      description: "Revolutionary self-charging hybrid MPV featuring luxury ottoman seats, ADAS safety suite, and panoramic sun roof.",
      heroImage: "https://res.cloudinary.com/demo/image/upload/v1611234567/hycross.png",
      status: "ACTIVE",
      seoTitle: "Book Toyota Innova Hycross Hybrid | Laxmi Toyota",
      seoDescription: "Book the self-charging hybrid Innova Hycross online. Ottoman seating, advanced safety, and premium cabin experience.",
    },
    {
      name: "Camry",
      slug: "camry",
      category: "Sedan",
      description: "Elite self-charging hybrid luxury sedan with rear seat power recliners and 3-zone climate control settings.",
      heroImage: "https://res.cloudinary.com/demo/image/upload/v1611234567/camry.png",
      status: "ACTIVE",
      seoTitle: "Book Toyota Camry Hybrid Sedan | Laxmi Toyota",
      seoDescription: "Book the premium self-charging hybrid sedan Toyota Camry online. Supreme luxury recliners and performance.",
    },
  ];

  const variantsMap: Record<string, Array<{ name: string; price: number; fuelType: string; transmission: string; seating: number }>> = {
    "urban-cruiser-hyryder": [
      { name: "E NeoDrive", price: 1114000, fuelType: "Petrol", transmission: "Manual", seating: 5 },
      { name: "S E-Drive Hybrid", price: 1666000, fuelType: "Hybrid", transmission: "Automatic", seating: 5 },
      { name: "G NeoDrive AT", price: 1569000, fuelType: "Petrol", transmission: "Automatic", seating: 5 },
      { name: "V E-Drive Hybrid", price: 2019000, fuelType: "Hybrid", transmission: "Automatic", seating: 5 },
    ],
    "rumion": [
      { name: "S MT", price: 1044000, fuelType: "Petrol", transmission: "Manual", seating: 7 },
      { name: "G MT", price: 1160000, fuelType: "Petrol", transmission: "Manual", seating: 7 },
      { name: "S AT", price: 1194000, fuelType: "Petrol", transmission: "Automatic", seating: 7 },
      { name: "V AT", price: 1373000, fuelType: "Petrol", transmission: "Automatic", seating: 7 },
    ],
    "glanza": [
      { name: "E MT", price: 686000, fuelType: "Petrol", transmission: "Manual", seating: 5 },
      { name: "S AMT", price: 825000, fuelType: "Petrol", transmission: "Automatic", seating: 5 },
      { name: "G MT", price: 878000, fuelType: "Petrol", transmission: "Manual", seating: 5 },
      { name: "V AMT", price: 999000, fuelType: "Petrol", transmission: "Automatic", seating: 5 },
    ],
    "fortuner": [
      { name: "2.7L 4x2 MT", price: 3343000, fuelType: "Petrol", transmission: "Manual", seating: 7 },
      { name: "2.8L 4x2 AT", price: 3821000, fuelType: "Diesel", transmission: "Automatic", seating: 7 },
      { name: "2.8L 4x4 MT", price: 4003000, fuelType: "Diesel", transmission: "Manual", seating: 7 },
      { name: "2.8L 4x4 AT", price: 4235000, fuelType: "Diesel", transmission: "Automatic", seating: 7 },
    ],
    "camry": [
      { name: "2.5L Hybrid AT", price: 4617000, fuelType: "Hybrid", transmission: "Automatic", seating: 5 },
    ]
  };

  // Colors map: real Toyota color codes per model
  const colorsMap: Record<string, Array<{ name: string; colorCode: string }>> = {
    "urban-cruiser-hyryder": [
      { name: "Café White", colorCode: "#F5F0E8" },
      { name: "Attitude Black", colorCode: "#1C1C1E" },
      { name: "Sportin Red", colorCode: "#C0392B" },
      { name: "Silver Metallic", colorCode: "#C0C0C0" },
      { name: "Grey Metallic", colorCode: "#6B7280" },
    ],
    "urban-cruiser-taisor": [
      { name: "Café White", colorCode: "#F5F0E8" },
      { name: "Attitude Black", colorCode: "#1C1C1E" },
      { name: "Sportin Red", colorCode: "#C0392B" },
      { name: "Enticing Silver", colorCode: "#A8A9AD" },
    ],
    "rumion": [
      { name: "Pearl White", colorCode: "#F8F8F2" },
      { name: "Attitude Black", colorCode: "#1C1C1E" },
      { name: "Grey Metallic", colorCode: "#6B7280" },
    ],
    "glanza": [
      { name: "Sportin Red", colorCode: "#C0392B" },
      { name: "Attitude Black", colorCode: "#1C1C1E" },
      { name: "Café White", colorCode: "#F5F0E8" },
      { name: "Silver Metallic", colorCode: "#C0C0C0" },
    ],
    "fortuner": [
      { name: "Phantom Brown", colorCode: "#4A3728" },
      { name: "Attitude Black", colorCode: "#1C1C1E" },
      { name: "White Pearl", colorCode: "#F8F8F2" },
      { name: "Silver Metallic", colorCode: "#C0C0C0" },
    ],
    "fortuner-legender": [
      { name: "Super White", colorCode: "#FAFAFA" },
      { name: "Attitude Black", colorCode: "#1C1C1E" },
      { name: "Phantom Brown", colorCode: "#4A3728" },
    ],
    "innova-crysta": [
      { name: "White Crystal", colorCode: "#F2F2F2" },
      { name: "Avant-Garde Bronze", colorCode: "#8B6914" },
      { name: "Attitude Black", colorCode: "#1C1C1E" },
      { name: "Silver Metallic", colorCode: "#C0C0C0" },
    ],
    "innova-hycross": [
      { name: "Super White", colorCode: "#FAFAFA" },
      { name: "Midnight Black", colorCode: "#0D0D0D" },
      { name: "Silver Metallic", colorCode: "#C0C0C0" },
      { name: "Precious Bronze", colorCode: "#7D6134" },
    ],
    "camry": [
      { name: "Platinum White Pearl", colorCode: "#FFFFF0" },
      { name: "Attitude Black", colorCode: "#1C1C1E" },
      { name: "Avant-garde Bronze", colorCode: "#8B6914" },
    ],
  };

  let variantsCount = 0;
  let colorsCount = 0;

  for (const v of vehiclesData) {
    const createdVehicle = await prisma.vehicle.create({
      data: v,
    });

    const variants = variantsMap[v.slug];
    if (variants) {
      for (const varData of variants) {
        await prisma.variant.create({
          data: {
            ...varData,
            vehicleId: createdVehicle.id,
            status: "ACTIVE",
          },
        });
        variantsCount++;
      }
    }

    const colors = colorsMap[v.slug];
    if (colors) {
      for (const colorData of colors) {
        await prisma.vehicleColor.create({
          data: {
            ...colorData,
            vehicleId: createdVehicle.id,
            status: "ACTIVE",
          },
        });
        colorsCount++;
      }
    }
  }

  console.log(`Successfully seeded ${vehiclesData.length} vehicles, ${variantsCount} variants, and ${colorsCount} colors.`);
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

