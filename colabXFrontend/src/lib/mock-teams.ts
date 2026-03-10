import type { Team, TeamMember, TeamPartner, TeamDeal, TeamObjective, TeamActivity } from '@/types/team';

export const mockTeams: Team[] = [
    {
        id: "t-1001",
        name: "Sales Team",
        description: "Manages core enterprise sales and partner onboarding.",
        leadName: "Rahul",
        memberCount: 5,
        partnersManagedCount: 8,
        dealsCount: 12,
        status: "Active",
        createdAt: "2024-01-15"
    },
    {
        id: "t-1002",
        name: "Partner Growth",
        description: "Focuses on growing and nurturing existing partner accounts.",
        leadName: "Aman",
        memberCount: 4,
        partnersManagedCount: 5,
        dealsCount: 7,
        status: "Active",
        createdAt: "2024-02-20"
    },
    {
        id: "t-1003",
        name: "Enterprise Team",
        description: "Dedicated to large scale enterprise partnerships and deals.",
        leadName: "Priya",
        memberCount: 6,
        partnersManagedCount: 10,
        dealsCount: 20,
        status: "Active",
        createdAt: "2024-03-10"
    }
];

export const mockTeamKpis = [
    {
        title: 'Total Teams',
        value: '12',
        trend: '+2 from last month',
        trendUp: true
    },
    {
        title: 'Total Team Members',
        value: '48',
        trend: '+5 from last month',
        trendUp: true
    },
    {
        title: 'Active Teams',
        value: '10',
        trend: '83% active rate',
        trendUp: true
    },
    {
        title: 'Managers / Team Leads',
        value: '12',
        trend: '1 per team average',
        trendUp: true
    }
];

export const mockTeamMembers: TeamMember[] = [
    { id: "m-1", name: "Rahul", role: "Team Lead", email: "rahul@email.com" },
    { id: "m-2", name: "Aman", role: "Member", email: "aman@email.com" },
    { id: "m-3", name: "Priya", role: "Member", email: "priya@email.com" }
];

export const mockTeamPartners: TeamPartner[] = [
    { id: "p-1", name: "TechCorp", type: "Reseller", status: "Active" },
    { id: "p-2", name: "CloudX", type: "Technology", status: "Active" }
];

export const mockTeamDeals: TeamDeal[] = [
    { id: "d-1", name: "Enterprise SaaS Contract", value: "$200k", stage: "Negotiation" },
    { id: "d-2", name: "Cloud Migration Project", value: "$150k", stage: "Proposal" }
];

export const mockTeamObjectives: TeamObjective[] = [
    { id: "o-1", title: "Increase partner revenue", progress: 55, status: "On Track" },
    { id: "o-2", title: "Onboard 5 new tech partners", progress: 80, status: "On Track" }
];

export const mockTeamActivity: TeamActivity[] = [
    { id: "a-1", action: "Rahul assigned an enterprise deal to Aman", user: "Rahul", timestamp: "2 hours ago" },
    { id: "a-2", action: "Priya updated partner performance metrics", user: "Priya", timestamp: "5 hours ago" },
    { id: "a-3", action: "New partner CloudX added to team portfolio", user: "System", timestamp: "1 day ago" }
];
