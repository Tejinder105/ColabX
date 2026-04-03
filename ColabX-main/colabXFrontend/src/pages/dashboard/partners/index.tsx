import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePartners } from '@/hooks/usePartners';
import { useDealsDashboard } from '@/hooks/useDeals';
import { PartnersHeader } from './components/partners-header';
import { KpiStrip } from './components/kpi-strip';
import { PartnersTable } from './components/partners-table';
import type { Partner, PartnerType, Industry, PartnerStage, UIStatus, HealthStatus } from '@/types/partner';
import type { ApiPartner } from '@/services/partnersService';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

function mapType(type: string): PartnerType {
    switch (type) {
        case 'reseller': return 'Reseller';
        case 'agent': return 'Agency';
        case 'technology': return 'Technology';
        case 'distributor': return 'Strategic';
        default: return 'Technology';
    }
}

function mapStage(status: string): PartnerStage {
    switch (status?.toLowerCase()) {
        case 'active': return 'Active';
        case 'inactive': return 'Churned';
        case 'onboarding': return 'Onboarding';
        default: return 'Prospect';
    }
}

function mapUiStatus(status: string): UIStatus {
    switch (status?.toLowerCase()) {
        case 'active': return 'Green';
        case 'inactive': return 'Red';
        default: return 'Yellow';
    }
}

function mapHealthStatus(status: string): HealthStatus {
    switch (status?.toLowerCase()) {
        case 'active': return 'Good';
        case 'inactive': return 'Poor';
        default: return 'Average';
    }
}

const VALID_INDUSTRIES: Industry[] = ['Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Software', 'Defense', 'Other'];

function mapIndustry(industry: string | null): Industry {
    if (!industry) return 'Other';
    const match = VALID_INDUSTRIES.find(i => i.toLowerCase() === industry.toLowerCase());
    return match ?? 'Other';
}

interface PartnerDealStats {
    openDealsCount: number;
    openDealsValue: number;
}

function toUiPartner(p: ApiPartner, dealStats?: PartnerDealStats): Partner {
    return {
        id: p.id,
        name: p.name,
        type: mapType(p.type),
        industry: mapIndustry(p.industry),
        ownerName: '—',
        stage: mapStage(p.status),
        healthScore: p.status?.toLowerCase() === 'active' ? 80 : 40,
        healthStatus: mapHealthStatus(p.status),
        uiStatus: mapUiStatus(p.status),
        performanceScore: p.status?.toLowerCase() === 'active' ? 80 : 40,
        openDealsCount: dealStats?.openDealsCount ?? 0,
        openDealsValue: dealStats?.openDealsValue ?? 0,
        lastActivityDate: p.updatedAt,
        nextActionDue: null,
        region: '',
        tags: [],
        contacts: [],
        activities: [],
        activeDeals: [],
    };
}

export default function PartnersPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const { data, isLoading, isError, refetch } = usePartners();
    const { data: dealsData, isLoading: dealsLoading } = useDealsDashboard();

    // Compute deal stats per partner
    const partnerDealStats = useMemo(() => {
        const stats = new Map<string, PartnerDealStats>();
        const rawDeals = dealsData?.rawDeals ?? [];

        for (const deal of rawDeals) {
            // Only count open deals (not won/lost)
            if (deal.stage === 'won' || deal.stage === 'lost') continue;

            const existing = stats.get(deal.partnerId) ?? { openDealsCount: 0, openDealsValue: 0 };
            existing.openDealsCount += 1;
            existing.openDealsValue += deal.value ?? 0;
            stats.set(deal.partnerId, existing);
        }
        return stats;
    }, [dealsData?.rawDeals]);

    const partners = useMemo(() => {
        return (data?.partners ?? []).map(p => toUiPartner(p, partnerDealStats.get(p.id)));
    }, [data?.partners, partnerDealStats]);

    // Compute total pipeline value from all open deals
    const totalPipelineValue = useMemo(() => {
        const rawDeals = dealsData?.rawDeals ?? [];
        return rawDeals
            .filter(d => d.stage !== 'won' && d.stage !== 'lost')
            .reduce((sum, d) => sum + (d.value ?? 0), 0);
    }, [dealsData?.rawDeals]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const kpis = {
        totalPartners: partners.length,
        activePartners: (data?.partners ?? []).filter(p => p.status?.toLowerCase() === 'active').length,
        atRiskPartners: (data?.partners ?? []).filter(p => p.status?.toLowerCase() === 'inactive').length,
        newPartnersThisMonth: (data?.partners ?? []).filter(p => new Date(p.createdAt) >= startOfMonth).length,
        pipelineDealsValue: totalPipelineValue,
    };

    const handleRowClick = (partner: Partner) => {
        navigate(`/partners/${partner.id}`);
    };

    const loading = isLoading || dealsLoading;

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
                    <Button onClick={() => refetch()}>
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
            {loading ? (
                <div className="space-y-4 mt-6">
                    {/* KPI skeleton */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                    {/* Table skeleton */}
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
                    <KpiStrip data={kpis} />
                    <div className="space-y-4">
                        <PartnersTable
                            partners={partners}
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
