import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Target } from 'lucide-react';
import type { Objective } from '@/types/okr';

export function ObjectivesTable({ objectives }: { objectives: Objective[] }) {
    // Array of expanded Objective IDs
    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    const toggleRow = (id: string) => {
        setExpandedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'On Track': return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">On Track</Badge>;
            case 'At Risk': return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">At Risk</Badge>;
            case 'Behind': return <Badge variant="destructive">Behind</Badge>;
            case 'Completed': return <Badge variant="default">Completed</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="border rounded-md mt-4 bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px]"></TableHead>
                        <TableHead>Objective</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead className="w-[200px]">Progress</TableHead>
                        <TableHead>Deadline</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {objectives.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                                No objectives found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        objectives.map((objective) => (
                            <React.Fragment key={objective.id}>
                                <TableRow className="group cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => toggleRow(objective.id)}>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0 pointer-events-none">
                                            {expandedRows.includes(objective.id) ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium text-base">{objective.title}</TableCell>
                                    <TableCell>{objective.owner}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={objective.progress} className="h-2 flex-1" />
                                            <span className="text-sm font-medium w-9">{objective.progress}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{objective.deadline}</TableCell>
                                    <TableCell>{getStatusBadge(objective.status)}</TableCell>
                                </TableRow>

                                {expandedRows.includes(objective.id) && (
                                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                                        <TableCell colSpan={6} className="p-0 border-b-0">
                                            <div className="pl-14 pr-6 py-4 border-l-2 border-emerald-500 ml-4 mb-4 mt-2 bg-background rounded-r-md shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Target className="h-4 w-4 text-emerald-500" />
                                                    <h4 className="font-semibold text-sm">Key Results</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    {objective.keyResults.map((kr) => (
                                                        <div key={kr.id} className="grid grid-cols-[1fr_200px_minmax(120px,auto)] items-center gap-6">
                                                            <span className="text-sm text-muted-foreground font-medium">{kr.title}</span>
                                                            <div className="flex items-center gap-3">
                                                                <Progress value={kr.progress} className="h-1.5 flex-1" />
                                                                <span className="text-xs font-semibold w-8 text-right">{kr.progress}%</span>
                                                            </div>
                                                            <div className="text-xs text-right text-muted-foreground">
                                                                <span className="font-medium text-foreground">{kr.currentValue}</span> / {kr.targetValue}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

// Adding React import for Fragment in a separate logic step to avoid inline import mess.
