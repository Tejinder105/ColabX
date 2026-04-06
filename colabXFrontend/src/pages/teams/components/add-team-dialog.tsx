import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import { useCreateTeamMutation } from '@/hooks/useTeams';
import { useOrgMembers } from '@/hooks/useOrg';
import { useAuthStore } from '@/stores/authStore';

export function AddTeamDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [leadUserId, setLeadUserId] = useState('');
    const createTeam = useCreateTeamMutation();
    
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    const { data: membersData } = useOrgMembers(activeOrgId);
    
    // Filter to only show admins and managers as potential team leads
    const eligibleLeads = membersData?.members?.filter(
        (m) => m.role === 'admin' || m.role === 'manager'
    ) || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !leadUserId) return;

        createTeam.mutate(
            { name: name.trim(), description: description.trim() || undefined, leadUserId },
            {
                onSuccess: () => {
                    setOpen(false);
                    setName('');
                    setDescription('');
                    setLeadUserId('');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Team
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Team</DialogTitle>
                        <DialogDescription>
                            Define a new team and its purpose within the organization.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Team Name
                            </Label>
                            <Input
                                id="name"
                                placeholder="E.g. Partner Growth"
                                className="col-span-3"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                placeholder="Brief purpose of the team"
                                className="col-span-3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lead" className="text-right">
                                Team Lead
                            </Label>
                            <Select value={leadUserId} onValueChange={setLeadUserId}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select team lead" />
                                </SelectTrigger>
                                <SelectContent>
                                    {eligibleLeads.map((member) => (
                                        <SelectItem key={member.userId} value={member.userId}>
                                            {member.userName} ({member.role})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {createTeam.isError && (
                        <p className="text-sm text-destructive pb-4 px-1">
                            {createTeam.error instanceof Error
                                ? createTeam.error.message
                                : 'Failed to create team'}
                        </p>
                    )}
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={createTeam.isPending}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createTeam.isPending || !name.trim() || !leadUserId}>
                            {createTeam.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Create Team
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
