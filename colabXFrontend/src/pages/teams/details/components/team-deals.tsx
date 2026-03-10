import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { TeamDeal } from '@/types/team';

export function TeamDeals({ deals }: { deals: TeamDeal[] }) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Deals Assigned</h3>
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Deal</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Stage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {deals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    No deals assigned yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            deals.map((deal) => (
                                <TableRow key={deal.id}>
                                    <TableCell className="font-medium">{deal.name}</TableCell>
                                    <TableCell>{deal.value}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{deal.stage}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
