-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CAMPAIGN_MANAGER', 'PLAYER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "callsign" TEXT NOT NULL,
    "passHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_callsign_key" ON "User"("callsign");

-- AlterTable: Campaign — add managedById and inviteKey
ALTER TABLE "Campaign" ADD COLUMN "managedById" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "inviteKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_inviteKey_key" ON "Campaign"("inviteKey");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_managedById_fkey"
    FOREIGN KEY ("managedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: Company — add userId
ALTER TABLE "Company" ADD COLUMN "userId" TEXT;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
