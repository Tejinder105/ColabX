-- Migration: Remove performanceMetric and partnerScore tables
-- Reason: Merging score into partner table for 3NF compliance
-- Add score and scoreCalculatedAt columns to partner table instead

ALTER TABLE "partner" ADD COLUMN IF NOT EXISTS "score" real;
ALTER TABLE "partner" ADD COLUMN IF NOT EXISTS "scoreCalculatedAt" timestamp;

-- Drop foreign key constraints first
ALTER TABLE "performanceMetric" DROP CONSTRAINT IF EXISTS "performanceMetric_partnerId_partner_id_fk";
ALTER TABLE "partnerScore" DROP CONSTRAINT IF EXISTS "partnerScore_partnerId_partner_id_fk";

-- Drop indexes
DROP INDEX IF EXISTS "performanceMetric_partnerId_idx";
DROP INDEX IF EXISTS "performanceMetric_metricType_idx";
DROP INDEX IF EXISTS "partnerScore_partnerId_idx";

-- Drop tables
DROP TABLE IF EXISTS "performanceMetric" CASCADE;
DROP TABLE IF EXISTS "partnerScore" CASCADE;
