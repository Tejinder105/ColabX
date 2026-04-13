-- Migration: Rename columns to consistent naming convention
-- Standardize all ID and foreign key field names across tables

-- Communication table renames
ALTER TABLE "communication" RENAME COLUMN "id" TO "communicationId";
ALTER TABLE "communication" RENAME COLUMN "orgId" TO "organizationId";
ALTER TABLE "communication" RENAME COLUMN "senderId" TO "senderUserId";

-- Update communication indexes
DROP INDEX IF EXISTS "communication_orgId_idx";
DROP INDEX IF EXISTS "communication_senderId_idx";
CREATE INDEX "communication_organizationId_idx" ON "communication"("organizationId");
CREATE INDEX "communication_senderUserId_idx" ON "communication"("senderUserId");

-- Document table renames
ALTER TABLE "document" RENAME COLUMN "id" TO "documentId";
ALTER TABLE "document" RENAME COLUMN "orgId" TO "organizationId";
ALTER TABLE "document" RENAME COLUMN "uploadedBy" TO "uploadedByUserId";

-- Update document indexes
DROP INDEX IF EXISTS "document_orgId_idx";
DROP INDEX IF EXISTS "document_uploadedBy_idx";
CREATE INDEX "document_organizationId_idx" ON "document"("organizationId");
CREATE INDEX "document_uploadedByUserId_idx" ON "document"("uploadedByUserId");

-- ActivityLog table renames
ALTER TABLE "activityLog" RENAME COLUMN "id" TO "activityLogId";
ALTER TABLE "activityLog" RENAME COLUMN "orgId" TO "organizationId";

-- Update activityLog indexes
DROP INDEX IF EXISTS "activityLog_orgId_idx";
CREATE INDEX "activityLog_organizationId_idx" ON "activityLog"("organizationId");

-- Notification table renames
ALTER TABLE "notification" RENAME COLUMN "id" TO "notificationId";
ALTER TABLE "notification" RENAME COLUMN "orgId" TO "organizationId";
ALTER TABLE "notification" RENAME COLUMN "recipientId" TO "recipientUserId";

-- Update notification indexes
DROP INDEX IF EXISTS "notification_orgId_idx";
DROP INDEX IF EXISTS "notification_recipientId_idx";
CREATE INDEX "notification_organizationId_idx" ON "notification"("organizationId");
CREATE INDEX "notification_recipientUserId_idx" ON "notification"("recipientUserId");

-- Deal table renames
ALTER TABLE "deal" RENAME COLUMN "id" TO "dealId";
ALTER TABLE "deal" RENAME COLUMN "orgId" TO "organizationId";
ALTER TABLE "deal" RENAME COLUMN "createdBy" TO "createdByUserId";

-- Update deal indexes
DROP INDEX IF EXISTS "deal_orgId_idx";
CREATE INDEX "deal_organizationId_idx" ON "deal"("organizationId");

-- DealAssignment table renames
ALTER TABLE "dealAssignment" RENAME COLUMN "id" TO "dealAssignmentId";

-- Update dealAssignment foreign keys and indexes
ALTER TABLE "dealAssignment" DROP CONSTRAINT IF EXISTS "dealAssignment_dealId_deal_id_fk";
ALTER TABLE "dealAssignment" ADD CONSTRAINT "dealAssignment_dealId_deal_dealId_fk" FOREIGN KEY ("dealId") REFERENCES "deal"("dealId") ON DELETE cascade;

-- DealMessage table renames
ALTER TABLE "dealMessage" RENAME COLUMN "id" TO "dealMessageId";
ALTER TABLE "dealMessage" RENAME COLUMN "senderId" TO "senderUserId";

-- Update dealMessage foreign keys and indexes
ALTER TABLE "dealMessage" DROP CONSTRAINT IF EXISTS "dealMessage_dealId_deal_id_fk";
ALTER TABLE "dealMessage" DROP CONSTRAINT IF EXISTS "dealMessage_senderId_user_id_fk";
ALTER TABLE "dealMessage" ADD CONSTRAINT "dealMessage_dealId_deal_dealId_fk" FOREIGN KEY ("dealId") REFERENCES "deal"("dealId") ON DELETE cascade;
ALTER TABLE "dealMessage" ADD CONSTRAINT "dealMessage_senderUserId_user_id_fk" FOREIGN KEY ("senderUserId") REFERENCES "user"("id") ON DELETE cascade;

DROP INDEX IF EXISTS "dealMessage_senderId_idx";
CREATE INDEX "dealMessage_senderUserId_idx" ON "dealMessage"("senderUserId");

-- DealTask table renames
ALTER TABLE "dealTask" RENAME COLUMN "id" TO "dealTaskId";
ALTER TABLE "dealTask" RENAME COLUMN "createdBy" TO "createdByUserId";

-- Update dealTask foreign keys and indexes
ALTER TABLE "dealTask" DROP CONSTRAINT IF EXISTS "dealTask_dealId_deal_id_fk";
ALTER TABLE "dealTask" DROP CONSTRAINT IF EXISTS "dealTask_createdBy_user_id_fk";
ALTER TABLE "dealTask" ADD CONSTRAINT "dealTask_dealId_deal_dealId_fk" FOREIGN KEY ("dealId") REFERENCES "deal"("dealId") ON DELETE cascade;
ALTER TABLE "dealTask" ADD CONSTRAINT "dealTask_createdByUserId_user_id_fk" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE set null;

-- DealDocument table renames
ALTER TABLE "dealDocument" RENAME COLUMN "id" TO "dealDocumentId";
ALTER TABLE "dealDocument" RENAME COLUMN "uploadedBy" TO "uploadedByUserId";

-- Update dealDocument foreign keys and indexes
ALTER TABLE "dealDocument" DROP CONSTRAINT IF EXISTS "dealDocument_dealId_deal_id_fk";
ALTER TABLE "dealDocument" DROP CONSTRAINT IF EXISTS "dealDocument_uploadedBy_user_id_fk";
ALTER TABLE "dealDocument" ADD CONSTRAINT "dealDocument_dealId_deal_dealId_fk" FOREIGN KEY ("dealId") REFERENCES "deal"("dealId") ON DELETE cascade;
ALTER TABLE "dealDocument" ADD CONSTRAINT "dealDocument_uploadedByUserId_user_id_fk" FOREIGN KEY ("uploadedByUserId") REFERENCES "user"("id") ON DELETE cascade;

DROP INDEX IF EXISTS "dealDocument_uploadedBy_idx";
CREATE INDEX "dealDocument_uploadedByUserId_idx" ON "dealDocument"("uploadedByUserId");
