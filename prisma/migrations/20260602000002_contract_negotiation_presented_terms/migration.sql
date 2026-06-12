-- AlterTable: Contract — record presented (default) negotiation terms for the audit trail.
-- All columns are nullable and additive; existing rows are unaffected.
ALTER TABLE "Contract" ADD COLUMN "defaultBasePayPct" INTEGER;
ALTER TABLE "Contract" ADD COLUMN "defaultSupportType" "SupportType";
ALTER TABLE "Contract" ADD COLUMN "defaultSupportPct" INTEGER;
ALTER TABLE "Contract" ADD COLUMN "defaultSalvageRightsPct" INTEGER;
ALTER TABLE "Contract" ADD COLUMN "defaultCommandRights" "CommandRights";
ALTER TABLE "Contract" ADD COLUMN "defaultTransportPct" INTEGER;
