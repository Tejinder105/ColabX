import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OkrsHeader } from './components/okr-header';
import { OkrKpiStrip } from './components/okr-kpi-strip';
import { ObjectivesTable } from './components/objectives-table';
import { PerformanceTable } from './components/performance-table';
import { PerformanceCharts } from './components/performance-charts';
import {
    useCreateKeyResultMutation,
    useDeleteObjectiveMutation,
    useOkrsDashboard,
    useUpdateKeyResultMutation,
    useUpdateObjectiveMutation,
} from '@/hooks/useOkrs';
import { useRbac } from '@/hooks/useRbac';
import { toast } from 'sonner';

export default function OkrsPage() {
    const { data, isLoading, isError, error } = useOkrsDashboard();
    const { isAdmin, isManager } = useRbac();
    const canManageOkrs = isAdmin || isManager;
    const canViewPartnerPerformance = canManageOkrs;
    const updateObjective = useUpdateObjectiveMutation();
    const deleteObjective = useDeleteObjectiveMutation();
    const createKeyResult = useCreateKeyResultMutation();
    const updateKeyResult = useUpdateKeyResultMutation();

    const kpis = data?.kpis ?? {
        activeObjectives: 0,
        completedObjectives: 0,
        atRiskObjectives: 0,
        averagePartnerScore: 0,
    };
    const objectives = data?.objectives ?? [];
    const partnerPerformance = data?.partnerPerformance ?? [];
    const performanceChartData = data?.performanceChartData ?? [];

    const handleUpdateObjective = (objectiveId: string, input: { title?: string; endDate?: string }) => {
        updateObjective.mutate(
            { objectiveId, input },
            {
                onSuccess: () => {
                    toast.success('Objective updated');
                },
                onError: (mutationError) => {
                    const message = mutationError instanceof Error ? mutationError.message : 'Failed to update objective';
                    toast.error(message);
                },
            }
        );
    };

    const handleDeleteObjective = (objectiveId: string) => {
        if (!window.confirm('Delete this objective? This action cannot be undone.')) return;

        deleteObjective.mutate(objectiveId, {
            onSuccess: () => {
                toast.success('Objective deleted');
            },
            onError: (mutationError) => {
                const message = mutationError instanceof Error ? mutationError.message : 'Failed to delete objective';
                toast.error(message);
            },
        });
    };

    const handleCreateKeyResult = (objectiveId: string, title: string, targetValue: number, currentValue: number) => {
        createKeyResult.mutate(
            { objectiveId, input: { title, targetValue, currentValue } },
            {
                onSuccess: () => {
                    toast.success('Key result created');
                },
                onError: (mutationError) => {
                    const message = mutationError instanceof Error ? mutationError.message : 'Failed to create key result';
                    toast.error(message);
                },
            }
        );
    };

    const handleUpdateKeyResult = (keyResultId: string, currentValue: number) => {
        updateKeyResult.mutate(
            { keyResultId, input: { currentValue } },
            {
                onSuccess: () => {
                    toast.success('Key result updated');
                },
                onError: (mutationError) => {
                    const message = mutationError instanceof Error ? mutationError.message : 'Failed to update key result';
                    toast.error(message);
                },
            }
        );
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <OkrsHeader />

            {isError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {error instanceof Error ? error.message : 'Failed to load OKR dashboard'}
                </div>
            ) : null}

            <OkrKpiStrip data={kpis} />

            <Tabs defaultValue="objectives" className="w-full mt-6">
                <TabsList className={`grid w-full h-auto max-w-[400px] ${canViewPartnerPerformance ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <TabsTrigger value="objectives" className="py-2">Objectives List</TabsTrigger>
                    {canViewPartnerPerformance && (
                        <TabsTrigger value="performance" className="py-2">Partner Performance</TabsTrigger>
                    )}
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="objectives" className="m-0 space-y-4">
                        {isLoading ? (
                            <div className="rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
                                Loading objectives...
                            </div>
                        ) : (
                            <ObjectivesTable
                                objectives={objectives}
                                onUpdateObjective={handleUpdateObjective}
                                onDeleteObjective={handleDeleteObjective}
                                onCreateKeyResult={handleCreateKeyResult}
                                onUpdateKeyResult={handleUpdateKeyResult}
                                isMutating={
                                    updateObjective.isPending ||
                                    deleteObjective.isPending ||
                                    createKeyResult.isPending ||
                                    updateKeyResult.isPending
                                }
                                canManage={canManageOkrs}
                            />
                        )}
                    </TabsContent>

                    {canViewPartnerPerformance && (
                        <TabsContent value="performance" className="m-0 space-y-6">
                            {isLoading ? (
                                <div className="rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
                                    Loading partner performance...
                                </div>
                            ) : (
                                <>
                                    <PerformanceCharts data={performanceChartData} />
                                    <PerformanceTable records={partnerPerformance} />
                                </>
                            )}
                        </TabsContent>
                    )}
                </div>
            </Tabs>
        </div>
    );
}
