CREATE TYPE "public"."partnerStatus" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."partnerType" AS ENUM('reseller', 'agent', 'technology', 'distributor');--> statement-breakpoint
CREATE TYPE "public"."partnerUserRole" AS ENUM('partner_admin', 'partner_member');--> statement-breakpoint
CREATE TABLE "partner" (
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"name" text NOT NULL,
	"type" "partnerType" NOT NULL,
	"status" "partnerStatus" DEFAULT 'active' NOT NULL,
	"contactEmail" text,
	"industry" text,
	"onboardingDate" timestamp,
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partnerTeam" (
	"id" text PRIMARY KEY NOT NULL,
	"partnerId" text NOT NULL,
	"teamId" text NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partnerUser" (
	"id" text PRIMARY KEY NOT NULL,
	"partnerId" text NOT NULL,
	"userId" text NOT NULL,
	"role" "partnerUserRole" DEFAULT 'partner_member' NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "partner" ADD CONSTRAINT "partner_orgId_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner" ADD CONSTRAINT "partner_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerTeam" ADD CONSTRAINT "partnerTeam_partnerId_partner_id_fk" FOREIGN KEY ("partnerId") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerTeam" ADD CONSTRAINT "partnerTeam_teamId_team_id_fk" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerUser" ADD CONSTRAINT "partnerUser_partnerId_partner_id_fk" FOREIGN KEY ("partnerId") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partnerUser" ADD CONSTRAINT "partnerUser_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "partner_orgId_idx" ON "partner" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "partner_createdBy_idx" ON "partner" USING btree ("createdBy");--> statement-breakpoint
CREATE INDEX "partner_status_idx" ON "partner" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "partnerTeam_partnerId_teamId_unique" ON "partnerTeam" USING btree ("partnerId","teamId");--> statement-breakpoint
CREATE INDEX "partnerTeam_partnerId_idx" ON "partnerTeam" USING btree ("partnerId");--> statement-breakpoint
CREATE INDEX "partnerTeam_teamId_idx" ON "partnerTeam" USING btree ("teamId");--> statement-breakpoint
CREATE UNIQUE INDEX "partnerUser_partnerId_userId_unique" ON "partnerUser" USING btree ("partnerId","userId");--> statement-breakpoint
CREATE INDEX "partnerUser_partnerId_idx" ON "partnerUser" USING btree ("partnerId");--> statement-breakpoint
CREATE INDEX "partnerUser_userId_idx" ON "partnerUser" USING btree ("userId");