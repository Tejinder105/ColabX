import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Target, CheckCircle2, AlertCircle, BarChart2 } from 'lucide-react';
import type { OKRKpiMetrics } from '@/types/okr';

export function OkrKpiStrip({ data }: { data: OKRKpiMetrics }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Objectives</CardTitle>
                    <Target className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.activeObjectives}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Goals actively in progress
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Objectives</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data.completedObjectives}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Goals achieved successfully
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">At Risk Objectives</CardTitle>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-500">{data.atRiskObjectives}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Requires immediate attention
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Partner Score</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {data.averagePartnerScore > 0 ? data.averagePartnerScore : '—'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {data.averagePartnerScore > 0
                            ? 'Across all active partners'
                            : 'No partner data available'
                        }
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
