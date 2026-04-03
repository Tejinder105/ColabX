-- Add unique constraint on partner(orgId, contactEmail) to prevent duplicate partners
-- Using a unique index with lower() for case-insensitive uniqueness

-- First, normalize existing emails to lowercase (data cleanup)
UPDATE "partner" SET "contactEmail" = lower(trim("contactEmail")) WHERE "contactEmail" IS NOT NULL;

-- Create unique index with case-insensitive collation
CREATE UNIQUE INDEX "partner_org_email_unique_idx" ON "partner" ("orgId", lower("contactEmail"));

-- Also normalize invitation emails
UPDATE "invitation" SET "email" = lower(trim("email")) WHERE "email" IS NOT NULL;
