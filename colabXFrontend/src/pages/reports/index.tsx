import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportsHeader } from './components/reports-header';
import { PerformanceCharts } from './components/performance-charts';
import { OkrReports } from './components/okr-reports';
import { PartnerAnalytics } from './components/partner-analytics';
import { BarChart, Target, Users } from 'lucide-react';
import { useReportsDashboard } from '@/hooks/useReports';
import { Loader2 } from 'lucide-react';
import type { DashboardAnalytics } from '@/types/report';

function buildCsv(data: DashboardAnalytics): string {
    const rows: string[] = [];

    rows.push('Section,Metric,Value');
    rows.push(`OKR Summary,Objectives Completed,${data.okrSummary.objectivesCompleted}`);
    rows.push(`OKR Summary,Objectives On Track,${data.okrSummary.objectivesOnTrack}`);
    rows.push(`OKR Summary,Objectives At Risk,${data.okrSummary.objectivesAtRisk}`);
    rows.push(`OKR Summary,Average Team Performance,${data.okrSummary.averageTeamPerformance}`);

    rows.push('');
    rows.push('Revenue Trend');
    rows.push('Month,Revenue,Deals');
    data.revenueTrend.forEach((item) => {
        rows.push(`${item.month},${item.revenue},${item.deals}`);
    });

    rows.push('');
    rows.push('Top Partners');
    rows.push('Partner,Performance Score,Revenue,Deals Closed,Growth Percent');
    data.topPartners.forEach((item) => {
        rows.push(`${item.partnerName},${item.performanceScore},${item.revenue},${item.dealsClosed},${item.growthPercent}`);
    });

    rows.push('');
    rows.push('Underperforming Partners');
    rows.push('Partner,Performance Score,Revenue,Deals Closed,Growth Percent');
    data.underperformingPartners.forEach((item) => {
        rows.push(`${item.partnerName},${item.performanceScore},${item.revenue},${item.dealsClosed},${item.growthPercent}`);
    });

    return rows.join('\n');
}

export default function ReportsPage() {
    const { data, isLoading, isError, error } = useReportsDashboard();

    const handleExport = () => {
        if (!data) return;
        const csv = buildCsv(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `reports-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    };

    const analytics = data ?? {
        topPartners: [],
        underperformingPartners: [],
        revenueTrend: [],
        okrSummary: {
            objectivesCompleted: 0,
            objectivesAtRisk: 0,
            objectivesOnTrack: 0,
            averageTeamPerformance: 0,
        },
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <ReportsHeader onExport={handleExport} isExportDisabled={!data} />

            {isError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {error instanceof Error ? error.message : 'Failed to load reports'}
                </div>
            ) : null}

            <Tabs defaultValue="performance" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[600px] mb-6">
                    <TabsTrigger value="performance" className="flex items-center gap-2">
                        <BarChart className="w-4 h-4" /> Performance Reports
                    </TabsTrigger>
                    <TabsTrigger value="okrs" className="flex items-center gap-2">
                        <Target className="w-4 h-4" /> OKR Insights
                    </TabsTrigger>
                    <TabsTrigger value="partners" className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> Partner Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                    {isLoading ? (
                        <div className="rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
                            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                            Loading performance reports...
                        </div>
                    ) : (
                        <PerformanceCharts
                            revenueData={analytics.revenueTrend}
                            partnerData={analytics.topPartners}
                        />
                    )}
                </TabsContent>

                <TabsContent value="okrs" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                    {isLoading ? (
                        <div className="rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
                            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                            Loading OKR insights...
                        </div>
                    ) : (
                        <OkrReports summary={analytics.okrSummary} />
                    )}
                </TabsContent>

                <TabsContent value="partners" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                    {isLoading ? (
                        <div className="rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
                            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                            Loading partner analytics...
                        </div>
                    ) : (
                        <PartnerAnalytics
                            topPartners={analytics.topPartners}
                            underperformingPartners={analytics.underperformingPartners}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
