-- CreateEnum
CREATE TYPE "GameRules" AS ENUM ('BATTLETECH', 'ALPHA_STRIKE');

-- CreateEnum
CREATE TYPE "CommandType" AS ENUM ('MERCENARY', 'REGULAR_MILITARY');

-- CreateEnum
CREATE TYPE "UnitType" AS ENUM ('BATTLEMECH', 'COMBAT_VEHICLE', 'BATTLE_ARMOR', 'INFANTRY');

-- CreateEnum
CREATE TYPE "TechBase" AS ENUM ('IS', 'CLAN', 'MIXED');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('OPERATIONAL', 'ARMOR_DAMAGE', 'STRUCTURE_CRIT', 'CRIPPLED', 'DESTROYED', 'TRULY_DESTROYED');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('RAID', 'EXPEDITION', 'PIRATE_HUNT', 'GARRISON', 'INVASION', 'RETAINER', 'ACTS_OF_PIRACY');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'BROKEN');

-- CreateEnum
CREATE TYPE "SupportType" AS ENUM ('NONE', 'STRAIGHT', 'BATTLE');

-- CreateEnum
CREATE TYPE "CommandRights" AS ENUM ('INTEGRATED', 'HOUSE', 'LIAISON', 'INDEPENDENT');

-- CreateEnum
CREATE TYPE "TrackResult" AS ENUM ('ALL_OBJECTIVES', 'SUCCESS', 'UNSUCCESSFUL', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "TransactionCategory" AS ENUM ('MAINTENANCE', 'COMBAT_PAY', 'TRANSPORT', 'REPAIR', 'REARM', 'PURCHASE', 'SELL', 'SALVAGE', 'UNIT_TRAINING', 'PILOT_HIRE', 'UNIT_PURCHASE', 'COMMAND_TRAINING', 'BATTLEFIELD_LOSS_COMPENSATION', 'DEBT_INTEREST', 'OTHER');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameRules" "GameRules" NOT NULL DEFAULT 'BATTLETECH',
    "commandType" "CommandType" NOT NULL DEFAULT 'MERCENARY',
    "background" TEXT,
    "parentCommand" TEXT,
    "rankLevel" INTEGER,
    "warchest" INTEGER NOT NULL DEFAULT 3000,
    "reputation" INTEGER NOT NULL DEFAULT 1,
    "scale" INTEGER NOT NULL DEFAULT 1,
    "currentMonth" INTEGER NOT NULL DEFAULT 1,
    "trackingJumps" BOOLEAN NOT NULL DEFAULT false,
    "currentLocation" TEXT,
    "companyOptions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chassis" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "unitType" "UnitType" NOT NULL DEFAULT 'BATTLEMECH',
    "tonnage" INTEGER NOT NULL,
    "battleValue" INTEGER NOT NULL,
    "pointValue" INTEGER,
    "techBase" "TechBase" NOT NULL DEFAULT 'IS',
    "status" "UnitStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "isOmni" BOOLEAN NOT NULL DEFAULT false,
    "currentConfig" TEXT,
    "availableNextTrack" BOOLEAN NOT NULL DEFAULT true,
    "isTemporaryHire" BOOLEAN NOT NULL DEFAULT false,
    "isSalvaged" BOOLEAN NOT NULL DEFAULT false,
    "originalOwner" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pilot" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "unitId" TEXT,
    "name" TEXT NOT NULL,
    "callsign" TEXT,
    "isNamed" BOOLEAN NOT NULL DEFAULT true,
    "gunnery" INTEGER NOT NULL DEFAULT 4,
    "piloting" INTEGER NOT NULL DEFAULT 5,
    "edgeTokens" INTEGER NOT NULL DEFAULT 1,
    "edgeAbilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "spGunnery" INTEGER NOT NULL DEFAULT 0,
    "spPiloting" INTEGER NOT NULL DEFAULT 0,
    "spEdgeTokens" INTEGER NOT NULL DEFAULT 0,
    "spEdgeAbilities" INTEGER NOT NULL DEFAULT 0,
    "totalSPEarned" INTEGER NOT NULL DEFAULT 0,
    "handicap" INTEGER NOT NULL DEFAULT 0,
    "wounds" INTEGER NOT NULL DEFAULT 0,
    "isKilled" BOOLEAN NOT NULL DEFAULT false,
    "mvpCount" INTEGER NOT NULL DEFAULT 0,
    "isTemporaryHire" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pilot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "hotSpot" TEXT NOT NULL,
    "contractName" TEXT NOT NULL,
    "contractType" "ContractType" NOT NULL DEFAULT 'GARRISON',
    "scale" INTEGER NOT NULL DEFAULT 1,
    "durationMonths" INTEGER NOT NULL DEFAULT 3,
    "status" "ContractStatus" NOT NULL DEFAULT 'PENDING',
    "basePayPct" INTEGER NOT NULL DEFAULT 100,
    "supportType" "SupportType" NOT NULL DEFAULT 'STRAIGHT',
    "supportPct" INTEGER NOT NULL DEFAULT 100,
    "salvageRightsPct" INTEGER NOT NULL DEFAULT 0,
    "commandRights" "CommandRights" NOT NULL DEFAULT 'INDEPENDENT',
    "transportPct" INTEGER NOT NULL DEFAULT 100,
    "startMonth" INTEGER,
    "endMonth" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "trackNumber" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "trackType" TEXT NOT NULL,
    "scale" INTEGER NOT NULL DEFAULT 1,
    "result" "TrackResult" NOT NULL DEFAULT 'INCOMPLETE',
    "playerVP" INTEGER NOT NULL DEFAULT 0,
    "opponentVP" INTEGER NOT NULL DEFAULT 0,
    "combatPay" INTEGER NOT NULL DEFAULT 0,
    "spToNamedPilots" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackUnit" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "damageResult" "UnitStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "retreated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TrackUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackPilot" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "pilotId" TEXT NOT NULL,
    "wasMVP" BOOLEAN NOT NULL DEFAULT false,
    "spEarned" INTEGER NOT NULL DEFAULT 0,
    "spToGunnery" INTEGER NOT NULL DEFAULT 0,
    "spToPiloting" INTEGER NOT NULL DEFAULT 0,
    "spToEdgeTokens" INTEGER NOT NULL DEFAULT 0,
    "spToEdgeAbilities" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TrackPilot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalvageItem" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "chassis" TEXT,
    "battleValue" INTEGER NOT NULL,
    "salvageValue" INTEGER NOT NULL,
    "playerShare" INTEGER NOT NULL,
    "wasClaimed" BOOLEAN NOT NULL DEFAULT false,
    "wasRejected" BOOLEAN NOT NULL DEFAULT false,
    "claimedByPlayer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalvageItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "category" "TransactionCategory" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "runningBalance" INTEGER NOT NULL,
    "contractId" TEXT,
    "trackId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrackUnit_trackId_unitId_key" ON "TrackUnit"("trackId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "TrackPilot_trackId_pilotId_key" ON "TrackPilot"("trackId", "pilotId");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilot" ADD CONSTRAINT "Pilot_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pilot" ADD CONSTRAINT "Pilot_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackUnit" ADD CONSTRAINT "TrackUnit_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackUnit" ADD CONSTRAINT "TrackUnit_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackPilot" ADD CONSTRAINT "TrackPilot_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackPilot" ADD CONSTRAINT "TrackPilot_pilotId_fkey" FOREIGN KEY ("pilotId") REFERENCES "Pilot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalvageItem" ADD CONSTRAINT "SalvageItem_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
