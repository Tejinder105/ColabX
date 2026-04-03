export type DealStage = 'Lead' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';

export interface DealMessage {
    id: string;
    sender: string;
    senderRole?: string; // e.g., 'Manager', 'Partner'
    avatarUrl?: string;
    content: string;
    timestamp: string;
}

export interface DealDocument {
    id: string;
    name: string;
    type: string; // e.g., 'PDF', 'Word'
    size: string; // e.g., '2.4 MB'
    uploadedBy: string;
    uploadedAt: string;
    url?: string;
}

export interface DealActivity {
    id: string;
    action: string;
    user: string;
    timestamp: string;
}

export interface Deal {
    id: string;
    name: string;
    partnerName: string;
    value: number; // Stored as a number for internal calculations, displayed formatted
    stage: DealStage;
    assignedTeam: string;
    createdAt?: string;
    lastUpdated?: string;
    messages?: DealMessage[];
    documents?: DealDocument[];
    activity?: DealActivity[];
}

export interface PipelineSummary {
    leadCount: number;
    proposalCount: number;
    negotiationCount: number;
    wonCount: number;
    lostCount: number;
}
