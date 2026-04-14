-- Remove transitive organizationId columns (3NF fix)
-- organizationId is derivable via partnerId → partner.organizationId

ALTER TABLE "contact" DROP COLUMN IF EXISTS "organizationId";
ALTER TABLE "communication" DROP COLUMN IF EXISTS "organizationId";
ALTER TABLE "document" DROP COLUMN IF EXISTS "organizationId";
