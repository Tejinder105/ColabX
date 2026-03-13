import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Loader2, Trash2, Check, X } from 'lucide-react';
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
import {
    useTeam,
    useUpdateTeamMutation,
    useDeleteTeamMutation,
    useUpdateTeamMemberRoleMutation,
    useRemoveTeamMemberMutation,
} from '@/hooks/useTeams';
import type { TeamMember } from '@/types/team';
import type { ApiTeamMember } from '@/services/teamsService';

// Use userId so mutation callbacks have the correct ID for API calls
function toUiMember(m: ApiTeamMember): TeamMember {
    return {
        id: m.userId,
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

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Mutations
    const updateTeam = useUpdateTeamMutation(id ?? '');
    const deleteTeam = useDeleteTeamMutation();
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
                            onRemove={handleRemoveMember}
                            onChangeRole={handleChangeRole}
                        />
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
