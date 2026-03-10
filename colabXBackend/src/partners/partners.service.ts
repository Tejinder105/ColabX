import { eq, and, count } from "drizzle-orm";
import db from "../db/index.js";
import { partner, partnerTeam, partnerUser } from "./partners.schema.js";
import { team } from "../teams/teams.schema.js";
import { orgUser } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";

// ── Partner CRUD ────────────────────────────────────────────────────────────

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

// List all partners for an org with team count
export async function getOrgPartners(orgId: string) {
    return db
        .select({
            id: partner.id,
            orgId: partner.orgId,
            name: partner.name,
            type: partner.type,
            status: partner.status,
            contactEmail: partner.contactEmail,
            industry: partner.industry,
            onboardingDate: partner.onboardingDate,
            createdBy: partner.createdBy,
            createdAt: partner.createdAt,
            updatedAt: partner.updatedAt,
            teamCount: count(partnerTeam.id),
        })
        .from(partner)
        .leftJoin(partnerTeam, eq(partner.id, partnerTeam.partnerId))
        .where(eq(partner.orgId, orgId))
        .groupBy(partner.id);
}

// Get a single partner (orgId filter enforces cross-tenant isolation)
export async function getPartnerById(partnerId: string, orgId: string) {
    const [result] = await db
        .select()
        .from(partner)
        .where(and(eq(partner.id, partnerId), eq(partner.orgId, orgId)))
        .limit(1);

    return result;
}

// Get partner with its assigned teams
export async function getPartnerWithTeams(partnerId: string) {
    const [partnerRow] = await db
        .select()
        .from(partner)
        .where(eq(partner.id, partnerId))
        .limit(1);

    const teams = await db
        .select({
            id: team.id,
            orgId: team.orgId,
            name: team.name,
            description: team.description,
            createdBy: team.createdBy,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
            assignedAt: partnerTeam.assignedAt,
        })
        .from(partnerTeam)
        .innerJoin(team, eq(partnerTeam.teamId, team.id))
        .where(eq(partnerTeam.partnerId, partnerId));

    return { partner: partnerRow, teams };
}

// Update a partner's fields
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

// Soft delete — set status to inactive
export async function softDeletePartner(partnerId: string) {
    const [updated] = await db
        .update(partner)
        .set({ status: "inactive" })
        .where(eq(partner.id, partnerId))
        .returning();

    return updated;
}

// ── Partner–Team Assignment ─────────────────────────────────────────────────

export async function getPartnerTeamRecord(partnerId: string, teamId: string) {
    const [result] = await db
        .select()
        .from(partnerTeam)
        .where(
            and(
                eq(partnerTeam.partnerId, partnerId),
                eq(partnerTeam.teamId, teamId)
            )
        )
        .limit(1);

    return result;
}

export async function assignTeamToPartner(partnerId: string, teamId: string) {
    const [created] = await db
        .insert(partnerTeam)
        .values({
            id: crypto.randomUUID(),
            partnerId,
            teamId,
        })
        .returning();

    return created;
}

export async function getPartnerTeams(partnerId: string) {
    return db
        .select({
            id: team.id,
            orgId: team.orgId,
            name: team.name,
            description: team.description,
            createdBy: team.createdBy,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
            assignedAt: partnerTeam.assignedAt,
        })
        .from(partnerTeam)
        .innerJoin(team, eq(partnerTeam.teamId, team.id))
        .where(eq(partnerTeam.partnerId, partnerId));
}

export async function removeTeamFromPartner(partnerId: string, teamId: string) {
    return db
        .delete(partnerTeam)
        .where(
            and(
                eq(partnerTeam.partnerId, partnerId),
                eq(partnerTeam.teamId, teamId)
            )
        )
        .returning();
}

// ── Partner Users ───────────────────────────────────────────────────────────

export async function getPartnerUserRecord(partnerId: string, userId: string) {
    const [result] = await db
        .select()
        .from(partnerUser)
        .where(
            and(
                eq(partnerUser.partnerId, partnerId),
                eq(partnerUser.userId, userId)
            )
        )
        .limit(1);

    return result;
}

export async function addPartnerUser(
    partnerId: string,
    userId: string,
    role: "partner_admin" | "partner_member"
) {
    const [created] = await db
        .insert(partnerUser)
        .values({
            id: crypto.randomUUID(),
            partnerId,
            userId,
            role,
        })
        .returning();

    return created;
}

export async function getPartnerUsers(partnerId: string) {
    return db
        .select({
            id: partnerUser.id,
            partnerId: partnerUser.partnerId,
            userId: partnerUser.userId,
            role: partnerUser.role,
            joinedAt: partnerUser.joinedAt,
            userName: user.name,
            userEmail: user.email,
            userImage: user.image,
        })
        .from(partnerUser)
        .innerJoin(user, eq(partnerUser.userId, user.id))
        .where(eq(partnerUser.partnerId, partnerId));
}

export async function updatePartnerUserRole(
    partnerId: string,
    userId: string,
    role: "partner_admin" | "partner_member"
) {
    const [updated] = await db
        .update(partnerUser)
        .set({ role })
        .where(
            and(
                eq(partnerUser.partnerId, partnerId),
                eq(partnerUser.userId, userId)
            )
        )
        .returning();

    return updated;
}

export async function removePartnerUser(partnerId: string, userId: string) {
    return db
        .delete(partnerUser)
        .where(
            and(
                eq(partnerUser.partnerId, partnerId),
                eq(partnerUser.userId, userId)
            )
        )
        .returning();
}

// Check whether a user is an org member (needed for adding partner users)
export async function isOrgMember(orgId: string, userId: string): Promise<boolean> {
    const [result] = await db
        .select({ id: orgUser.id })
        .from(orgUser)
        .where(and(eq(orgUser.orgId, orgId), eq(orgUser.userId, userId)))
        .limit(1);

    return !!result;
}
