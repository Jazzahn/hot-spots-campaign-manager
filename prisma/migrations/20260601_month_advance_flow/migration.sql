-- Add player-driven month advance tracking to contracts
ALTER TABLE "Contract" ADD COLUMN "companyMonthReady" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Contract" ADD COLUMN "conflictAdvancedThisMonth" BOOLEAN NOT NULL DEFAULT false;

-- Add pending flag to transactions (committed only when campaign month advances)
ALTER TABLE "Transaction" ADD COLUMN "isPending" BOOLEAN NOT NULL DEFAULT false;
