import { and, count, desc, eq, inArray, or } from "drizzle-orm";
import db from "../db/index.js";
import { team, teamMember, teamPartner } from "./teams.schema.js";
import { orgUser } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";
import { partner } from "../partners/partners.schema.js";
import { deal, dealAssignment } from "../deals/deals.schema.js";
import { objective, keyResult } from "../okr/okr.schema.js";
import { activityLog } from "../schemas/collaborationSchema.js";
import {
    TEAM_LEAD_ORG_ROLES,
    TEAM_MEMBER_ORG_ROLES,
    type OrgRole,
    isTeamLeadEligibleRole,
    isTeamMemberEligibleRole,
} from "../org/org.constants.js";

type TeamRole = "lead" | "member";

function uniqueIds(ids: string[]) {
    return [...new Set(ids.filter(Boolean))];
}

export async function createTeam(
    organizationId: string,
    userId: string,
    data: {
        name: string;
        description?: string;
        leadUserId?: string;
        memberIds?: string[];
    }
) {
    const memberIds = uniqueIds(data.memberIds ?? []);
    if (data.leadUserId && !memberIds.includes(data.leadUserId)) {
        memberIds.unshift(data.leadUserId);
    }

    return db.transaction(async (tx) => {
        const [createdTeam] = await tx
            .insert(team)
            .values({
                teamId: crypto.randomUUID(),
                organizationId,
                name: data.name,
                description: data.description ?? null,
                createdByUserId: userId,
            })
            .returning();

        if (!createdTeam) {
            throw new Error("Failed to create team");
        }

        let members: Array<{
            teamMemberId: string;
            teamId: string;
            userId: string;
            role: TeamRole;
            joinedAt: Date;
        }> = [];

        if (memberIds.length > 0) {
            members = await tx
                .insert(teamMember)
                .values(
                    memberIds.map((memberId) => ({
                        teamMemberId: crypto.randomUUID(),
                        teamId: createdTeam.teamId,
                        userId: memberId,
                        role: (memberId === data.leadUserId ? "lead" : "member") as TeamRole,
                    }))
                )
                .returning();
        }

        return { team: createdTeam, members };
    });
}

export async function getOrgTeams(organizationId: string, visibleToUserId?: string) {
    const conditions = [eq(team.organizationId, organizationId)];

    if (visibleToUserId) {
        const visibleTeamRows = await db
            .select({ teamId: teamMember.teamId })
            .from(teamMember)
            .innerJoin(team, eq(teamMember.teamId, team.teamId))
            .where(and(eq(team.organizationId, organizationId), eq(teamMember.userId, visibleToUserId)));

        const visibleTeamIds = uniqueIds(visibleTeamRows.map((row) => row.teamId));
        if (visibleTeamIds.length === 0) {
            return [];
        }

        conditions.push(inArray(team.teamId, visibleTeamIds));
    }

    const teamRows = await db
        .select()
        .from(team)
        .where(and(...conditions))
        .orderBy(desc(team.updatedAt));

    if (teamRows.length === 0) {
        return [];
    }

    const teamIds = teamRows.map((row) => row.teamId);
    const members = await getMembersForTeamIds(teamIds);

    const partnerCounts = await db
        .select({
            teamId: teamPartner.teamId,
            partnerCount: count(teamPartner.teamPartnerId),
        })
        .from(teamPartner)
        .where(inArray(teamPartner.teamId, teamIds))
        .groupBy(teamPartner.teamId);

    const dealCounts = await db
        .select({
            teamId: deal.teamId,
            dealCount: count(deal.dealId),
        })
        .from(deal)
        .where(and(eq(deal.organizationId, organizationId), inArray(deal.teamId, teamIds)))
        .groupBy(deal.teamId);

    const memberCountByTeamId = new Map<string, number>();
    const leadByTeamId = new Map<string, (typeof members)[number]>();

    for (const member of members) {
        memberCountByTeamId.set(
            member.teamId,
            (memberCountByTeamId.get(member.teamId) ?? 0) + 1
        );

        if (member.role === "lead" && !leadByTeamId.has(member.teamId)) {
            leadByTeamId.set(member.teamId, member);
        }
    }

    const partnerCountByTeamId = new Map(
        partnerCounts.map((row) => [row.teamId, Number(row.partnerCount)])
    );
    const dealCountByTeamId = new Map(
        dealCounts
            .filter((row) => !!row.teamId)
            .map((row) => [row.teamId as string, Number(row.dealCount)])
    );

    return teamRows.map((row) => {
        const memberCount = memberCountByTeamId.get(row.teamId) ?? 0;
        const partnerCount = partnerCountByTeamId.get(row.teamId) ?? 0;
        const dealCount = dealCountByTeamId.get(row.teamId) ?? 0;

        return {
            ...row,
            lead: leadByTeamId.get(row.teamId) ?? null,
            memberCount,
            partnerCount,
            dealCount,
            isActive: partnerCount > 0 || dealCount > 0,
        };
    });
}

