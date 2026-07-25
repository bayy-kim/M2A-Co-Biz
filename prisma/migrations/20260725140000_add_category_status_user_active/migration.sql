-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "status" "CategoryStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Category" ADD COLUMN "requestedBySellerId" TEXT;
ALTER TABLE "Category" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "Category" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Category" ALTER COLUMN "defaultCommissionPercent" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_requestedBySellerId_fkey" FOREIGN KEY ("requestedBySellerId") REFERENCES "SellerProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
