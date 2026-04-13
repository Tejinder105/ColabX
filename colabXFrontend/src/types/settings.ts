export type UserRole = 'Admin' | 'Manager' | 'Partner' | 'User';
export type UserStatus = 'Active' | 'Invited' | 'Suspended';

export interface OrgUser {
    orgUserId?: string;
    invitationId?: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    lastActive?: string;
}

export interface OrgProfile {
    name: string;
    industry: string;
    domain: string;
    employeeCount: string;
    establishedYear: number;
}

export interface PermissionMatrix {
    feature: string;
    admin: boolean;
    manager: boolean;
    partner: boolean;
}

export interface AuditLogEntry {
    activityLogId: string;
    timestamp: string;
    user: string;
    action: string;
    target: string;
    ipAddress?: string;
}

export interface OrgTeamData {
    id: string;
    name: string;
    leadName: string;
    memberCount: number;
    department: string;
}
