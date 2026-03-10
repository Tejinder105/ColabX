import { AddDealDialog } from './add-deal-dialog';

export function DealsHeader() {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Deals Collaboration</h1>
                <p className="text-muted-foreground">
                    Manage the pipeline, collaborate with partners, and close deals.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <AddDealDialog />
            </div>
        </div>
    );
}
