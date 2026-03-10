import type { OrgUser, OrgProfile, PermissionMatrix, AuditLogEntry, OrgTeamData } from '@/types/settings';

export const mockOrgProfile: OrgProfile = {
    name: "Acme Corporation",
    industry: "Enterprise Software",
    domain: "acmecorp.com",
    employeeCount: "100-500",
    establishedYear: 2015
};

export const mockUsers: OrgUser[] = [
    { id: "u-1", name: "Sarah Connor", email: "sarah@acmecorp.com", role: "Admin", status: "Active", lastActive: "Just now" },
    { id: "u-2", name: "Rahul Singh", email: "rahul@acmecorp.com", role: "Manager", status: "Active", lastActive: "2 hours ago" },
    { id: "u-3", name: "Priya Patel", email: "priya@acmecorp.com", role: "Manager", status: "Active", lastActive: "Yesterday" },
    { id: "u-4", name: "David Chen", email: "david@acmecorp.com", role: "User", status: "Invited" },
    { id: "u-5", name: "Michael Chang", email: "m.chang@techcorp.com", role: "Partner", status: "Active", lastActive: "4 hours ago" },
    { id: "u-6", name: "Emma Watson", email: "emma@acmecorp.com", role: "User", status: "Suspended", lastActive: "1 month ago" }
];

export const mockTeamsSettings: OrgTeamData[] = [
    { id: "t-1", name: "Enterprise Sales", leadName: "Rahul Singh", memberCount: 12, department: "Sales" },
    { id: "t-2", name: "Partner Success", leadName: "Priya Patel", memberCount: 8, department: "Support" },
    { id: "t-3", name: "Integration Engineers", leadName: "John Doe", memberCount: 5, department: "Engineering" },
    { id: "t-4", name: "Marketing Strategy", leadName: "Sarah Connor", memberCount: 6, department: "Marketing" }
];

export const mockPermissions: PermissionMatrix[] = [
    { feature: "Manage Organization Profile", admin: true, manager: false, partner: false },
    { feature: "Invite New Users", admin: true, manager: true, partner: false },
    { feature: "Manage Teams", admin: true, manager: true, partner: false },
    { feature: "View All Deals", admin: true, manager: true, partner: false },
    { feature: "View Assigned Deals", admin: true, manager: true, partner: true },
    { feature: "Upload Documents", admin: true, manager: true, partner: true },
    { feature: "Delete Documents", admin: true, manager: false, partner: false },
    { feature: "Access Audit Logs", admin: true, manager: false, partner: false }
];

export const mockAuditLogs: AuditLogEntry[] = [
    { id: "log-1", timestamp: "2024-03-04 14:30:22", user: "Sarah Connor", action: "Updated Profile", target: "Organization Settings", ipAddress: "192.168.1.45" },
    { id: "log-2", timestamp: "2024-03-04 11:15:00", user: "Rahul Singh", action: "Invited User", target: "David Chen (User)", ipAddress: "192.168.1.102" },
    { id: "log-3", timestamp: "2024-03-03 09:45:12", user: "Priya Patel", action: "Created Deal", target: "Enterprise SaaS Rollout", ipAddress: "10.0.0.15" },
    { id: "log-4", timestamp: "2024-03-02 16:20:05", user: "System", action: "Suspended User", target: "Emma Watson", ipAddress: "Internal" },
    { id: "log-5", timestamp: "2024-03-01 10:05:44", user: "Michael Chang", action: "Uploaded Document", target: "TechCorp_Contract_v2.pdf", ipAddress: "172.16.254.1" },
];
