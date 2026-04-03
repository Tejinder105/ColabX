CREATE TYPE "public"."keyResultStatus" AS ENUM('on_track', 'at_risk', 'off_track');--> statement-breakpoint
CREATE TYPE "public"."objectiveStatus" AS ENUM('active', 'completed', 'archived');--> statement-breakpoint
CREATE TABLE "keyResult" (
	"id" text PRIMARY KEY NOT NULL,
	"objectiveId" text NOT NULL,
	"title" text NOT NULL,
	"targetValue" real NOT NULL,
	"currentValue" real DEFAULT 0 NOT NULL,
	"unit" text NOT NULL,
	"status" "keyResultStatus" DEFAULT 'on_track' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "objective" (
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"ownerId" text,
	"startDate" date NOT NULL,
	"endDate" date NOT NULL,
	"status" "objectiveStatus" DEFAULT 'active' NOT NULL,
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partnerScore" (
	"id" text PRIMARY KEY NOT NULL,
	"partnerId" text NOT NULL,
	"orgId" text NOT NULL,
	"score" real NOT NULL,
	"calculatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "performanceMetric" (
	"id" text PRIMARY KEY NOT NULL,
	"partnerId" text NOT NULL,
	"orgId" text NOT NULL,
	"metricType" text NOT NULL,
	"metricValue" real NOT NULL,
	"recordedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "keyResult" ADD CONSTRAINT "keyResult_objectiveId_objective_id_fk" FOREIGN KEY ("objectiveId") REFERENCES "public"."objective"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objective" ADD CONSTRAINT "objective_orgId_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objective" ADD CONSTRAINT "objective_ownerId_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "objective" ADD CONSTRAINT "objective_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerScore" ADD CONSTRAINT "partnerScore_partnerId_partner_id_fk" FOREIGN KEY ("partnerId") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerScore" ADD CONSTRAINT "partnerScore_orgId_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performanceMetric" ADD CONSTRAINT "performanceMetric_partnerId_partner_id_fk" FOREIGN KEY ("partnerId") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performanceMetric" ADD CONSTRAINT "performanceMetric_orgId_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "keyResult_objectiveId_idx" ON "keyResult" USING btree ("objectiveId");--> statement-breakpoint
CREATE INDEX "keyResult_status_idx" ON "keyResult" USING btree ("status");--> statement-breakpoint
CREATE INDEX "objective_orgId_idx" ON "objective" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "objective_ownerId_idx" ON "objective" USING btree ("ownerId");--> statement-breakpoint
CREATE INDEX "objective_status_idx" ON "objective" USING btree ("status");--> statement-breakpoint
CREATE INDEX "partnerScore_partnerId_idx" ON "partnerScore" USING btree ("partnerId");--> statement-breakpoint
CREATE INDEX "partnerScore_orgId_idx" ON "partnerScore" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "performanceMetric_partnerId_idx" ON "performanceMetric" USING btree ("partnerId");--> statement-breakpoint
CREATE INDEX "performanceMetric_orgId_idx" ON "performanceMetric" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "performanceMetric_metricType_idx" ON "performanceMetric" USING btree ("metricType");