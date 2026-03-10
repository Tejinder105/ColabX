import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportsHeader } from './components/reports-header';
import { PerformanceCharts } from './components/performance-charts';
import { OkrReports } from './components/okr-reports';
import { PartnerAnalytics } from './components/partner-analytics';
import { mockAnalyticsData } from '@/lib/mock-reports';
import { BarChart, Target, Users } from 'lucide-react';

export default function ReportsPage() {
    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <ReportsHeader />

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
                    <PerformanceCharts
                        revenueData={mockAnalyticsData.revenueTrend}
                        partnerData={mockAnalyticsData.topPartners}
                    />
                </TabsContent>

                <TabsContent value="okrs" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                    <OkrReports summary={mockAnalyticsData.okrSummary} />
                </TabsContent>

                <TabsContent value="partners" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                    <PartnerAnalytics
                        topPartners={mockAnalyticsData.topPartners}
                        underperformingPartners={mockAnalyticsData.underperformingPartners}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