export async function getTeamById(teamId: string, organizationId: string) {
    const [result] = await db
        .select()
        .from(team)
        .where(and(eq(team.teamId, teamId), eq(team.organizationId, organizationId)))
        .limit(1);

    return result;
}

async function getMembersForTeamIds(teamIds: string[]) {
    if (teamIds.length === 0) {
        return [];
    }

    return db
        .select({
            id: teamMember.teamMemberId,
            teamId: teamMember.teamId,
            userId: teamMember.userId,
            role: teamMember.role,
            joinedAt: teamMember.joinedAt,
            userName: user.name,
            userEmail: user.email,
            userImage: user.image,
        })
        .from(teamMember)
        .innerJoin(user, eq(teamMember.userId, user.id))
        .where(inArray(teamMember.teamId, teamIds))
        .orderBy(teamMember.joinedAt);
}

export async function getTeamWithMembers(teamId: string, organizationId: string) {
    const [teamRow, members, partners, deals] = await Promise.all([
        getTeamById(teamId, organizationId),
        getTeamMembers(teamId),
        getTeamPartners(teamId, organizationId),
        getTeamDeals(teamId, organizationId),
    ]);

    if (!teamRow) {
        return { team: null, members: [] };
    }

    const lead = members.find((member) => member.role === "lead") ?? null;

    return {
        team: {
            ...teamRow,
            lead,
            memberCount: members.length,
            partnerCount: partners.length,
            dealCount: deals.length,
            isActive: partners.length > 0 || deals.length > 0,
        },
        members,
    };
}

export async function updateTeam(
    teamId: string,
    data: Record<string, string | null | undefined>
) {
    const [updated] = await db
        .update(team)
        .set(data)
        .where(eq(team.teamId, teamId))
        .returning();

    return updated;
}

export async function deleteTeam(teamId: string) {
    const [deleted] = await db
        .delete(team)
        .where(eq(team.teamId, teamId))
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

export async function getOrgMembershipsByUserIds(organizationId: string, userIds: string[]) {
    const uniqueUserIds = uniqueIds(userIds);
    if (uniqueUserIds.length === 0) {
        return [];
    }

    return db
        .select({
            id: orgUser.orgUserId,
            userId: orgUser.userId,
            organizationId: orgUser.organizationId,
            role: orgUser.role,
        })
        .from(orgUser)
        .where(and(eq(orgUser.organizationId, organizationId), inArray(orgUser.userId, uniqueUserIds)));
}

export async function getOrgMemberUserIds(organizationId: string, userIds: string[]) {
    const uniqueUserIds = uniqueIds(userIds);
    if (uniqueUserIds.length === 0) {
        return [];
    }

    const rows = await db
        .select({ userId: orgUser.userId })
        .from(orgUser)
        .where(and(eq(orgUser.organizationId, organizationId), inArray(orgUser.userId, uniqueUserIds)));

    return rows.map((row) => row.userId);
}

export async function getOrgMembersByRoles(organizationId: string, roles: OrgRole[]) {
    return db
        .select({
            id: orgUser.orgUserId,
            userId: orgUser.userId,
            role: orgUser.role,
            userName: user.name,
            userEmail: user.email,
            userImage: user.image,
        })
        .from(orgUser)
        .innerJoin(user, eq(orgUser.userId, user.id))
        .where(and(eq(orgUser.organizationId, organizationId), inArray(orgUser.role, roles)))
        .orderBy(user.name);
}

export async function getTeamMemberRecord(teamId: string, userId: string) {
    const [result] = await db
        .select()
        .from(teamMember)
        .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
        .limit(1);

    return result;
}

export async function getLeadMemberRecord(teamId: string) {
    const [result] = await db
        .select()
        .from(teamMember)
        .where(and(eq(teamMember.teamId, teamId), eq(teamMember.role, "lead")))
        .limit(1);

    return result;
}

export async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const [result] = await db
        .select({ id: teamMember.teamMemberId })
        .from(teamMember)
        .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
        .limit(1);

    return !!result;
}

