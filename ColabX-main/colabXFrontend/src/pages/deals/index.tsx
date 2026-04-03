import { useState } from 'react';
import { DealsHeader } from './components/deals-header';
import { DealPipeline } from './components/deal-pipeline';
import { DealsTable } from './components/deals-table';
import { DealDetailsSheet } from './components/deal-details-sheet';
import { mapUiDealStageToApi, useDealsDashboard, useUpdateDealMutation } from '@/hooks/useDeals';
import type { Deal, DealStage } from '@/types/deal';
import { toast } from 'sonner';

export default function DealsPage() {
    const { data, isLoading, isError, error } = useDealsDashboard();
    const updateDealMutation = useUpdateDealMutation();
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const deals = data?.deals ?? [];
    const pipelineSummary = data?.pipelineSummary ?? {
        leadCount: 0,
        proposalCount: 0,
        negotiationCount: 0,
        wonCount: 0,
        lostCount: 0,
    };

    const handleRowClick = (deal: Deal) => {
        setSelectedDeal(deal);
        setSheetOpen(true);
    };

    const handleUpdateStage = (dealId: string, stage: DealStage) => {
        updateDealMutation.mutate(
            {
                dealId,
                input: {
                    stage: mapUiDealStageToApi(stage),
                },
            },
            {
                onSuccess: () => {
                    toast.success(`Deal moved to ${stage}`);
                    if (selectedDeal?.id === dealId) {
                        setSelectedDeal({
                            ...selectedDeal,
                            stage,
                        });
                    }
                },
                onError: (mutationError) => {
                    toast.error(mutationError instanceof Error ? mutationError.message : 'Failed to update deal stage');
                },
            }
        );
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <DealsHeader />
            {isError ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                    {error instanceof Error ? error.message : 'Failed to load deals'}
                </div>
            ) : null}

            <DealPipeline summary={pipelineSummary} />

            {isLoading ? (
                <div className="rounded-md border bg-card p-8 text-center text-sm text-muted-foreground">
                    Loading deals...
                </div>
            ) : (
                <DealsTable deals={deals} onRowClick={handleRowClick} onUpdateStage={handleUpdateStage} />
            )}

            <DealDetailsSheet
                deal={selectedDeal}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </div>
    );
}
