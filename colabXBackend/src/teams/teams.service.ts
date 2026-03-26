import { eq, and, count, inArray, desc } from "drizzle-orm";
import db from "../db/index.js";
import { team, teamMember } from "./teams.schema.js";
import { orgUser } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";
import { partner } from "../partners/partners.schema.js";
import { deal, dealAssignment } from "../deals/deals.schema.js";
import { objective, keyResult } from "../okr/okr.schema.js";
import { activityLog } from "../schemas/collaborationSchema.js";

// Create a new team inside an organization
export async function createTeam(
    orgId: string,
    userId: string,
    data: { name: string; description?: string }
) {
    const [created] = await db
        .insert(team)
        .values({
            id: crypto.randomUUID(),
            orgId,
            name: data.name,
            description: data.description ?? null,
            createdBy: userId,
        })
        .returning();

    return created;
}

// List all teams for an org, each with a memberCount
export async function getOrgTeams(orgId: string) {
    return db
        .select({
            id: team.id,
            orgId: team.orgId,
            name: team.name,
            description: team.description,
            createdBy: team.createdBy,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt,
            memberCount: count(teamMember.id),
        })
        .from(team)
        .leftJoin(teamMember, eq(team.id, teamMember.teamId))
        .where(eq(team.orgId, orgId))
        .groupBy(team.id);
}

// Get a single team (orgId filter enforces cross-tenant isolation)
export async function getTeamById(teamId: string, orgId: string) {
    const [result] = await db
        .select()
        .from(team)
        .where(and(eq(team.id, teamId), eq(team.orgId, orgId)))
        .limit(1);

    return result;
}

