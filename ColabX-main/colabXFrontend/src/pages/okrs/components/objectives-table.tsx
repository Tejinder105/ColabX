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
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight, Loader2, Pencil, Plus, Save, Target, Trash2, X } from 'lucide-react';
import type { Objective } from '@/types/okr';

interface ObjectivesTableProps {
    objectives: Objective[];
    onUpdateObjective?: (objectiveId: string, input: { title?: string; endDate?: string }) => void;
    onDeleteObjective?: (objectiveId: string) => void;
    onCreateKeyResult?: (objectiveId: string, targetValue: number, currentValue: number) => void;
    onUpdateKeyResult?: (keyResultId: string, currentValue: number) => void;
    isMutating?: boolean;
}

export function ObjectivesTable({
    objectives,
    onUpdateObjective,
    onDeleteObjective,
    onCreateKeyResult,
    onUpdateKeyResult,
    isMutating,
}: ObjectivesTableProps) {
    // Array of expanded Objective IDs
    const [expandedRows, setExpandedRows] = useState<string[]>([]);
    const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDeadline, setEditDeadline] = useState('');
    const [keyResultDrafts, setKeyResultDrafts] = useState<Record<string, string>>({});
    const [newKeyResultDrafts, setNewKeyResultDrafts] = useState<
        Record<string, { targetValue: string; currentValue: string }>
    >({});

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

    const handleEditStart = (objective: Objective) => {
        setEditingObjectiveId(objective.id);
        setEditTitle(objective.title);
        setEditDeadline(objective.deadline);
    };

    const handleObjectiveSave = (objectiveId: string) => {
        if (!editTitle.trim() || !editDeadline) return;
        onUpdateObjective?.(objectiveId, { title: editTitle.trim(), endDate: editDeadline });
        setEditingObjectiveId(null);
    };

    const setNewKeyResultField = (objectiveId: string, field: 'targetValue' | 'currentValue', value: string) => {
        setNewKeyResultDrafts((prev) => ({
            ...prev,
            [objectiveId]: {
                targetValue: prev[objectiveId]?.targetValue ?? '',
                currentValue: prev[objectiveId]?.currentValue ?? '',
                [field]: value,
            },
        }));
    };

    const handleCreateKeyResult = (objectiveId: string) => {
        const draft = newKeyResultDrafts[objectiveId];
        const targetValue = Number(draft?.targetValue ?? NaN);
        const currentValue = Number(draft?.currentValue ?? NaN);

        if (!Number.isFinite(targetValue) || targetValue <= 0) return;
        if (!Number.isFinite(currentValue) || currentValue < 0) return;

        onCreateKeyResult?.(objectiveId, targetValue, currentValue);
        setNewKeyResultDrafts((prev) => ({
            ...prev,
            [objectiveId]: { targetValue: '', currentValue: '' },
        }));
    };

    const handleUpdateExistingKeyResult = (keyResultId: string, fallbackCurrentValue: number | string) => {
        const draftValue = keyResultDrafts[keyResultId];
        const resolved = draftValue !== undefined ? Number(draftValue) : Number(fallbackCurrentValue);
        if (!Number.isFinite(resolved) || resolved < 0) return;

        onUpdateKeyResult?.(keyResultId, resolved);
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
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {objectives.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
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
                                    <TableCell className="font-medium text-base">
                                        {editingObjectiveId === objective.id ? (
                                            <Input
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="h-8"
                                            />
                                        ) : (
                                            objective.title
                                        )}
                                    </TableCell>
                                    <TableCell>{objective.owner}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={objective.progress} className="h-2 flex-1" />
                                            <span className="text-sm font-medium w-9">{objective.progress}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {editingObjectiveId === objective.id ? (
                                            <Input
                                                type="date"
                                                value={editDeadline}
                                                onChange={(e) => setEditDeadline(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="h-8"
                                            />
                                        ) : (
                                            objective.deadline
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(objective.status)}</TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end gap-1">
                                            {editingObjectiveId === objective.id ? (
                                                <>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8"
                                                        onClick={() => handleObjectiveSave(objective.id)}
                                                        disabled={isMutating || !editTitle.trim() || !editDeadline}
                                                    >
                                                        {isMutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        onClick={() => setEditingObjectiveId(null)}
                                                        disabled={isMutating}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        className="h-8 w-8"
                                                        onClick={() => handleEditStart(objective)}
                                                        disabled={isMutating}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        className="h-8 w-8"
                                                        onClick={() => onDeleteObjective?.(objective.id)}
                                                        disabled={isMutating}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>

                                {expandedRows.includes(objective.id) && (
                                    <TableRow className="bg-muted/10 hover:bg-muted/10">
                                        <TableCell colSpan={7} className="p-0 border-b-0">
                                            <div className="pl-14 pr-6 py-4 border-l-2 border-emerald-500 ml-4 mb-4 mt-2 bg-background rounded-r-md shadow-sm">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Target className="h-4 w-4 text-emerald-500" />
                                                    <h4 className="font-semibold text-sm">Key Results</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    {objective.keyResults.map((kr) => (
                                                        <div key={kr.id} className="grid grid-cols-[1fr_200px_170px_auto] items-center gap-6">
                                                            <span className="text-sm text-muted-foreground font-medium">{kr.title}</span>
                                                            <div className="flex items-center gap-3">
                                                                <Progress value={kr.progress} className="h-1.5 flex-1" />
                                                                <span className="text-xs font-semibold w-8 text-right">{kr.progress}%</span>
                                                            </div>
                                                            <div className="flex items-center justify-end gap-2 text-xs text-right text-muted-foreground">
                                                                <Input
                                                                    type="number"
                                                                    min={0}
                                                                    value={keyResultDrafts[kr.id] ?? String(kr.currentValue)}
                                                                    onChange={(e) => {
                                                                        const value = e.target.value;
                                                                        setKeyResultDrafts((prev) => ({ ...prev, [kr.id]: value }));
                                                                    }}
                                                                    className="h-8 w-24 text-right"
                                                                />
                                                                <span>/ {kr.targetValue}</span>
                                                            </div>
                                                            <div className="flex justify-end">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleUpdateExistingKeyResult(kr.id, kr.currentValue)}
                                                                    disabled={isMutating}
                                                                >
                                                                    {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                                    Save
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <div className="grid grid-cols-[1fr_200px_170px_auto] items-center gap-6 pt-2 border-t">
                                                        <span className="text-sm text-muted-foreground font-medium">New Key Result</span>
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            placeholder="Target"
                                                            value={newKeyResultDrafts[objective.id]?.targetValue ?? ''}
                                                            onChange={(e) => setNewKeyResultField(objective.id, 'targetValue', e.target.value)}
                                                            className="h-8"
                                                        />
                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            placeholder="Current"
                                                            value={newKeyResultDrafts[objective.id]?.currentValue ?? ''}
                                                            onChange={(e) => setNewKeyResultField(objective.id, 'currentValue', e.target.value)}
                                                            className="h-8"
                                                        />
                                                        <div className="flex justify-end">
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleCreateKeyResult(objective.id)}
                                                                disabled={isMutating}
                                                            >
                                                                {isMutating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                                                Add KR
                                                            </Button>
                                                        </div>
                                                    </div>
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
