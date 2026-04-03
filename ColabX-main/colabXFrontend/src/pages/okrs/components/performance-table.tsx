import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { PartnerPerformanceRecord } from '@/types/okr';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export function PerformanceTable({ records }: { records: PartnerPerformanceRecord[] }) {

    // Format currency
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
    }).format(val);

    const getScoreDisplay = (score: number) => {
        if (score >= 80) return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500"><ArrowUpRight className="mr-1 h-3 w-3" />{score}</Badge>;
        if (score >= 60) return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500"><Minus className="mr-1 h-3 w-3" />{score}</Badge>;
        return <Badge variant="destructive"><ArrowDownRight className="mr-1 h-3 w-3" />{score}</Badge>;
    };

    return (
        <div className="border rounded-md mt-4 bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Partner</TableHead>
                        <TableHead>Performance Score</TableHead>
                        <TableHead>Revenue Impact</TableHead>
                        <TableHead className="text-right">Deals Closed</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                No performance data available.
                            </TableCell>
                        </TableRow>
                    ) : (
                        records.map((record) => (
                            <TableRow key={record.id} className="hover:bg-muted/50">
                                <TableCell className="font-medium text-base">{record.partnerName}</TableCell>
                                <TableCell>{getScoreDisplay(record.score)}</TableCell>
                                <TableCell className="font-medium">{formatCurrency(record.revenue)}</TableCell>
                                <TableCell className="text-right font-medium">{record.dealsClosed}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
