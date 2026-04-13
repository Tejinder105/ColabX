import { eq, and, sql } from "drizzle-orm";
import db from "../db/index.js";
import { partner } from "./partners.schema.js";
import { orgUser } from "../schemas/orgSchema.js";
import { team, teamPartner } from "../teams/teams.schema.js";

/**
 * Normalize email for consistent storage and comparison
 */
export function normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
}

export async function createPartner(
    organizationId: string,
    createdByUserId: string,
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
            partnerId: crypto.randomUUID(),
            organizationId,
            name: data.name,
            type: data.type,
            contactEmail: normalizeEmail(data.contactEmail),
            industry: data.industry ?? null,
            onboardingDate: data.onboardingDate
                ? new Date(data.onboardingDate)
                : null,
            createdByUserId,
        })
        .returning();

    return created;
}

export async function getPartnerByEmail(organizationId: string, email: string) {
    const normalizedEmail = normalizeEmail(email);
    const [result] = await db
        .select()
        .from(partner)
        .where(
            and(
                eq(partner.organizationId, organizationId),
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
        .where(eq(partner.partnerId, partnerId))
        .returning();

    return updated;
}

export async function getOrgPartners(organizationId: string) {
    return db
        .select()
        .from(partner)
        .where(eq(partner.organizationId, organizationId));
}

export async function getOrgPartnersForUser(organizationId: string, userId: string) {
    return db
        .select()
        .from(partner)
        .where(and(eq(partner.organizationId, organizationId), eq(partner.userId, userId)));
}

export async function getPartnerById(partnerId: string, organizationId: string) {
    const [result] = await db
        .select()
        .from(partner)
        .where(and(eq(partner.partnerId, partnerId), eq(partner.organizationId, organizationId)))
        .limit(1);

    return result;
}

export async function getPartnerWithTeams(partnerId: string) {
    const [partnerRow] = await db
        .select()
        .from(partner)
        .where(eq(partner.partnerId, partnerId))
        .limit(1);

    const teams = await db
        .select({
            id: team.teamId,
            organizationId: team.organizationId,
            name: team.name,
            description: team.description,
            createdByUserId: team.createdByUserId,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
            assignedAt: teamPartner.assignedAt,
        })
        .from(teamPartner)
        .innerJoin(team, eq(teamPartner.teamId, team.teamId))
        .where(eq(teamPartner.partnerId, partnerId));

    return { partner: partnerRow, teams };
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
        .where(eq(partner.partnerId, partnerId))
        .returning();

    return updated;
}

export async function softDeletePartner(partnerId: string) {
    const [updated] = await db
        .update(partner)
        .set({ status: "inactive" })
        .where(eq(partner.partnerId, partnerId))
        .returning();

    return updated;
}

export async function hardDeletePartner(partnerId: string) {
    const [deleted] = await db
        .delete(partner)
        .where(eq(partner.partnerId, partnerId))
        .returning();

    return deleted;
}

export async function isOrgMember(organizationId: string, userId: string): Promise<boolean> {
    const [result] = await db
        .select({ id: orgUser.orgUserId })
        .from(orgUser)
        .where(and(eq(orgUser.organizationId, organizationId), eq(orgUser.userId, userId)))
        .limit(1);

    return !!result;
}
