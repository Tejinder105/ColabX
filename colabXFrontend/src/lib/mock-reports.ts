import type { DashboardAnalytics } from '@/types/report';

export const mockAnalyticsData: DashboardAnalytics = {
    topPartners: [
        { partnerName: "Global Solutions", performanceScore: 94, revenue: 550000, dealsClosed: 12, growthPercent: 18 },
        { partnerName: "TechCorp", performanceScore: 88, revenue: 420000, dealsClosed: 8, growthPercent: 14 },
        { partnerName: "CloudX", performanceScore: 82, revenue: 310000, dealsClosed: 6, growthPercent: 5 }
    ],
    underperformingPartners: [
        { partnerName: "Legacy Systems Inc", performanceScore: 45, revenue: 35000, dealsClosed: 1, growthPercent: -12 },
        { partnerName: "Innovate Partners", performanceScore: 58, revenue: 75000, dealsClosed: 2, growthPercent: -4 }
    ],
    revenueTrend: [
        { month: "Jan", revenue: 150000, deals: 8 },
        { month: "Feb", revenue: 220000, deals: 12 },
        { month: "Mar", revenue: 180000, deals: 10 },
        { month: "Apr", revenue: 290000, deals: 18 },
        { month: "May", revenue: 350000, deals: 21 },
        { month: "Jun", revenue: 420000, deals: 25 },
        { month: "Jul", revenue: 510000, deals: 30 }
    ],
    okrSummary: {
        objectivesCompleted: 14,
        objectivesAtRisk: 3,
        objectivesOnTrack: 28,
        averageTeamPerformance: 85
    }
};
