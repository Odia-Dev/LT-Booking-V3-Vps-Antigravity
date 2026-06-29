const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Vehicles:', await prisma.vehicle.count());
  console.log('Variants:', await prisma.variant.count());
  console.log('Colors:', await prisma.color.count());
  console.log('Branches:', await prisma.branch.count());
}
main().catch(console.error).finally(() => prisma.$disconnect());
