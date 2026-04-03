import type { Deal, PipelineSummary } from '@/types/deal';

export const mockPipelineSummary: PipelineSummary = {
    leadCount: 10,
    proposalCount: 6,
    negotiationCount: 3,
    wonCount: 8,
    lostCount: 2
};

export const mockDeals: Deal[] = [
    {
        id: "deal-1",
        name: "Enterprise SaaS Rollout",
        partnerName: "TechCorp",
        value: 200000,
        stage: "Negotiation",
        assignedTeam: "Sales Team",
        lastUpdated: "2024-03-01",
        messages: [
            { id: "msg-1", sender: "Rahul", senderRole: "Manager", content: "Updated the proposal to include volume discounts.", timestamp: "2 hours ago" },
            { id: "msg-2", sender: "Sarah (TechCorp)", senderRole: "Partner", content: "Thanks. I've shared the contract draft with legal. We should have feedback by tomorrow.", timestamp: "1 hour ago" }
        ],
        documents: [
            { id: "doc-1", name: "SaaS_Proposal_v2.pdf", type: "PDF", size: "1.2 MB", uploadedBy: "Rahul", uploadedAt: "Yesterday" },
            { id: "doc-2", name: "TechCorp_Draft_Contract.docx", type: "Word", size: "450 KB", uploadedBy: "Sarah", uploadedAt: "Today" }
        ],
        activity: [
            { id: "act-1", action: "Deal stage moved from Proposal to Negotiation", user: "Rahul", timestamp: "Yesterday" },
            { id: "act-2", action: "Sarah attached TechCorp_Draft_Contract.docx", user: "System", timestamp: "Today" }
        ]
    },
    {
        id: "deal-2",
        name: "Cloud Migration Project",
        partnerName: "CloudX",
        value: 150000,
        stage: "Proposal",
        assignedTeam: "Enterprise Team",
        lastUpdated: "2024-02-28",
        messages: [
            { id: "msg-3", sender: "Priya", senderRole: "Manager", content: "Sent the initial CloudX quote.", timestamp: "2 days ago" }
        ],
        documents: [],
        activity: [
            { id: "act-3", action: "Deal created. Stage: Lead", user: "Priya", timestamp: "Last week" },
            { id: "act-4", action: "Stage changed to Proposal", user: "Priya", timestamp: "2 days ago" }
        ]
    },
    {
        id: "deal-3",
        name: "Global Security Implementation",
        partnerName: "Global Solutions",
        value: 500000,
        stage: "Won",
        assignedTeam: "Enterprise Team",
        lastUpdated: "2024-02-15",
        messages: [],
        documents: [
            { id: "doc-3", name: "Signed_Contract.pdf", type: "PDF", size: "3.1 MB", uploadedBy: "Priya", uploadedAt: "Feb 15, 2024" }
        ],
        activity: [
            { id: "act-5", action: "Contract signed! Deal Won.", user: "Priya", timestamp: "Feb 15, 2024" }
        ]
    },
    {
        id: "deal-4",
        name: "Regional Hardware Refresh",
        partnerName: "Innovate Partners",
        value: 75000,
        stage: "Lead",
        assignedTeam: "Partner Growth",
        lastUpdated: "2024-03-02",
        messages: [],
        documents: [],
        activity: [
            { id: "act-6", action: "Added as new lead.", user: "System", timestamp: "2024-03-02" }
        ]
    }
];
