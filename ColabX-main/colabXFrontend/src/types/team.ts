export interface Team {
    id: string;
    name: string;
    description?: string;
    leadName: string;
    leadId?: string;
    memberCount: number;
    partnersManagedCount: number;
    dealsCount: number;
    status: 'Active' | 'Inactive';
    createdAt?: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    avatarUrl?: string;
}

export interface TeamPartner {
    id: string;
    name: string;
    type: string;
    status: 'Active' | 'Inactive' | 'Pending';
}

export interface TeamDeal {
    id: string;
    name: string;
    value: string;
    stage: string;
}

export interface TeamObjective {
    id: string;
    title: string;
    progress: number; // 0-100
    status: 'On Track' | 'At Risk' | 'Behind';
}

export interface TeamActivity {
    id: string;
    action: string;
    user: string;
    timestamp: string;
}