export async function getScopedTeamIdsForUser(
    organizationId: string,
    userId: string,
    role: OrgRole
): Promise<string[] | null> {
    if (role === "admin") {
        return null;
    }

    if (role === "manager" || role === "member") {
        const teamRows = await db
            .select({ teamId: teamMember.teamId })
            .from(teamMember)
            .innerJoin(team, eq(teamMember.teamId, team.teamId))
            .where(and(eq(team.organizationId, organizationId), eq(teamMember.userId, userId)));

        return uniqueIds(teamRows.map((row) => row.teamId));
    }

    const teamRows = await db
        .select({ teamId: teamPartner.teamId })
        .from(teamPartner)
        .innerJoin(team, eq(teamPartner.teamId, team.teamId))
        .innerJoin(partner, eq(teamPartner.partnerId, partner.partnerId))
        .where(and(eq(team.organizationId, organizationId), eq(partner.userId, userId)));

    return uniqueIds(teamRows.map((row) => row.teamId));
}

export async function addTeamMember(
    teamId: string,
    userId: string,
    role: TeamRole
) {
    return db.transaction(async (tx) => {
        if (role === "lead") {
            await tx
                .update(teamMember)
                .set({ role: "member" })
                .where(and(eq(teamMember.teamId, teamId), eq(teamMember.role, "lead")));
        }

        const [created] = await tx
            .insert(teamMember)
            .values({
                teamMemberId: crypto.randomUUID(),
                teamId,
                userId,
                role,
            })
            .returning();

        return created;
    });
}

export async function getTeamMembers(teamId: string) {
    return db
        .select({
            id: teamMember.teamMemberId,
            teamId: teamMember.teamId,
            userId: teamMember.userId,
            role: teamMember.role,
            joinedAt: teamMember.joinedAt,
            userName: user.name,
            userEmail: user.email,
            userImage: user.image,
        })
        .from(teamMember)
        .innerJoin(user, eq(teamMember.userId, user.id))
        .where(eq(teamMember.teamId, teamId))
        .orderBy(teamMember.joinedAt);
}

export async function updateTeamMemberRole(
    teamId: string,
    userId: string,
    role: TeamRole
) {
    return db.transaction(async (tx) => {
        const [existing] = await tx
            .select()
            .from(teamMember)
            .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
            .limit(1);

        if (!existing) {
            return null;
        }

        if (existing.role === "lead" && role !== "lead") {
            throw new Error("Assign a new lead before downgrading the current lead");
        }

        if (role === "lead") {
            await tx
                .update(teamMember)
                .set({ role: "member" })
                .where(and(eq(teamMember.teamId, teamId), eq(teamMember.role, "lead")));
        }

        const [updated] = await tx
            .update(teamMember)
            .set({ role })
            .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
            .returning();

        return updated;
    });
}

export async function removeTeamMember(teamId: string, userId: string) {
    return db.transaction(async (tx) => {
        const [existing] = await tx
            .select()
            .from(teamMember)
            .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
            .limit(1);

        if (!existing) {
            return [];
        }

        if (existing.role === "lead") {
            throw new Error("Assign a new lead before removing the current lead");
        }

        return tx
            .delete(teamMember)
            .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
            .returning();
    });
}

export async function getTeamMemberUserIds(teamId: string): Promise<string[]> {
    const members = await db
        .select({ userId: teamMember.userId })
        .from(teamMember)
        .where(eq(teamMember.teamId, teamId));

    return members.map((member) => member.userId);
}

