-- Migration: Add partner type and industry fields to invitation table
-- These fields store partner-specific info when role='partner'

ALTER TABLE "invitation" ADD COLUMN IF NOT EXISTS "partnerType" text;
ALTER TABLE "invitation" ADD COLUMN IF NOT EXISTS "partnerIndustry" text;

-- Add check constraint for valid partner types
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_partnerType_check" 
CHECK ("partnerType" IS NULL OR "partnerType" IN ('reseller', 'agent', 'technology', 'distributor'));

-- Add check constraint for valid industries
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_partnerIndustry_check"
CHECK ("partnerIndustry" IS NULL OR "partnerIndustry" IN ('Software', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Defense', 'Other'));
