export interface KeyResult {
    id: string;
    title: string;
    targetValue: number | string;
    currentValue: number | string;
    progress: number; // 0-100 percentage
}

export interface Objective {
    id: string;
    title: string;
    owner: string; // E.g., "Sales Team", "Growth Team"
    progress: number;
    deadline: string;
    status: 'On Track' | 'At Risk' | 'Behind' | 'Completed';
    keyResults: KeyResult[];
}

export interface PartnerPerformanceRecord {
    id: string;
    partnerName: string;
    score: number; // e.g., 82
    revenue: number; // e.g., 300000
    dealsClosed: number;
}

export interface OKRKpiMetrics {
    activeObjectives: number;
    completedObjectives: number;
    atRiskObjectives: number;
    averagePartnerScore: number;
}

export interface PerformanceChartData {
    month: string;
    score: number;
    revenue: number;
}
