import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { AddTeamDialog } from './add-team-dialog';

export function TeamsHeader() {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
                <p className="text-muted-foreground">
                    Manage organizational structure and team responsibilities.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
                <AddTeamDialog />
            </div>
        </div>
    );
}
