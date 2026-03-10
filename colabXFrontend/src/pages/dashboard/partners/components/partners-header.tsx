import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { AddPartnerDialog } from './add-partner-dialog';

export function PartnersHeader() {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
                <p className="text-muted-foreground">
                    Manage your partner network and track performance.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Import CSV
                </Button>
                <AddPartnerDialog />
            </div>
        </div>
    );
}
