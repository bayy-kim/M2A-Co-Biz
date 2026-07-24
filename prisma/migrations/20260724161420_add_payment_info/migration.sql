-- Add payment info fields to CompanyProfile
ALTER TABLE "CompanyProfile" ADD COLUMN "bankName" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN "bankAccountName" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN "bankAccountNo" TEXT;
ALTER TABLE "CompanyProfile" ADD COLUMN "qrisImageUrl" TEXT;
