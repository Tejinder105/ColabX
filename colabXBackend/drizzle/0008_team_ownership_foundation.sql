ALTER TABLE "deal" ADD COLUMN IF NOT EXISTS "teamId" text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'deal_teamId_team_id_fk'
    ) THEN
        ALTER TABLE "deal"
        ADD CONSTRAINT "deal_teamId_team_id_fk"
        FOREIGN KEY ("teamId")
        REFERENCES "public"."team"("id")
        ON DELETE set null
        ON UPDATE no action;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "deal_teamId_idx" ON "deal" USING btree ("teamId");

CREATE TABLE IF NOT EXISTS "teamPartner" (
    "id" text PRIMARY KEY NOT NULL,
    "teamId" text NOT NULL,
    "partnerId" text NOT NULL,
    "assignedBy" text,
    "assignedAt" timestamp DEFAULT now() NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'teamPartner_teamId_team_id_fk'
    ) THEN
        ALTER TABLE "teamPartner"
        ADD CONSTRAINT "teamPartner_teamId_team_id_fk"
        FOREIGN KEY ("teamId")
        REFERENCES "public"."team"("id")
        ON DELETE cascade
        ON UPDATE no action;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'teamPartner_partnerId_partner_id_fk'
    ) THEN
        ALTER TABLE "teamPartner"
        ADD CONSTRAINT "teamPartner_partnerId_partner_id_fk"
        FOREIGN KEY ("partnerId")
        REFERENCES "public"."partner"("id")
        ON DELETE cascade
        ON UPDATE no action;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'teamPartner_assignedBy_user_id_fk'
    ) THEN
        ALTER TABLE "teamPartner"
        ADD CONSTRAINT "teamPartner_assignedBy_user_id_fk"
        FOREIGN KEY ("assignedBy")
        REFERENCES "public"."user"("id")
        ON DELETE set null
        ON UPDATE no action;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "teamPartner_teamId_partnerId_unique"
ON "teamPartner" USING btree ("teamId", "partnerId");

CREATE INDEX IF NOT EXISTS "teamPartner_teamId_idx"
ON "teamPartner" USING btree ("teamId");

CREATE INDEX IF NOT EXISTS "teamPartner_partnerId_idx"
ON "teamPartner" USING btree ("partnerId");

CREATE INDEX IF NOT EXISTS "teamPartner_assignedBy_idx"
ON "teamPartner" USING btree ("assignedBy");
