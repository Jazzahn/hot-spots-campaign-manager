-- Migration: Introduce Campaign (overarching) and Company (per-player command)
--
-- Old model: Campaign (was both the campaign and the mercenary company)
-- New model: Campaign (parent) → Company[] (per-player mercenary commands)
--
-- Strategy: rename existing "Campaign" table to "Company", create new "Campaign"
-- parent table, migrate data, then rename FK columns in related tables.

-- Step 1: Rename existing Campaign table to Company
ALTER TABLE "Campaign" RENAME TO "Company";

-- Rename the primary key constraint so "Campaign_pkey" is free for the new table
ALTER TABLE "Company" RENAME CONSTRAINT "Campaign_pkey" TO "Company_pkey";

-- Step 2: Create the new Campaign parent table
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameRules" "GameRules" NOT NULL DEFAULT 'BATTLETECH',
    "currentMonth" INTEGER NOT NULL DEFAULT 1,
    "background" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- Step 3: Add campaignId to Company (nullable while we populate it)
ALTER TABLE "Company" ADD COLUMN "campaignId" TEXT;

-- Step 4: For each Company, create a parent Campaign and link them.
--         Uses a DO block to loop over companies, create a matching campaign,
--         and set the campaignId FK — preserving gameRules/currentMonth/background.
DO $$
DECLARE
    comp RECORD;
    new_campaign_id TEXT;
BEGIN
    FOR comp IN SELECT * FROM "Company" LOOP
        new_campaign_id := gen_random_uuid()::text;
        INSERT INTO "Campaign" ("id", "name", "gameRules", "currentMonth", "background", "createdAt", "updatedAt")
        VALUES (
            new_campaign_id,
            comp."name",
            comp."gameRules",
            comp."currentMonth",
            comp."background",
            NOW(),
            NOW()
        );
        UPDATE "Company" SET "campaignId" = new_campaign_id WHERE "id" = comp."id";
    END LOOP;
END;
$$;

-- Step 5: Make campaignId NOT NULL and add the FK constraint
ALTER TABLE "Company" ALTER COLUMN "campaignId" SET NOT NULL;
ALTER TABLE "Company"
    ADD CONSTRAINT "Company_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Remove fields that moved up to Campaign
-- Note: background stays on Company for company-specific backstory.
ALTER TABLE "Company"
    DROP COLUMN "gameRules",
    DROP COLUMN "currentMonth";

-- Step 7: Rename campaignId → companyId in child tables, update FK constraints

-- Unit
ALTER TABLE "Unit" DROP CONSTRAINT "Unit_campaignId_fkey";
ALTER TABLE "Unit" RENAME COLUMN "campaignId" TO "companyId";
ALTER TABLE "Unit"
    ADD CONSTRAINT "Unit_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Pilot
ALTER TABLE "Pilot" DROP CONSTRAINT "Pilot_campaignId_fkey";
ALTER TABLE "Pilot" RENAME COLUMN "campaignId" TO "companyId";
ALTER TABLE "Pilot"
    ADD CONSTRAINT "Pilot_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Contract
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_campaignId_fkey";
ALTER TABLE "Contract" RENAME COLUMN "campaignId" TO "companyId";
ALTER TABLE "Contract"
    ADD CONSTRAINT "Contract_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Transaction
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_campaignId_fkey";
ALTER TABLE "Transaction" RENAME COLUMN "campaignId" TO "companyId";
ALTER TABLE "Transaction"
    ADD CONSTRAINT "Transaction_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "Company"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
