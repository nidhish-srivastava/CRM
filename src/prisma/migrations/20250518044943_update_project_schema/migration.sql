/*
  Warnings:

  - You are about to drop the column `systemSize` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Project" DROP COLUMN "systemSize",
ADD COLUMN     "budget" DOUBLE PRECISION,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "priority" TEXT,
ALTER COLUMN "cost" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'Planned';
