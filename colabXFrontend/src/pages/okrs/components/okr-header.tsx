import { AddObjectiveDialog } from './add-objective-dialog';
import { useRbac } from '@/hooks/useRbac';

export function OkrsHeader() {
    const { isAdmin, isManager } = useRbac();
    const canManageOkrs = isAdmin || isManager;
    
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">OKRs & Performance</h1>
                <p className="text-muted-foreground">
                    Track Objectives, Key Results, and analyze overall partner health.
                </p>
            </div>
            {canManageOkrs && (
                <div className="flex items-center gap-2">
                    <AddObjectiveDialog />
                </div>
            )}
        </div>
    );
}
