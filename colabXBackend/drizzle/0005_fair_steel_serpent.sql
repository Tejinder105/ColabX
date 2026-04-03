ALTER TYPE "public"."partnerStatus" ADD VALUE 'pending' BEFORE 'active';--> statement-breakpoint
CREATE TABLE "activityLog" (
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"userId" text NOT NULL,
	"entityType" text NOT NULL,
	"entityId" text NOT NULL,
	"action" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communication" (
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"partnerId" text NOT NULL,
	"senderId" text NOT NULL,
	"message" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document" (
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"partnerId" text NOT NULL,
	"uploadedBy" text NOT NULL,
	"fileName" text NOT NULL,
	"fileUrl" text NOT NULL,
	"visibility" text NOT NULL,
	"uploadedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "partnerTeam" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "partnerUser" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "dealActivity" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "partnerTeam" CASCADE;--> statement-breakpoint
DROP TABLE "partnerUser" CASCADE;--> statement-breakpoint
DROP TABLE "dealActivity" CASCADE;--> statement-breakpoint
ALTER TABLE "partnerScore" RENAME COLUMN "calculatedAt" TO "calculatedOn";--> statement-breakpoint
ALTER TABLE "objective" DROP CONSTRAINT "objective_ownerId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "partnerScore" DROP CONSTRAINT "partnerScore_orgId_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "performanceMetric" DROP CONSTRAINT "performanceMetric_orgId_organization_id_fk";
--> statement-breakpoint
DROP INDEX "objective_ownerId_idx";--> statement-breakpoint
DROP INDEX "objective_status_idx";--> statement-breakpoint
DROP INDEX "partnerScore_orgId_idx";--> statement-breakpoint
DROP INDEX "performanceMetric_orgId_idx";--> statement-breakpoint
ALTER TABLE "partner" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "partner" ALTER COLUMN "contactEmail" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "deal" ALTER COLUMN "value" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "partner" ADD COLUMN "userId" text;--> statement-breakpoint
ALTER TABLE "objective" ADD COLUMN "partnerId" text NOT NULL;--> statement-breakpoint
ALTER TABLE "activityLog" ADD CONSTRAINT "activityLog_orgId_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activityLog" ADD CONSTRAINT "activityLog_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication" ADD CONSTRAINT "communication_orgId_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication" ADD CONSTRAINT "communication_partnerId_partner_id_fk" FOREIGN KEY ("partnerId") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communication" ADD CONSTRAINT "communication_senderId_user_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_orgId_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_partnerId_partner_id_fk" FOREIGN KEY ("partnerId") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_uploadedBy_user_id_fk" FOREIGN KEY ("uploadedBy") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activityLog_orgId_idx" ON "activityLog" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "activityLog_userId_idx" ON "activityLog" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "activityLog_entityType_idx" ON "activityLog" USING btree ("entityType");--> statement-breakpoint
CREATE INDEX "communication_orgId_idx" ON "communication" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "communication_partnerId_idx" ON "communication" USING btree ("partnerId");--> statement-breakpoint
CREATE INDEX "communication_senderId_idx" ON "communication" USING btree ("senderId");--> statement-breakpoint
CREATE INDEX "document_orgId_idx" ON "document" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "document_partnerId_idx" ON "document" USING btree ("partnerId");--> statement-breakpoint
CREATE INDEX "document_uploadedBy_idx" ON "document" USING btree ("uploadedBy");--> statement-breakpoint
ALTER TABLE "partner" ADD CONSTRAINT "partner_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objective" ADD CONSTRAINT "objective_partnerId_partner_id_fk" FOREIGN KEY ("partnerId") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "partner_userId_idx" ON "partner" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "objective_partnerId_idx" ON "objective" USING btree ("partnerId");--> statement-breakpoint
ALTER TABLE "keyResult" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "keyResult" DROP COLUMN "unit";--> statement-breakpoint
ALTER TABLE "objective" DROP COLUMN "ownerId";--> statement-breakpoint
ALTER TABLE "objective" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "partnerScore" DROP COLUMN "orgId";--> statement-breakpoint
ALTER TABLE "performanceMetric" DROP COLUMN "orgId";--> statement-breakpoint
DROP TYPE "public"."partnerUserRole";--> statement-breakpoint
DROP TYPE "public"."objectiveStatus";