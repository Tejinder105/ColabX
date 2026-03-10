import { useState } from 'react';
import { DealsHeader } from './components/deals-header';
import { DealPipeline } from './components/deal-pipeline';
import { DealsTable } from './components/deals-table';
import { DealDetailsSheet } from './components/deal-details-sheet';
import { mockDeals, mockPipelineSummary } from '@/lib/mock-deals';
import type { Deal } from '@/types/deal';

export default function DealsPage() {
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [sheetOpen, setSheetOpen] = useState(false);

    const handleRowClick = (deal: Deal) => {
        setSelectedDeal(deal);
        setSheetOpen(true);
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <DealsHeader />
            <DealPipeline summary={mockPipelineSummary} />
            <DealsTable deals={mockDeals} onRowClick={handleRowClick} />

            <DealDetailsSheet
                deal={selectedDeal}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
            />
        </div>
    );
}
