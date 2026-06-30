-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "modelCode" TEXT,
                      ADD COLUMN "onRoadPrice" DOUBLE PRECISION DEFAULT 0,
                      ADD COLUMN "fuelType" TEXT,
                      ADD COLUMN "transmission" TEXT,
                      ADD COLUMN "mileage" TEXT,
                      ADD COLUMN "engine" TEXT,
                      ADD COLUMN "seatingCapacity" INTEGER,
                      ADD COLUMN "bootSpace" TEXT,
                      ADD COLUMN "groundClearance" TEXT,
                      ADD COLUMN "warranty" TEXT,
                      ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false,
                      ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
                      ADD COLUMN "seoKeywords" TEXT;

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN "onRoadPrice" DOUBLE PRECISION DEFAULT 0,
                      ADD COLUMN "mileage" TEXT,
                      ADD COLUMN "engine" TEXT,
                      ADD COLUMN "features" JSONB,
                      ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
                      ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0,
                      ADD COLUMN "waitingPeriod" TEXT DEFAULT 'Ready Delivery';

-- AlterTable
ALTER TABLE "VehicleColor" ADD COLUMN "code" TEXT,
                           ADD COLUMN "hexValue" TEXT,
                           ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
                           ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN "whatsapp" TEXT;

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN "startDate" TIMESTAMP(3),
                    ADD COLUMN "endDate" TIMESTAMP(3),
                    ADD COLUMN "bannerImage" TEXT,
                    ADD COLUMN "ctaText" TEXT,
                    ADD COLUMN "ctaLink" TEXT,
                    ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
