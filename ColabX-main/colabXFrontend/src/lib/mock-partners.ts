import type { Partner } from "../types/partner";

export const mockPartners: Partner[] = [
    {
        id: "p-001",
        name: "Acme Corporation",
        type: "Technology",
        industry: "Software",
        ownerName: "Sarah Jenkins",
        stage: "Active",
        healthScore: 92,
        healthStatus: "Good",
        uiStatus: "Green",
        performanceScore: 88,
        openDealsCount: 3,
        openDealsValue: 150000,
        lastActivityDate: "2024-03-01T10:00:00Z",
        nextActionDue: "2024-03-10T00:00:00Z",
        region: "North America",
        tags: ["Enterprise", "SaaS"],
        overview: "Acme Corp is a leading provider of cloud infrastructure services. We partner with them to offer bundled solutions to enterprise clients.",
        contacts: [
            { id: "c-01", name: "John Doe", email: "john@acme.com", role: "VP Partnerships" }
        ],
        activities: [
            { id: "a-01", type: "Meeting", description: "Quarterly Business Review", date: "2024-03-01T10:00:00Z" }
        ],
        activeDeals: [
            { id: "d-01", name: "Project Alpha Integration", amount: 50000, stage: "Proposal", expectedCloseDate: "2024-04-15" }
        ],
        okrs: [
            { title: "Generate $500k in joint pipeline by Q2", target: "$500,000", current: "$320,000", status: "Green" },
            { title: "Train 50 sales reps on integration", target: "50 reps", current: "15 reps", status: "Yellow" }
        ],
        documents: [
            { id: "doc-1", name: "Acme_MSA_2024.pdf", type: "application/pdf", size: "2.4 MB", uploadDate: "2024-01-15T00:00:00Z" }
        ],
        communications: [
            { id: "msg-1", sender: "John Doe (Acme)", subject: "Re: QBR Follow up", snippet: "Thanks for the great session yesterday, the team is excited about the new integration...", date: "2024-03-02T14:30:00Z", isUnread: true }
        ],
        performanceHistory: [
            { date: "Oct", score: 75, deals: 1 },
            { date: "Nov", score: 82, deals: 2 },
            { date: "Dec", score: 85, deals: 2 },
            { date: "Jan", score: 90, deals: 4 },
            { date: "Feb", score: 88, deals: 3 },
            { date: "Mar", score: 92, deals: 5 }
        ],
        revenueHistory: [
            { date: "Oct", revenue: 10000 },
            { date: "Nov", revenue: 25000 },
            { date: "Dec", revenue: 40000 },
            { date: "Jan", revenue: 45000 },
            { date: "Feb", revenue: 60000 },
            { date: "Mar", revenue: 85000 }
        ],
        notes: "Very engaged partner. Look to expand into EMEA region soon."
    },
    {
        id: "p-002",
        name: "Global Syndicate",
        type: "Agency",
        industry: "Retail",
        ownerName: "Mike Ross",
        stage: "Active",
        healthScore: 75,
        healthStatus: "Average",
        uiStatus: "Yellow",
        performanceScore: 70,
        openDealsCount: 1,
        openDealsValue: 25000,
        lastActivityDate: "2024-02-15T14:30:00Z",
        nextActionDue: "2024-03-05T00:00:00Z",
        region: "EMEA",
        tags: ["Marketing", "Mid-Market"],
        overview: "Digital marketing agency reselling our platform to their mid-market clients.",
        contacts: [],
        activities: [],
        activeDeals: [],
    },
    {
        id: "p-003",
        name: "Stark Industries",
        type: "Strategic",
        industry: "Defense",
        ownerName: "Sarah Jenkins",
        stage: "Onboarding",
        healthScore: 88,
        healthStatus: "Good",
        uiStatus: "Green",
        performanceScore: 85,
        openDealsCount: 0,
        openDealsValue: 0,
        lastActivityDate: "2024-03-03T09:15:00Z",
        nextActionDue: "2024-03-07T00:00:00Z",
        region: "North America",
        tags: ["Defense", "Enterprise"],
        overview: "Major strategic partner. Currently in technical onboarding phase.",
        contacts: [],
        activities: [],
        activeDeals: [],
    },
    {
        id: "p-004",
        name: "Wayne Enterprises",
        type: "Strategic",
        industry: "Other",
        ownerName: "Bruce Wayne",
        stage: "Active",
        healthScore: 45,
        healthStatus: "Poor",
        uiStatus: "Red",
        performanceScore: 35,
        openDealsCount: 2,
        openDealsValue: 400000,
        lastActivityDate: "2024-01-20T11:00:00Z",
        nextActionDue: "2024-02-01T00:00:00Z", // Overdue
        region: "Global",
        tags: ["Enterprise", "At-Risk"],
        overview: "Historical partner but engagement has dropped significantly in Q1.",
        contacts: [],
        activities: [],
        activeDeals: [],
        notes: "Need executive sponsorship to get this back on track."
    },
    {
        id: "p-005",
        name: "Goliath National Bank",
        type: "Reseller",
        industry: "Finance",
        ownerName: "Barney Stinson",
        stage: "Prospect",
        healthScore: 60,
        healthStatus: "Average",
        uiStatus: "Yellow",
        performanceScore: 50,
        openDealsCount: 5,
        openDealsValue: 120000,
        lastActivityDate: "2024-03-02T16:45:00Z",
        nextActionDue: null,
        region: "North America",
        tags: ["Finance", "Referral"],
        overview: "Evaluating our partner program for their business clients.",
        contacts: [],
        activities: [],
        activeDeals: [],
    }
];

export const mockKpis = {
    totalPartners: 142,
    activePartners: 89,
    atRiskPartners: 12,
    newPartnersThisMonth: 8,
    pipelineDealsValue: 2450000,
    pipelineDealsCount: 45
};
