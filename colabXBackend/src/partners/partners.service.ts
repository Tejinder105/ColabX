import { eq, and } from "drizzle-orm";
import db from "../db/index.js";
import { partner } from "./partners.schema.js";
import { orgUser } from "../schemas/orgSchema.js";

export async function createPartner(
    orgId: string,
    userId: string,
    data: {
        name: string;
        type: "reseller" | "agent" | "technology" | "distributor";
        contactEmail?: string;
        industry?: string;
        onboardingDate?: string;
    }
) {
    const [created] = await db
        .insert(partner)
        .values({
            id: crypto.randomUUID(),
            orgId,
            name: data.name,
            type: data.type,
            contactEmail: data.contactEmail ?? null,
            industry: data.industry ?? null,
            onboardingDate: data.onboardingDate
                ? new Date(data.onboardingDate)
                : null,
            createdBy: userId,
        })
        .returning();

    return created;
}

export async function getOrgPartners(orgId: string) {
    return db
        .select()
        .from(partner)
        .where(eq(partner.orgId, orgId));
}

export async function getPartnerById(partnerId: string, orgId: string) {
    const [result] = await db
        .select()
        .from(partner)
        .where(and(eq(partner.id, partnerId), eq(partner.orgId, orgId)))
        .limit(1);

    return result;
}

export async function getPartnerWithTeams(partnerId: string) {
    const [partnerRow] = await db
        .select()
        .from(partner)
        .where(eq(partner.id, partnerId))
        .limit(1);

    return { partner: partnerRow, teams: [] };
}

export async function updatePartner(
    partnerId: string,
    data: Record<string, string | Date | null | undefined>
) {
    const [updated] = await db
        .update(partner)
        .set(data)
        .where(eq(partner.id, partnerId))
        .returning();

    return updated;
}

export async function softDeletePartner(partnerId: string) {
    const [updated] = await db
        .update(partner)
        .set({ status: "inactive" })
        .where(eq(partner.id, partnerId))
        .returning();

    return updated;
}

export async function isOrgMember(orgId: string, userId: string): Promise<boolean> {
    const [result] = await db
        .select({ id: orgUser.id })
        .from(orgUser)
        .where(and(eq(orgUser.orgId, orgId), eq(orgUser.userId, userId)))
        .limit(1);

    return !!result;
}
