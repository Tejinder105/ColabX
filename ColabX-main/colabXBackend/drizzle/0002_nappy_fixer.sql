CREATE TYPE "public"."dealStage" AS ENUM('lead', 'proposal', 'negotiation', 'won', 'lost');--> statement-breakpoint
CREATE TABLE "deal" (
	"id" text PRIMARY KEY NOT NULL,
	"orgId" text NOT NULL,
	"partnerId" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"value" text,
	"stage" "dealStage" DEFAULT 'lead' NOT NULL,
	"createdBy" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dealActivity" (
	"id" text PRIMARY KEY NOT NULL,
	"dealId" text NOT NULL,
	"userId" text NOT NULL,
	"action" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dealAssignment" (
	"id" text PRIMARY KEY NOT NULL,
	"dealId" text NOT NULL,
	"userId" text NOT NULL,
	"assignedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_orgId_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_partnerId_partner_id_fk" FOREIGN KEY ("partnerId") REFERENCES "public"."partner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal" ADD CONSTRAINT "deal_createdBy_user_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealActivity" ADD CONSTRAINT "dealActivity_dealId_deal_id_fk" FOREIGN KEY ("dealId") REFERENCES "public"."deal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealActivity" ADD CONSTRAINT "dealActivity_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealAssignment" ADD CONSTRAINT "dealAssignment_dealId_deal_id_fk" FOREIGN KEY ("dealId") REFERENCES "public"."deal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dealAssignment" ADD CONSTRAINT "dealAssignment_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "deal_orgId_idx" ON "deal" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "deal_partnerId_idx" ON "deal" USING btree ("partnerId");--> statement-breakpoint
CREATE INDEX "deal_stage_idx" ON "deal" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "dealActivity_dealId_idx" ON "dealActivity" USING btree ("dealId");--> statement-breakpoint
CREATE UNIQUE INDEX "dealAssignment_dealId_userId_unique" ON "dealAssignment" USING btree ("dealId","userId");--> statement-breakpoint
CREATE INDEX "dealAssignment_dealId_idx" ON "dealAssignment" USING btree ("dealId");--> statement-breakpoint
CREATE INDEX "dealAssignment_userId_idx" ON "dealAssignment" USING btree ("userId");