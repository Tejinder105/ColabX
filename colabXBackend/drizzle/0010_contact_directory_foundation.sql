CREATE TABLE IF NOT EXISTS "contact" (
    "id" text PRIMARY KEY NOT NULL,
    "orgId" text NOT NULL,
    "partnerId" text NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL,
    "phone" text,
    "role" text,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "createdBy" text,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'contact_orgId_organization_id_fk'
    ) THEN
        ALTER TABLE "contact"
        ADD CONSTRAINT "contact_orgId_organization_id_fk"
        FOREIGN KEY ("orgId")
        REFERENCES "public"."organization"("id")
        ON DELETE cascade
        ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'contact_partnerId_partner_id_fk'
    ) THEN
        ALTER TABLE "contact"
        ADD CONSTRAINT "contact_partnerId_partner_id_fk"
        FOREIGN KEY ("partnerId")
        REFERENCES "public"."partner"("id")
        ON DELETE cascade
        ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'contact_createdBy_user_id_fk'
    ) THEN
        ALTER TABLE "contact"
        ADD CONSTRAINT "contact_createdBy_user_id_fk"
        FOREIGN KEY ("createdBy")
        REFERENCES "public"."user"("id")
        ON DELETE set null
        ON UPDATE no action;
    END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_orgId_idx" ON "contact" USING btree ("orgId");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contact_partnerId_idx" ON "contact" USING btree ("partnerId");
