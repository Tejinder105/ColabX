export const ORG_ROLES = ["admin", "manager", "member", "partner"] as const;
export const INTERNAL_ORG_ROLES = ["admin", "manager", "member"] as const;
export const INVITABLE_ORG_ROLES = ["manager", "member", "partner"] as const;
export const TEAM_LEAD_ORG_ROLES = ["admin", "manager"] as const;
export const TEAM_MEMBER_ORG_ROLES = ["manager", "member"] as const;

export type OrgRole = (typeof ORG_ROLES)[number];
export type InternalOrgRole = (typeof INTERNAL_ORG_ROLES)[number];
export type InvitableOrgRole = (typeof INVITABLE_ORG_ROLES)[number];

export function isInternalOrgRole(role: OrgRole): role is InternalOrgRole {
    return (INTERNAL_ORG_ROLES as readonly string[]).includes(role);
}

export function isTeamLeadEligibleRole(role: OrgRole): boolean {
    return (TEAM_LEAD_ORG_ROLES as readonly string[]).includes(role);
}

export function isTeamMemberEligibleRole(role: OrgRole): boolean {
    return (TEAM_MEMBER_ORG_ROLES as readonly string[]).includes(role);
}

export function isInvitableOrgRole(role: string): role is InvitableOrgRole {
    return (INVITABLE_ORG_ROLES as readonly string[]).includes(role);
}