// Get team row + all members with embedded user details
export async function getTeamWithMembers(teamId: string) {
    const [teamRow] = await db
        .select()
        .from(team)
        .where(eq(team.id, teamId))
        .limit(1);

    const members = await db
        .select({
            id: teamMember.id,
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
        .where(eq(teamMember.teamId, teamId));

    return { team: teamRow, members };
}

// Update a team's name and/or description
export async function updateTeam(
    teamId: string,
    data: Record<string, string | null | undefined>
) {
    const [updated] = await db
        .update(team)
        .set(data)
        .where(eq(team.id, teamId))
        .returning();

    return updated;
}

// Delete a team (FK cascade removes teamMember rows)
export async function deleteTeam(teamId: string) {
    const [deleted] = await db
        .delete(team)
        .where(eq(team.id, teamId))
        .returning();

    return deleted;
}

// Check whether a user is a member of an organization
export async function isOrgMember(orgId: string, userId: string): Promise<boolean> {
    const [result] = await db
        .select({ id: orgUser.id })
        .from(orgUser)
        .where(and(eq(orgUser.orgId, orgId), eq(orgUser.userId, userId)))
        .limit(1);

    return !!result;
}

// Get a specific team membership record (used for duplicate-check before add)
export async function getTeamMemberRecord(teamId: string, userId: string) {
    const [result] = await db
        .select()
        .from(teamMember)
        .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
        .limit(1);

    return result;
}

// Add a member to a team
export async function addTeamMember(
    teamId: string,
    userId: string,
    role: "lead" | "member"
) {
    const [created] = await db
        .insert(teamMember)
        .values({
            id: crypto.randomUUID(),
            teamId,
            userId,
            role,
        })
        .returning();

    return created;
}

// List all members of a team with embedded user details
export async function getTeamMembers(teamId: string) {
    return db
        .select({
            id: teamMember.id,
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
        .where(eq(teamMember.teamId, teamId));
}

// Update a team member's role
export async function updateTeamMemberRole(
    teamId: string,
    userId: string,
    role: "lead" | "member"
) {
    const [updated] = await db
        .update(teamMember)
        .set({ role })
        .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
        .returning();

    return updated;
}

// Remove a member from a team
export async function removeTeamMember(teamId: string, userId: string) {
    return db
        .delete(teamMember)
        .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
        .returning();
}

// Get user IDs of all members of a team
export async function getTeamMemberUserIds(teamId: string): Promise<string[]> {
    const members = await db
        .select({ userId: teamMember.userId })
        .from(teamMember)
        .where(eq(teamMember.teamId, teamId));

    return members.map((m) => m.userId);
}

// Get partners created by team members
export async function getTeamPartners(teamId: string, orgId: string) {
    const memberIds = await getTeamMemberUserIds(teamId);
    if (memberIds.length === 0) return [];

    return db
        .select({
            id: partner.id,
            name: partner.name,
            type: partner.type,
            status: partner.status,
        })
        .from(partner)
        .where(
            and(
                eq(partner.orgId, orgId),
                inArray(partner.createdBy, memberIds)
            )
        );
}

// Get deals created by or assigned to team members
export async function getTeamDeals(teamId: string, orgId: string) {
    const memberIds = await getTeamMemberUserIds(teamId);
    if (memberIds.length === 0) return [];

    // Get deal IDs assigned to team members
    const assignedDealIds = await db
        .select({ dealId: dealAssignment.dealId })
        .from(dealAssignment)
        .where(inArray(dealAssignment.userId, memberIds));

    const assignedSet = new Set(assignedDealIds.map((r) => r.dealId));

    // Get deals created by team members
    const createdDeals = await db
        .select({
            id: deal.id,
            title: deal.title,
            value: deal.value,
            stage: deal.stage,
            partnerName: partner.name,
        })
        .from(deal)
        .leftJoin(partner, eq(deal.partnerId, partner.id))
        .where(
            and(
                eq(deal.orgId, orgId),
                inArray(deal.createdBy, memberIds)
            )
        );

    // Get deals assigned to team members (not already in created)
    const createdIds = new Set(createdDeals.map((d) => d.id));
    const assignedOnlyIds = [...assignedSet].filter((id) => !createdIds.has(id));

    let assignedDeals: typeof createdDeals = [];
    if (assignedOnlyIds.length > 0) {
        assignedDeals = await db
            .select({
                id: deal.id,
                title: deal.title,
                value: deal.value,
                stage: deal.stage,
                partnerName: partner.name,
            })
            .from(deal)
            .leftJoin(partner, eq(deal.partnerId, partner.id))
            .where(
                and(
                    eq(deal.orgId, orgId),
                    inArray(deal.id, assignedOnlyIds)
                )
            );
    }

    return [...createdDeals, ...assignedDeals];
}

// Get objectives created by team members with progress
export async function getTeamObjectives(teamId: string, orgId: string) {
    const memberIds = await getTeamMemberUserIds(teamId);
    if (memberIds.length === 0) return [];

    const objectives = await db
        .select({
            id: objective.id,
            title: objective.title,
            startDate: objective.startDate,
            endDate: objective.endDate,
            partnerName: partner.name,
        })
        .from(objective)
        .leftJoin(partner, eq(objective.partnerId, partner.id))
        .where(
            and(
                eq(objective.orgId, orgId),
                inArray(objective.createdBy, memberIds)
            )
        );

    // Calculate progress for each objective
    const result = await Promise.all(
        objectives.map(async (obj) => {
            const keyResults = await db
                .select()
                .from(keyResult)
                .where(eq(keyResult.objectiveId, obj.id));

            let progress = 0;
            let status: "on_track" | "at_risk" | "off_track" = "on_track";

            if (keyResults.length > 0) {
                const total = keyResults.reduce((sum, kr) => {
                    const krProgress =
                        kr.targetValue > 0
                            ? (kr.currentValue / kr.targetValue) * 100
                            : 0;
                    return sum + Math.min(krProgress, 100);
                }, 0);
                progress = Math.round(total / keyResults.length);

                // Derive status from key results
                const atRiskCount = keyResults.filter((kr) => kr.status === "at_risk").length;
                const offTrackCount = keyResults.filter((kr) => kr.status === "off_track").length;

                if (offTrackCount > 0) {
                    status = "off_track";
                } else if (atRiskCount > 0) {
                    status = "at_risk";
                }
            }

            return { ...obj, progress, status };
        })
    );

    return result;
}

// Get activity logs by team members
export async function getTeamActivity(teamId: string, orgId: string) {
    const memberIds = await getTeamMemberUserIds(teamId);
    if (memberIds.length === 0) return [];

    return db
        .select({
            id: activityLog.id,
            action: activityLog.action,
            entityType: activityLog.entityType,
            entityId: activityLog.entityId,
            createdAt: activityLog.createdAt,
            userId: activityLog.userId,
            userName: user.name,
        })
        .from(activityLog)
        .leftJoin(user, eq(activityLog.userId, user.id))
        .where(
            and(
                eq(activityLog.orgId, orgId),
                inArray(activityLog.userId, memberIds)
            )
        )
        .orderBy(desc(activityLog.createdAt))
        .limit(50);
}
