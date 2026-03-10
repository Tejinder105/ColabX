import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTeams } from '@/hooks/useTeams';
import { TeamsHeader } from './components/teams-header';
import { TeamsKpiStrip } from './components/teams-kpi-strip';
import { TeamsTable } from './components/teams-table';
import type { Team } from '@/types/team';
import type { ApiTeam } from '@/services/teamsService';

// Map backend team shape to the frontend Team type
function toUiTeam(t: ApiTeam): Team {
    return {
        id: t.id,
        name: t.name,
        description: t.description ?? undefined,
        leadName: '—',
        memberCount: t.memberCount,
        partnersManagedCount: 0,
        dealsCount: 0,
        status: 'Active',
        createdAt: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : undefined,
    };
}

export default function TeamsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { data, isLoading, isError, error } = useTeams();

    const teams = (data?.teams ?? []).map(toUiTeam);

    const kpis = [
        {
            title: 'Total Teams',
            value: String(teams.length),
            trend: '',
            trendUp: true,
        },
        {
            title: 'Total Team Members',
            value: String(teams.reduce((sum, t) => sum + t.memberCount, 0)),
            trend: '',
            trendUp: true,
        },
        {
            title: 'Active Teams',
            value: String(teams.filter((t) => t.status === 'Active').length),
            trend: '',
            trendUp: true,
        },
        {
            title: 'Managers / Team Leads',
            value: '0',
            trend: '',
            trendUp: true,
        },
    ];

    const handleRowClick = (team: Team) => {
        navigate(`/teams/${team.id}`);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-destructive">
                    {error instanceof Error ? error.message : 'Failed to load teams'}
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <TeamsHeader />
            <TeamsKpiStrip data={kpis} />
            <div className="space-y-4">
                <TeamsTable
                    teams={teams}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onRowClick={handleRowClick}
                />
            </div>
        </div>
    );
}
