/*
  Warnings:

  - You are about to drop the column `brand` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `brochureUrl` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `exShowroomMax` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `exShowroomMin` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `tagline` on the `Vehicle` table. All the data in the column will be lost.
  - Added the required column `category` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "brand",
DROP COLUMN "brochureUrl",
DROP COLUMN "exShowroomMax",
DROP COLUMN "exShowroomMin",
DROP COLUMN "tagline",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;
