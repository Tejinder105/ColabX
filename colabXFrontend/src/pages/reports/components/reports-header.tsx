import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function ReportsHeader() {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics & Reports</h1>
                <p className="text-muted-foreground">
                    Actionable insights and overviews for your deals, teams, and partnerships.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>
        </div>
    );
}
