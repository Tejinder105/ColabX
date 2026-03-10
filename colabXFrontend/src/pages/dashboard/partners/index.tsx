import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockKpis, mockPartners } from '@/lib/mock-partners';
import { PartnersHeader } from './components/partners-header';
import { KpiStrip } from './components/kpi-strip';
import { PartnersTable } from './components/partners-table';
import type { Partner } from '@/types/partner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function PartnersPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // State for demonstrating UI states
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        // Simulate network request
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleRetry = () => {
        setIsLoading(true);
        setIsError(false);
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    };

    const handleRowClick = (partner: Partner) => {
        navigate(`/partners/${partner.id}`);
    };

    if (isError) {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <PartnersHeader />
                <div className="flex flex-col items-center justify-center p-12 border rounded-lg border-dashed bg-muted/10 mt-6 h-[400px]">
                    <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Failed to load partners</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm text-center">
                        There was a problem connecting to the server. Please try again.
                    </p>
                    <Button onClick={handleRetry}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <PartnersHeader />

            {/* Demo controls for states (would be removed in prod) */}
            <div className="flex items-center gap-2 text-xs bg-muted p-2 rounded-md mb-4 hidden">
                <span className="font-semibold px-2">Dev Tools:</span>
                <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => setIsLoading(!isLoading)}>Toggle Loading</Button>
                <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => setIsError(!isError)}>Toggle Error</Button>
            </div>

            {isLoading ? (
                <div className="space-y-4 mt-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                    <div className="space-y-4 mt-8">
                        <div className="flex justify-between">
                            <Skeleton className="h-10 w-64" />
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-64" />
                                <Skeleton className="h-10 w-10" />
                            </div>
                        </div>
                        <div className="rounded-md border">
                            <Skeleton className="h-12 w-full border-b" />
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full border-b" />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <KpiStrip data={mockKpis} />

                    <div className="space-y-4">
                        <PartnersTable
                            partners={mockPartners}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            onRowClick={handleRowClick}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
