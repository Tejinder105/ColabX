ALTER TABLE "objective" DROP CONSTRAINT IF EXISTS "objective_partnerId_partner_id_fk";
ALTER TABLE "objective" ALTER COLUMN "partnerId" DROP NOT NULL;
ALTER TABLE "objective"
ADD COLUMN IF NOT EXISTS "teamId" text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'objective_partnerId_partner_id_fk'
    ) THEN
        ALTER TABLE "objective"
        ADD CONSTRAINT "objective_partnerId_partner_id_fk"
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
        WHERE conname = 'objective_teamId_team_id_fk'
    ) THEN
        ALTER TABLE "objective"
        ADD CONSTRAINT "objective_teamId_team_id_fk"
        FOREIGN KEY ("teamId")
        REFERENCES "public"."team"("id")
        ON DELETE cascade
        ON UPDATE no action;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "objective_teamId_idx"
ON "objective" USING btree ("teamId");

ALTER TABLE "keyResult"
ADD COLUMN IF NOT EXISTS "title" text;

UPDATE "keyResult"
SET "title" = COALESCE(NULLIF(trim("title"), ''), 'Key Result')
WHERE "title" IS NULL OR trim("title") = '';

ALTER TABLE "keyResult"
ALTER COLUMN "title" SET NOT NULL;
