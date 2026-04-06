import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAssignPartnerToTeamMutation, useRemovePartnerFromTeamMutation, useTeams } from '@/hooks/useTeams';
import { useAuthStore } from '@/stores/authStore';
import type { ApiPartnerTeam } from '@/services/partnersService';
import { Loader2, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

interface PartnerTeamAssignmentCardProps {
    partnerId: string;
    teams: ApiPartnerTeam[];
}

export function PartnerTeamAssignmentCard({
    partnerId,
    teams,
}: PartnerTeamAssignmentCardProps) {
    const role = useAuthStore((state) => state.activeOrg?.role);
    const canManageAssignments = role === 'admin' || role === 'manager';

    const [open, setOpen] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState('');

    const { data: teamsData, isLoading: isTeamsLoading } = useTeams();
    const assignPartner = useAssignPartnerToTeamMutation();
    const removePartner = useRemovePartnerFromTeamMutation();

    const assignedTeamIds = useMemo(
        () => new Set(teams.map((team) => team.id)),
        [teams]
    );

    const availableTeams = useMemo(
        () => (teamsData?.teams ?? []).filter((team) => !assignedTeamIds.has(team.id)),
        [assignedTeamIds, teamsData?.teams]
    );

    const handleAssign = async () => {
        if (!selectedTeamId) {
            return;
        }

        try {
            await assignPartner.mutateAsync({ teamId: selectedTeamId, partnerId });
            toast.success('Partner assigned to team');
            setOpen(false);
            setSelectedTeamId('');
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Failed to assign partner to team'
            );
        }
    };

    const handleRemove = async (teamId: string, teamName: string) => {
        try {
            await removePartner.mutateAsync({ teamId, partnerId });
            toast.success(`Removed from ${teamName}`);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Failed to remove partner from team'
            );
        }
    };

    const isRemovingTeamId = removePartner.variables?.teamId;

    const formatAssignedAt = (value: string) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return value;
        }
        return date.toLocaleDateString();
    };

    return (
        <div className="rounded-xl border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Team Assignments</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Deals can only be created after this partner is linked to at least one team.
                    </p>
                </div>

                {canManageAssignments ? (
                    <Dialog
                        open={open}
                        onOpenChange={(nextOpen) => {
                            setOpen(nextOpen);
                            if (!nextOpen) {
                                setSelectedTeamId('');
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={isTeamsLoading || availableTeams.length === 0}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Assign Team
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Assign Team</DialogTitle>
                                <DialogDescription>
                                    Choose a team that should own this partner relationship.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3 py-2">
                                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue
                                            placeholder={
                                                isTeamsLoading
                                                    ? 'Loading teams...'
                                                    : 'Select a team'
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTeams.map((team) => (
                                            <SelectItem key={team.id} value={team.id}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {availableTeams.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        This partner is already assigned to every available team.
                                    </p>
                                ) : null}
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={assignPartner.isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAssign}
                                    disabled={!selectedTeamId || assignPartner.isPending}
                                >
                                    {assignPartner.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Assign
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                ) : null}
            </div>

            <div className="mt-4 space-y-3">
                {teams.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                        No team assigned yet.
                    </div>
                ) : (
                    teams.map((team) => {
                        const isRemoving = removePartner.isPending && isRemovingTeamId === team.id;

                        return (
                            <div
                                key={team.id}
                                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{team.name}</span>
                                        <Badge variant="outline">Assigned</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Linked on {formatAssignedAt(team.assignedAt)}. Team-linked deals and assignments will flow through this team.
                                    </p>
                                </div>

                                {canManageAssignments ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleRemove(team.id, team.name)}
                                        disabled={isRemoving}
                                    >
                                        {isRemoving ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="mr-2 h-4 w-4" />
                                        )}
                                        Remove
                                    </Button>
                                ) : null}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
