export type PartnerStage = "Prospect" | "Onboarding" | "Active" | "Churned";
export type PartnerType = "Technology" | "Agency" | "Reseller" | "Strategic";
export type Industry = "Finance" | "Healthcare" | "Retail" | "Manufacturing" | "Software" | "Defense" | "Other";
export type HealthStatus = "Good" | "Average" | "Poor";
export type UIStatus = "Green" | "Yellow" | "Red";

export interface PartnerContact {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    avatarUrl?: string;
}

export interface PartnerActivity {
    id: string;
    type: "Meeting" | "Email" | "Call" | "Note" | "Deal Created";
    description: string;
    date: string;
}

export interface PartnerDeal {
    id: string;
    name: string;
    amount: number;
    stage: "Discovery" | "Proposal" | "Negotiation" | "Closed Won" | "Closed Lost";
    expectedCloseDate: string;
}

export interface PartnerDocument {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
    url?: string;
}

export interface PartnerCommunication {
    id: string;
    sender: string;
    subject: string;
    snippet: string;
    date: string;
    isUnread: boolean;
}

export interface ChartDataPoint {
    date: string;
    score?: number;
    deals?: number;
    revenue?: number;
}

export interface Partner {
    id: string;
    name: string;
    logoUrl?: string;
    type: PartnerType;
    industry: Industry;
    ownerName: string;
    stage: PartnerStage;
    healthScore: number;
    healthStatus: HealthStatus;
    uiStatus: UIStatus;
    performanceScore: number;
    openDealsCount: number;
    openDealsValue: number;
    lastActivityDate: string;
    nextActionDue: string | null;
    region: string;
    tags: string[];

    // Detailed info for page
    overview?: string;
    contacts: PartnerContact[];
    activities: PartnerActivity[];
    activeDeals: PartnerDeal[];
    okrs?: { title: string; target: string; current: string; status: UIStatus }[];
    documents?: PartnerDocument[];
    communications?: PartnerCommunication[];
    performanceHistory?: ChartDataPoint[];
    revenueHistory?: ChartDataPoint[];
    notes?: string;
}
