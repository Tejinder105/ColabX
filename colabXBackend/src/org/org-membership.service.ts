import { and, eq, inArray, ne } from "drizzle-orm";
import db from "../db/index.js";
import { orgUser, type organization } from "../schemas/orgSchema.js";
import {
    INTERNAL_ORG_ROLES,
    type InternalOrgRole,
    type OrgRole,
    isInternalOrgRole,
} from "./org.constants.js";

export interface OrgMembershipRecord {
    id: string;
    orgId: string;
    userId: string;
    role: OrgRole;
    joinedAt: Date;
}

export async function getUserMemberships(userId: string) {
    return db
        .select({
            id: orgUser.id,
            orgId: orgUser.orgId,
            userId: orgUser.userId,
            role: orgUser.role,
            joinedAt: orgUser.joinedAt,
        })
        .from(orgUser)
        .where(eq(orgUser.userId, userId));
}

export async function getUserInternalMemberships(
    userId: string,
    options?: { excludeOrgId?: string }
) {
    const conditions = [
        eq(orgUser.userId, userId),
        inArray(orgUser.role, [...INTERNAL_ORG_ROLES] as InternalOrgRole[]),
    ];

    if (options?.excludeOrgId) {
        conditions.push(ne(orgUser.orgId, options.excludeOrgId));
    }

    return db
        .select({
            id: orgUser.id,
            orgId: orgUser.orgId,
            userId: orgUser.userId,
            role: orgUser.role,
            joinedAt: orgUser.joinedAt,
        })
        .from(orgUser)
        .where(and(...conditions));
}

export async function hasInternalMembership(
    userId: string,
    options?: { excludeOrgId?: string }
) {
    const memberships = await getUserInternalMemberships(userId, options);
    return memberships.length > 0;
}

export async function ensureRoleAssignmentAllowed(
    userId: string,
    role: OrgRole,
    options?: { orgId?: string }
) {
    if (!isInternalOrgRole(role)) {
        return { allowed: true as const };
    }

    const existing = await getUserInternalMemberships(userId, options?.orgId ? { excludeOrgId: options.orgId } : undefined);

    if (existing.length > 0) {
        return {
            allowed: false as const,
            error:
                "Internal users can belong to exactly one organization. This user already has an internal membership.",
        };
    }

    return { allowed: true as const };
}

export async function getMembershipForUserInOrg(orgId: string, userId: string) {
    const [membership] = await db
        .select({
            id: orgUser.id,
            orgId: orgUser.orgId,
            userId: orgUser.userId,
            role: orgUser.role,
            joinedAt: orgUser.joinedAt,
        })
        .from(orgUser)
        .where(and(eq(orgUser.orgId, orgId), eq(orgUser.userId, userId)))
        .limit(1);

    return membership;
}

export async function getOrganizationMembersByRoles(
    orgId: string,
    roles: OrgRole[]
) {
    if (roles.length === 0) {
        return [];
    }

    return db
        .select({
            id: orgUser.id,
            orgId: orgUser.orgId,
            userId: orgUser.userId,
            role: orgUser.role,
            joinedAt: orgUser.joinedAt,
        })
        .from(orgUser)
        .where(and(eq(orgUser.orgId, orgId), inArray(orgUser.role, roles)));
}
