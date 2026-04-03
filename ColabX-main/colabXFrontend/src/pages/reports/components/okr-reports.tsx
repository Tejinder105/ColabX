import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import type { OKRReportSummary } from '@/types/report';
import { Progress } from '@/components/ui/progress';

export function OkrReports({ summary }: { summary: OKRReportSummary }) {
    const total = summary.objectivesCompleted + summary.objectivesAtRisk + summary.objectivesOnTrack;

    // Calculate percentages for visual bars
    const completedPct = Math.round((summary.objectivesCompleted / total) * 100) || 0;
    const atRiskPct = Math.round((summary.objectivesAtRisk / total) * 100) || 0;
    const onTrackPct = Math.round((summary.objectivesOnTrack / total) * 100) || 0;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Team Score</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.averageTeamPerformance}/100</div>
                        <Progress value={summary.averageTeamPerformance} className="h-2 mt-3 bg-blue-500/20" indicatorClassName="bg-blue-500" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.objectivesCompleted}</div>
                        <Progress value={completedPct} className="h-2 mt-3 bg-emerald-500/20" indicatorClassName="bg-emerald-500" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Track</CardTitle>
                        <Target className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.objectivesOnTrack}</div>
                        <Progress value={onTrackPct} className="h-2 mt-3 bg-purple-500/20" indicatorClassName="bg-purple-500" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">At Risk</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">{summary.objectivesAtRisk}</div>
                        <Progress value={atRiskPct} className="h-2 mt-3 bg-amber-500/20" indicatorClassName="bg-amber-500" />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Objective Distribution</CardTitle>
                    <CardDescription>Breakdown of all {total} active and historical objectives for this cycle.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-8 flex rounded-md overflow-hidden bg-muted">
                        <div style={{ width: `${completedPct}%` }} className="bg-emerald-500 hover:opacity-90 transition-opacity" title={`Completed: ${completedPct}%`} />
                        <div style={{ width: `${onTrackPct}%` }} className="bg-purple-500 hover:opacity-90 transition-opacity" title={`On Track: ${onTrackPct}%`} />
                        <div style={{ width: `${atRiskPct}%` }} className="bg-amber-500 hover:opacity-90 transition-opacity" title={`At Risk: ${atRiskPct}%`} />
                    </div>
                    <div className="flex items-center gap-6 mt-4 text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>Completed ({completedPct}%)</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500"></span>On Track ({onTrackPct}%)</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span>At Risk ({atRiskPct}%)</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
