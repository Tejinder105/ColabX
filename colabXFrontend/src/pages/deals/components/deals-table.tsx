
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, FileText, CheckCircle2, Handshake, CircleDashed, Users, XCircle } from 'lucide-react';
import type { Deal, DealStage } from '@/types/deal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DealsTableProps {
    deals: Deal[];
    onRowClick: (deal: Deal) => void;
}

export function DealsTable({ deals, onRowClick }: DealsTableProps) {
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
    }).format(val);

    const getStageBadge = (stage: DealStage) => {
        switch (stage) {
            case 'Lead': return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"><CircleDashed className="mr-1 h-3 w-3" />Lead</Badge>;
            case 'Proposal': return <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"><FileText className="mr-1 h-3 w-3" />Proposal</Badge>;
            case 'Negotiation': return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"><Handshake className="mr-1 h-3 w-3" />Negotiation</Badge>;
            case 'Won': return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"><CheckCircle2 className="mr-1 h-3 w-3" />Won</Badge>;
            case 'Lost': return <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20"><XCircle className="mr-1 h-3 w-3" />Lost</Badge>;
            default: return <Badge>{stage}</Badge>;
        }
    };

    return (
        <div className="border rounded-md bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Deal Name</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Stage</TableHead>
                        <TableHead>Assigned Team</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {deals.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-48 text-center">
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="bg-muted p-4 rounded-full">
                                        <Users className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold">No deals found</h3>
                                    <p className="text-muted-foreground max-w-sm">
                                        You don't have any deals yet. Try creating one!
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        deals.map((deal) => (
                            <TableRow
                                key={deal.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => onRowClick(deal)}
                            >
                                <TableCell className="font-medium text-base">{deal.name}</TableCell>
                                <TableCell>{deal.partnerName}</TableCell>
                                <TableCell className="font-medium">{formatCurrency(deal.value)}</TableCell>
                                <TableCell>{getStageBadge(deal.stage)}</TableCell>
                                <TableCell className="text-muted-foreground">{deal.assignedTeam}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRowClick(deal); }}>
                                                View details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Edit deal</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Update stage</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
