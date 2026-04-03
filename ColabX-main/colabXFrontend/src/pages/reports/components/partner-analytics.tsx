import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { PartnerReportMetric } from '@/types/report';

interface PartnerAnalyticsProps {
    topPartners: PartnerReportMetric[];
    underperformingPartners: PartnerReportMetric[];
}

export function PartnerAnalytics({ topPartners, underperformingPartners }: PartnerAnalyticsProps) {
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
    }).format(val);

    const getGrowthBadge = (percent: number) => {
        if (percent >= 0) {
            return (
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{percent}%
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="bg-destructive/10 text-destructive gap-1">
                <TrendingDown className="h-3 w-3" />
                {percent}%
            </Badge>
        );
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-emerald-500/20">
                <CardHeader className="bg-emerald-500/5 border-b pb-4">
                    <CardTitle className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Top Performing Partners</CardTitle>
                    <CardDescription>Partners driving the most revenue and growth.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-6">Partner</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Revenue</TableHead>
                                <TableHead className="text-right pr-6">Growth</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topPartners.map((p) => (
                                <TableRow key={p.partnerName} className="hover:bg-muted/50">
                                    <TableCell className="pl-6 font-medium">{p.partnerName}</TableCell>
                                    <TableCell>{p.performanceScore}</TableCell>
                                    <TableCell>{formatCurrency(p.revenue)}</TableCell>
                                    <TableCell className="text-right pr-6">{getGrowthBadge(p.growthPercent)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="border-destructive/20">
                <CardHeader className="bg-destructive/5 border-b pb-4">
                    <CardTitle className="text-lg font-semibold text-destructive">Needs Attention</CardTitle>
                    <CardDescription>Underperforming partners or declining metrics.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="pl-6">Partner</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Deals</TableHead>
                                <TableHead className="text-right pr-6">Growth</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {underperformingPartners.map((p) => (
                                <TableRow key={p.partnerName} className="hover:bg-muted/50">
                                    <TableCell className="pl-6 font-medium">{p.partnerName}</TableCell>
                                    <TableCell>{p.performanceScore}</TableCell>
                                    <TableCell>{p.dealsClosed}</TableCell>
                                    <TableCell className="text-right pr-6">{getGrowthBadge(p.growthPercent)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
