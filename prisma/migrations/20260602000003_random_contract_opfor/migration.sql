-- AlterTable: Company — holding company flag (owns unassigned/OPFOR contracts)
ALTER TABLE "Company" ADD COLUMN "isHolding" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Contract — OPFOR placeholder flag (excluded from finances/advancement)
ALTER TABLE "Contract" ADD COLUMN "isOpposingForce" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable: RandomContractOffer — one rolled offer per company per campaign month
CREATE TABLE "RandomContractOffer" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "campaignMonth" INTEGER NOT NULL,
    "hiringHall" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RandomContractOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RandomContractOffer_companyId_campaignMonth_key"
    ON "RandomContractOffer"("companyId", "campaignMonth");

-- AddForeignKey
ALTER TABLE "RandomContractOffer" ADD CONSTRAINT "RandomContractOffer_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
