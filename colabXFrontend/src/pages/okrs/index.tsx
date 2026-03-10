import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OkrsHeader } from './components/okr-header';
import { OkrKpiStrip } from './components/okr-kpi-strip';
import { ObjectivesTable } from './components/objectives-table';
import { PerformanceTable } from './components/performance-table';
import { PerformanceCharts } from './components/performance-charts';

import {
    mockOKRKpis,
    mockObjectives,
    mockPartnerPerformance,
    mockPerformanceChartData
} from '@/lib/mock-okrs';

export default function OkrsPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <OkrsHeader />
            <OkrKpiStrip data={mockOKRKpis} />

            <Tabs defaultValue="objectives" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-2 h-auto max-w-[400px]">
                    <TabsTrigger value="objectives" className="py-2">Objectives List</TabsTrigger>
                    <TabsTrigger value="performance" className="py-2">Partner Performance</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="objectives" className="m-0 space-y-4">
                        <ObjectivesTable objectives={mockObjectives} />
                    </TabsContent>

                    <TabsContent value="performance" className="m-0 space-y-6">
                        <PerformanceCharts data={mockPerformanceChartData} />
                        <PerformanceTable records={mockPartnerPerformance} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
