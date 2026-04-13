import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Loader2, Trash2, Check, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { TeamMembers } from './components/team-members';
import { TeamPartners } from './components/team-partners';
import { TeamDeals } from './components/team-deals';
import { TeamObjectives } from './components/team-objectives';
import { TeamActivity } from './components/team-activity';
import { Badge } from '@/components/ui/badge';
import {
    useTeam,
    useAddTeamMemberMutation,
    useUpdateTeamMutation,
    useDeleteTeamMutation,
    useUpdateTeamMemberRoleMutation,
    useRemoveTeamMemberMutation,
    useTeamPartners,
    useTeamDeals,
    useTeamObjectives,
    useTeamActivity,
} from '@/hooks/useTeams';
import { useOrgMembers } from '@/hooks/useOrg';
import { useTeamPerformance } from '@/hooks/useOkrs';
import { useAuthStore } from '@/stores/authStore';
import type { TeamMember, TeamPartner, TeamDeal, TeamObjective, TeamActivity as TeamActivityType } from '@/types/team';
import type {
    ApiTeamMember,
    ApiTeamPartner,
    ApiTeamDeal,
    ApiTeamObjective,
    ApiTeamActivity,
} from '@/services/teamsService';

// Map API member to UI member
function toUiMember(m: ApiTeamMember): TeamMember {
    return {
        id: m.userId,
        name: m.userName,
        role: m.role === 'lead' ? 'Team Lead' : 'Member',
        email: m.userEmail,
        avatarUrl: m.userImage ?? undefined,
    };
}

// Map API partner to UI partner
function toUiPartner(p: ApiTeamPartner): TeamPartner {
    const statusMap: Record<string, 'Active' | 'Inactive' | 'Pending'> = {
        active: 'Active',
        inactive: 'Inactive',
        suspended: 'Pending',
    };
    return {
        id: p.partnerId,
        name: p.name,
        type: p.type.charAt(0).toUpperCase() + p.type.slice(1),
        status: statusMap[p.status] ?? 'Active',
    };
}

// Map API deal to UI deal
function toUiDeal(d: ApiTeamDeal): TeamDeal {
    const formatValue = (val: number | null) => {
        if (val === null) return '—';
        return `$${val.toLocaleString()}`;
    };
    return {
        id: d.dealId,
        name: d.title,
        value: formatValue(d.value),
        stage: d.stage.charAt(0).toUpperCase() + d.stage.slice(1),
    };
}

// Map API objective to UI objective
function toUiObjective(o: ApiTeamObjective): TeamObjective {
    const statusMap: Record<string, 'On Track' | 'At Risk' | 'Behind'> = {
        on_track: 'On Track',
        at_risk: 'At Risk',
        off_track: 'Behind',
    };
    return {
        id: o.objectiveId,
        title: o.title,
        progress: o.progress,
        status: statusMap[o.status] ?? 'On Track',
    };
}

// Map API activity to UI activity
function toUiActivity(a: ApiTeamActivity): TeamActivityType {
    const formatTimestamp = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString();
    };

    return {
        id: a.activityLogId,
        action: a.action,
        user: a.userName ?? 'Unknown',
        timestamp: formatTimestamp(a.createdAt),
    };
}

