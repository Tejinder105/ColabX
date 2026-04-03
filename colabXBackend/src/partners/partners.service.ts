import { eq, and, sql } from "drizzle-orm";
import db from "../db/index.js";
import { partner } from "./partners.schema.js";
import { orgUser } from "../schemas/orgSchema.js";

/**
 * Normalize email for consistent storage and comparison
 */
export function normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
}

export async function createPartner(
    orgId: string,
    createdBy: string,
    data: {
        name: string;
        type: "reseller" | "agent" | "technology" | "distributor";
        contactEmail: string;
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
            contactEmail: normalizeEmail(data.contactEmail),
            industry: data.industry ?? null,
            onboardingDate: data.onboardingDate
                ? new Date(data.onboardingDate)
                : null,
            createdBy,
        })
        .returning();

    return created;
}

export async function getPartnerByEmail(orgId: string, email: string) {
    const normalizedEmail = normalizeEmail(email);
    const [result] = await db
        .select()
        .from(partner)
        .where(
            and(
                eq(partner.orgId, orgId),
                sql`lower(${partner.contactEmail}) = ${normalizedEmail}`
            )
        )
        .limit(1);

    return result;
}

export async function linkUserToPartner(partnerId: string, userId: string) {
    const [updated] = await db
        .update(partner)
        .set({ userId, status: "active" })
        .where(eq(partner.id, partnerId))
        .returning();

    return updated;
}

export async function getOrgPartners(orgId: string) {
    return db
        .select()
        .from(partner)
        .where(eq(partner.orgId, orgId));
}

export async function getOrgPartnersForUser(orgId: string, userId: string) {
    return db
        .select()
        .from(partner)
        .where(and(eq(partner.orgId, orgId), eq(partner.userId, userId)));
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
    // Normalize email if being updated
    if (data.contactEmail && typeof data.contactEmail === 'string') {
        data.contactEmail = normalizeEmail(data.contactEmail);
    }
    
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

export async function hardDeletePartner(partnerId: string) {
    const [deleted] = await db
        .delete(partner)
        .where(eq(partner.id, partnerId))
        .returning();

    return deleted;
}

export async function isOrgMember(orgId: string, userId: string): Promise<boolean> {
    const [result] = await db
        .select({ id: orgUser.id })
        .from(orgUser)
        .where(and(eq(orgUser.orgId, orgId), eq(orgUser.userId, userId)))
        .limit(1);

    return !!result;
}
