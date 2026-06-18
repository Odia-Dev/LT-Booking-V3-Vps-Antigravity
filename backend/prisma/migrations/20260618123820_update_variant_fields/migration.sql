/*
  Warnings:

  - You are about to drop the column `isActive` on the `Variant` table. All the data in the column will be lost.
  - You are about to drop the column `specs` on the `Variant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Variant" DROP COLUMN "isActive",
DROP COLUMN "specs",
ADD COLUMN     "seating" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';
