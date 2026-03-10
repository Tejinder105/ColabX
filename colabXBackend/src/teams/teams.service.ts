import { eq, and, count } from "drizzle-orm";
import db from "../db/index.js";
import { team, teamMember } from "./teams.schema.js";
import { orgUser } from "../schemas/orgSchema.js";
import { user } from "../schemas/authSchema.js";

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
