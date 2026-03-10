import type { Objective, PartnerPerformanceRecord, OKRKpiMetrics, PerformanceChartData } from '@/types/okr';

export const mockOKRKpis: OKRKpiMetrics = {
    activeObjectives: 12,
    completedObjectives: 4,
    atRiskObjectives: 2,
    averagePartnerScore: 78
};

export const mockObjectives: Objective[] = [
    {
        id: "obj-1",
        title: "Increase Partner Sales",
        owner: "Sales Team",
        progress: 60,
        deadline: "Dec 2026",
        status: "On Track",
        keyResults: [
            { id: "kr-1-1", title: "Close 20 deals", targetValue: 20, currentValue: 12, progress: 60 },
            { id: "kr-1-2", title: "Reach $1M revenue", targetValue: "$1M", currentValue: "$600k", progress: 60 },
            { id: "kr-1-3", title: "Onboard 5 new partners", targetValue: 5, currentValue: 4, progress: 80 }
        ]
    },
    {
        id: "obj-2",
        title: "Expand Market Reach",
        owner: "Growth Team",
        progress: 40,
        deadline: "Nov 2026",
        status: "At Risk",
        keyResults: [
            { id: "kr-2-1", title: "Launch in 3 new regions", targetValue: 3, currentValue: 1, progress: 33 },
            { id: "kr-2-2", title: "Acquire 500 new leads", targetValue: 500, currentValue: 250, progress: 50 }
        ]
    },
    {
        id: "obj-3",
        title: "Improve Partner Satisfaction",
        owner: "Support Team",
        progress: 85,
        deadline: "Oct 2026",
        status: "On Track",
        keyResults: [
            { id: "kr-3-1", title: "Reduce response time to < 2hrs", targetValue: "2h", currentValue: "1.5h", progress: 100 },
            { id: "kr-3-2", title: "Achieve 90% NPS score", targetValue: 90, currentValue: 75, progress: 83 }
        ]
    }
];

export const mockPartnerPerformance: PartnerPerformanceRecord[] = [
    { id: "pp-1", partnerName: "TechCorp", score: 82, revenue: 300000, dealsClosed: 5 },
    { id: "pp-2", partnerName: "CloudX", score: 76, revenue: 200000, dealsClosed: 3 },
    { id: "pp-3", partnerName: "Global Solutions", score: 91, revenue: 550000, dealsClosed: 9 },
    { id: "pp-4", partnerName: "Innovate Partners", score: 65, revenue: 120000, dealsClosed: 2 }
];

export const mockPerformanceChartData: PerformanceChartData[] = [
    { month: "Jan", score: 72, revenue: 40000 },
    { month: "Feb", score: 74, revenue: 55000 },
    { month: "Mar", score: 76, revenue: 50000 },
    { month: "Apr", score: 75, revenue: 65000 },
    { month: "May", score: 78, revenue: 80000 },
    { month: "Jun", score: 80, revenue: 95000 }
];
