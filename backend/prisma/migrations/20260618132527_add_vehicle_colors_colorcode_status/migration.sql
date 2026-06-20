/*
  Warnings:

  - You are about to drop the column `hexCode` on the `VehicleColor` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `VehicleColor` table. All the data in the column will be lost.
  - Added the required column `colorCode` to the `VehicleColor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VehicleColor" DROP COLUMN "hexCode",
DROP COLUMN "imageUrl",
ADD COLUMN     "colorCode" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';