export async function getTeamPartnerRecord(teamId: string, partnerId: string) {
    const [result] = await db
        .select()
        .from(teamPartner)
        .where(and(eq(teamPartner.teamId, teamId), eq(teamPartner.partnerId, partnerId)))
        .limit(1);

    return result;
}

export async function assignPartnerToTeam(
    teamId: string,
    partnerId: string,
    assignedByUserId: string
) {
    return db.transaction(async (tx) => {
        const [existing] = await tx
            .select()
            .from(teamPartner)
            .where(eq(teamPartner.partnerId, partnerId))
            .limit(1);

        if (existing) {
            const [updated] = await tx
                .update(teamPartner)
                .set({
                    teamId,
                    assignedByUserId,
                    assignedAt: new Date(),
                })
                .where(eq(teamPartner.teamPartnerId, existing.teamPartnerId))
                .returning();

            return updated;
        }

        const [created] = await tx
            .insert(teamPartner)
            .values({
                teamPartnerId: crypto.randomUUID(),
                teamId,
                partnerId,
                assignedByUserId,
            })
            .returning();

        return created;
    });
}

export async function removePartnerFromTeam(teamId: string, partnerId: string) {
    return db
        .delete(teamPartner)
        .where(and(eq(teamPartner.teamId, teamId), eq(teamPartner.partnerId, partnerId)))
        .returning();
}

export async function getTeamPartnerIds(teamId: string): Promise<string[]> {
    const rows = await db
        .select({ partnerId: teamPartner.partnerId })
        .from(teamPartner)
        .where(eq(teamPartner.teamId, teamId));

    return rows.map((row) => row.partnerId);
}

export async function getPartnerIdsForTeams(teamIds: string[]): Promise<string[]> {
    if (teamIds.length === 0) {
        return [];
    }

    const rows = await db
        .select({ partnerId: teamPartner.partnerId })
        .from(teamPartner)
        .where(inArray(teamPartner.teamId, uniqueIds(teamIds)));

    return uniqueIds(rows.map((row) => row.partnerId));
}

export async function getTeamPartners(teamId: string, organizationId: string) {
    return db
        .select({
            id: partner.partnerId,
            name: partner.name,
            type: partner.type,
            status: partner.status,
            contactEmail: partner.contactEmail,
            industry: partner.industry,
            onboardingDate: partner.onboardingDate,
            userId: partner.userId,
            createdByUserId: partner.createdByUserId,
            assignedAt: teamPartner.assignedAt,
            assignedByUserId: teamPartner.assignedByUserId,
        })
        .from(teamPartner)
        .innerJoin(partner, eq(teamPartner.partnerId, partner.partnerId))
        .where(and(eq(teamPartner.teamId, teamId), eq(partner.organizationId, organizationId)))
        .orderBy(desc(teamPartner.assignedAt));
}

export async function getPartnerTeamAssignment(partnerId: string, organizationId: string) {
    const [assignment] = await db
        .select({
            id: teamPartner.teamPartnerId,
            teamId: teamPartner.teamId,
            partnerId: teamPartner.partnerId,
            assignedAt: teamPartner.assignedAt,
            assignedByUserId: teamPartner.assignedByUserId,
            teamName: team.name,
        })
        .from(teamPartner)
        .innerJoin(team, eq(teamPartner.teamId, team.teamId))
        .where(and(eq(teamPartner.partnerId, partnerId), eq(team.organizationId, organizationId)))
        .limit(1);

    return assignment;
}

export async function getTeamDeals(teamId: string, organizationId: string) {
    return db
        .select({
            id: deal.dealId,
            teamId: deal.teamId,
            partnerId: deal.partnerId,
            title: deal.title,
            value: deal.value,
            stage: deal.stage,
            createdByUserId: deal.createdByUserId,
            createdAt: deal.createdAt,
            updatedAt: deal.updatedAt,
            partnerName: partner.name,
            assigneeCount: count(dealAssignment.dealAssignmentId),
        })
        .from(deal)
        .leftJoin(partner, eq(deal.partnerId, partner.partnerId))
        .leftJoin(dealAssignment, eq(deal.dealId, dealAssignment.dealId))
        .where(and(eq(deal.organizationId, organizationId), eq(deal.teamId, teamId)))
        .groupBy(deal.dealId, partner.name)
        .orderBy(desc(deal.updatedAt));
}

