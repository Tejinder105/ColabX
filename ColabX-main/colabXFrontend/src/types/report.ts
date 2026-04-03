export interface PartnerReportMetric {
    partnerName: string;
    performanceScore: number;
    revenue: number;
    dealsClosed: number;
    growthPercent: number; // positive or negative
}

export interface MonthlyTrendData {
    month: string;
    revenue: number;
    deals: number;
}

export interface OKRReportSummary {
    objectivesCompleted: number;
    objectivesAtRisk: number;
    objectivesOnTrack: number;
    averageTeamPerformance: number;
}

export interface DashboardAnalytics {
    topPartners: PartnerReportMetric[];
    underperformingPartners: PartnerReportMetric[];
    revenueTrend: MonthlyTrendData[];
    okrSummary: OKRReportSummary;
}
