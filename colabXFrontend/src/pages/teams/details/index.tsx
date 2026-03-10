import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Loader2, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    mockTeamPartners,
    mockTeamDeals,
    mockTeamObjectives,
    mockTeamActivity
} from '@/lib/mock-teams';

import { TeamMembers } from './components/team-members';
import { TeamPartners } from './components/team-partners';
import { TeamDeals } from './components/team-deals';
import { TeamObjectives } from './components/team-objectives';
import { TeamActivity } from './components/team-activity';
import { Badge } from '@/components/ui/badge';
import { useTeam } from '@/hooks/useTeams';
import type { TeamMember } from '@/types/team';
import type { ApiTeamMember } from '@/services/teamsService';

function toUiMember(m: ApiTeamMember): TeamMember {
    return {
        id: m.id,
        name: m.userName,
        role: m.role === 'lead' ? 'Team Lead' : 'Member',
        email: m.userEmail,
        avatarUrl: m.userImage ?? undefined,
    };
}

export default function TeamDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading, isError } = useTeam(id);

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !data?.team) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[500px]">
                <h3 className="text-xl font-semibold mb-2">Team not found</h3>
                <p className="text-muted-foreground mb-4">
                    The team you are looking for does not exist or has been removed.
                </p>
                <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
            </div>
        );
    }

    const team = data.team;
    const members = (data.members ?? []).map(toUiMember);
    const lead = data.members?.find((m) => m.role === 'lead');
    const leadName = lead?.userName ?? '—';
    const createdAt = team.createdAt ? new Date(team.createdAt).toLocaleDateString() : '—';

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {/* Header Area */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/teams')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                            <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                                Active
                            </Badge>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Lead: <span className="font-semibold text-foreground">{leadName}</span> • Created {createdAt}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Team
                    </Button>
                    <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            {/* Description Card */}
            {team.description && (
                <div className="bg-muted/50 p-4 rounded-lg border text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Mission:</span> {team.description}
                </div>
            )}

            {/* Content Tabs */}
            <Tabs defaultValue="members" className="w-full mt-6">
                <TabsList className="grid w-full grid-cols-5 h-auto lg:w-[600px]">
                    <TabsTrigger value="members" className="py-2">Members</TabsTrigger>
                    <TabsTrigger value="partners" className="py-2">Partners</TabsTrigger>
                    <TabsTrigger value="deals" className="py-2">Deals</TabsTrigger>
                    <TabsTrigger value="objectives" className="py-2">Objectives</TabsTrigger>
                    <TabsTrigger value="activity" className="py-2">Activity</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="members" className="m-0">
                        <TeamMembers members={members} />
                    </TabsContent>

                    <TabsContent value="partners" className="m-0">
                        <TeamPartners partners={mockTeamPartners} />
                    </TabsContent>

                    <TabsContent value="deals" className="m-0">
                        <TeamDeals deals={mockTeamDeals} />
                    </TabsContent>

                    <TabsContent value="objectives" className="m-0">
                        <TeamObjectives objectives={mockTeamObjectives} />
                    </TabsContent>

                    <TabsContent value="activity" className="m-0">
                        <TeamActivity activities={mockTeamActivity} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
