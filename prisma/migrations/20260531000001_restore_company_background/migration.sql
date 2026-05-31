-- Restore the background column on Company.
-- The previous migration incorrectly dropped it; Company keeps its own background
-- for company-specific backstory, separate from Campaign.background (world/setting notes).
ALTER TABLE "Company" ADD COLUMN "background" TEXT;