export async function getTeamObjectives(teamId: string, organizationId: string) {
    const partnerIds = await getTeamPartnerIds(teamId);
    const objectiveConditions = [eq(objective.teamId, teamId)];

    if (partnerIds.length > 0) {
        objectiveConditions.push(inArray(objective.partnerId, partnerIds));
    }

    if (objectiveConditions.length === 0) {
        return [];
    }

    const objectives = await db
        .select({
            id: objective.objectiveId,
            title: objective.title,
            startDate: objective.startDate,
            endDate: objective.endDate,
            partnerId: objective.partnerId,
            teamId: objective.teamId,
            partnerName: partner.name,
        })
        .from(objective)
        .leftJoin(partner, eq(objective.partnerId, partner.partnerId))
        .where(and(eq(objective.organizationId, organizationId), or(...objectiveConditions)));

    return Promise.all(
        objectives.map(async (obj) => {
            const keyResults = await db
                .select()
                .from(keyResult)
                .where(eq(keyResult.objectiveId, obj.id));

            let progress = 0;
            let status: "on_track" | "at_risk" | "off_track" = "on_track";

            if (keyResults.length > 0) {
                const total = keyResults.reduce((sum, keyResultRow) => {
                    const keyResultProgress =
                        keyResultRow.targetValue > 0
                            ? (keyResultRow.currentValue / keyResultRow.targetValue) * 100
                            : 0;
                    return sum + Math.min(keyResultProgress, 100);
                }, 0);

                progress = Math.round(total / keyResults.length);

                const atRiskCount = keyResults.filter(
                    (keyResultRow) => keyResultRow.status === "at_risk"
                ).length;
                const offTrackCount = keyResults.filter(
                    (keyResultRow) => keyResultRow.status === "off_track"
                ).length;

                if (offTrackCount > 0) {
                    status = "off_track";
                } else if (atRiskCount > 0) {
                    status = "at_risk";
                }
            }

            return { ...obj, progress, status };
        })
    );
}

export async function getTeamActivity(teamId: string, organizationId: string) {
    const [memberIds, partnerIds, deals] = await Promise.all([
        getTeamMemberUserIds(teamId),
        getTeamPartnerIds(teamId),
        getTeamDeals(teamId, organizationId),
    ]);

    const scopes = [and(eq(activityLog.entityType, "team"), eq(activityLog.entityId, teamId))];

    if (memberIds.length > 0) {
        scopes.push(inArray(activityLog.userId, memberIds));
    }

    if (partnerIds.length > 0) {
        scopes.push(
            and(
                eq(activityLog.entityType, "partner"),
                inArray(activityLog.entityId, partnerIds)
            )
        );
    }

    const dealIds = deals.map((dealRow) => dealRow.id);
    if (dealIds.length > 0) {
        scopes.push(
            and(eq(activityLog.entityType, "deal"), inArray(activityLog.entityId, dealIds))
        );
    }

    return db
        .select({
            id: activityLog.activityLogId,
            action: activityLog.action,
            entityType: activityLog.entityType,
            entityId: activityLog.entityId,
            createdAt: activityLog.createdAt,
            userId: activityLog.userId,
            userName: user.name,
        })
        .from(activityLog)
        .leftJoin(user, eq(activityLog.userId, user.id))
        .where(and(eq(activityLog.organizationId, organizationId), or(...scopes)))
        .orderBy(desc(activityLog.createdAt))
        .limit(50);
}

export function validateLeadMembershipRole(role: OrgRole) {
    return isTeamLeadEligibleRole(role);
}

export function validateMemberMembershipRole(role: OrgRole) {
    return isTeamMemberEligibleRole(role);
}

export const teamLeadEligibleRoles = [...TEAM_LEAD_ORG_ROLES];
export const teamMemberEligibleRoles = [...TEAM_MEMBER_ORG_ROLES];