export default function TeamDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    const { data, isLoading, isError } = useTeam(id);

    // Fetch team-related data
    const { data: partnersData } = useTeamPartners(id);
    const { data: dealsData } = useTeamDeals(id);
    const { data: objectivesData } = useTeamObjectives(id);
    const { data: teamPerformanceData } = useTeamPerformance(id);
    const { data: activityData } = useTeamActivity(id);
    const { data: orgMembersData } = useOrgMembers(activeOrgId);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Mutations
    const updateTeam = useUpdateTeamMutation(id ?? '');
    const deleteTeam = useDeleteTeamMutation();
    const addMember = useAddTeamMemberMutation(id ?? '');
    const updateMemberRole = useUpdateTeamMemberRoleMutation(id ?? '');
    const removeMember = useRemoveTeamMemberMutation(id ?? '');

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
    const memberIds = new Set(members.map((member) => member.id));
    const availableMembers = (orgMembersData?.members ?? [])
        .filter((member) => !memberIds.has(member.userId))
        .map((member) => ({
            id: member.userId,
            name: member.userName,
            email: member.userEmail,
        }));
    const partners = (partnersData?.partners ?? []).map(toUiPartner);
    const deals = (dealsData?.deals ?? []).map(toUiDeal);
    const objectives = (objectivesData?.objectives ?? []).map(toUiObjective);
    const activities = (activityData?.activities ?? []).map(toUiActivity);

    const lead = data.members?.find((m) => m.role === 'lead');
    const leadName = lead?.userName ?? '—';
    const createdAt = team.createdAt ? new Date(team.createdAt).toLocaleDateString() : '—';

    const handleEditStart = () => {
        setEditName(team.name);
        setEditDescription(team.description ?? '');
        setIsEditing(true);
    };

    const handleEditSave = () => {
        updateTeam.mutate(
            { name: editName.trim() || team.name, description: editDescription },
            { onSuccess: () => setIsEditing(false) }
        );
    };

    const handleDelete = () => {
        if (!window.confirm(`Delete team "${team.name}"? This action cannot be undone.`)) return;
        deleteTeam.mutate(id!, {
            onSuccess: () => navigate('/teams'),
        });
    };

    const handleRemoveMember = (userId: string) => {
        removeMember.mutate(userId);
    };

    const handleAddMember = (userId: string, role: 'lead' | 'member') => {
        addMember.mutate(
            { userId, role },
            {
                onError: (error) => {
                    const message = error instanceof Error ? error.message : 'Failed to add member';
                    window.alert(message);
                },
            }
        );
    };

    const handleChangeRole = (userId: string, newRole: 'lead' | 'member') => {
        updateMemberRole.mutate({ userId, role: newRole });
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {/* Header Area */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/teams')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        {isEditing ? (
                            <div className="space-y-2">
                                <div className="grid gap-1">
                                    <Label htmlFor="editName" className="text-xs text-muted-foreground">Team Name</Label>
                                    <Input
                                        id="editName"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="h-8 text-base font-bold w-64"
                                    />
                                </div>
                                <div className="grid gap-1">
                                    <Label htmlFor="editDesc" className="text-xs text-muted-foreground">Description</Label>
                                    <Input
                                        id="editDesc"
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        placeholder="Team description..."
                                        className="h-8 w-80"
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
                                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                                        Active
                                    </Badge>
                                </div>
                                <p className="text-muted-foreground mt-1">
                                    Lead: <span className="font-semibold text-foreground">{leadName}</span> • Created {createdAt}
                                </p>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                disabled={updateTeam.isPending}
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                onClick={handleEditSave}
                                disabled={updateTeam.isPending}
                            >
                                {updateTeam.isPending
                                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    : <Check className="mr-2 h-4 w-4" />
                                }
                                Save
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={handleEditStart}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Team
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteTeam.isPending}
                            >
                                {deleteTeam.isPending
                                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    : <Trash2 className="mr-2 h-4 w-4" />
                                }
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Description Card */}
            {!isEditing && team.description && (
                <div className="bg-muted/50 p-4 rounded-lg border text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Mission:</span> {team.description}
                </div>
            )}

            {!isEditing && teamPerformanceData && (
                <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Completion Rate</p>
                        <p className="text-2xl font-semibold">{Math.round(teamPerformanceData.completionRate)}%</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs text-muted-foreground">Active Objectives</p>
                        <p className="text-2xl font-semibold">{teamPerformanceData.activeObjectives}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <p className="text-xs text-muted-foreground">At Risk Objectives</p>
                        <p className="text-2xl font-semibold">{teamPerformanceData.atRiskObjectives}</p>
                    </div>
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
                        <TeamMembers
                            members={members}
                            availableMembers={availableMembers}
                            onAdd={handleAddMember}
                            isAdding={addMember.isPending}
                            onRemove={handleRemoveMember}
                            onChangeRole={handleChangeRole}
                        />
                    </TabsContent>

                    <TabsContent value="partners" className="m-0">
                        <TeamPartners partners={partners} />
                    </TabsContent>

                    <TabsContent value="deals" className="m-0">
                        <TeamDeals deals={deals} />
                    </TabsContent>

                    <TabsContent value="objectives" className="m-0">
                        <TeamObjectives objectives={objectives} />
                    </TabsContent>

                    <TabsContent value="activity" className="m-0">
                        <TeamActivity activities={activities} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
