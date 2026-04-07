import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import { usePartners } from '@/hooks/usePartners';
import { useTeams } from '@/hooks/useTeams';
import { useCreateObjectiveMutation } from '@/hooks/useOkrs';
import { toast } from 'sonner';

export function AddObjectiveDialog() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeType, setAssigneeType] = useState<'partner' | 'team'>('partner');
    const [partnerId, setPartnerId] = useState('');
    const [teamId, setTeamId] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data: partnersData } = usePartners();
    const { data: teamsData } = useTeams();
    const createObjective = useCreateObjectiveMutation();

    const partners = partnersData?.partners ?? [];
    const teams = teamsData?.teams ?? [];

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setAssigneeType('partner');
        setPartnerId('');
        setTeamId('');
        setEndDate('');
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        const selectedAssigneeId = assigneeType === 'partner' ? partnerId : teamId;
        if (!title.trim() || !selectedAssigneeId || !endDate) return;

        const startDate = new Date().toISOString().slice(0, 10);

        createObjective.mutate(
            {
                title: title.trim(),
                description: description.trim() || undefined,
                ...(assigneeType === 'partner' ? { partnerId } : { teamId }),
                startDate,
                endDate,
            },
            {
                onSuccess: () => {
                    resetForm();
                    setOpen(false);
                    toast.success('Objective created');
                },
                onError: (error) => {
                    const message = error instanceof Error ? error.message : 'Failed to create objective';
                    toast.error(message);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Objective
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create New Objective</DialogTitle>
                        <DialogDescription>
                            Set a new partner objective and track key result progress in one place.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input
                                id="title"
                                placeholder="E.g. Increase Partner Sales"
                                className="col-span-3"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                placeholder="Optional context for this objective"
                                className="col-span-3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="assigneeType" className="text-right">
                                Assign To
                            </Label>
                            <Select
                                value={assigneeType}
                                onValueChange={(value) => {
                                    setAssigneeType(value as 'partner' | 'team');
                                    setPartnerId('');
                                    setTeamId('');
                                }}
                            >
                                <SelectTrigger id="assigneeType" className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="partner">Partner</SelectItem>
                                    <SelectItem value="team">Team</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="owner" className="text-right">
                                {assigneeType === 'partner' ? 'Partner' : 'Team'}
                            </Label>
                            <Select
                                value={assigneeType === 'partner' ? partnerId : teamId}
                                onValueChange={assigneeType === 'partner' ? setPartnerId : setTeamId}
                            >
                                <SelectTrigger id="owner" className="col-span-3">
                                    <SelectValue placeholder={assigneeType === 'partner' ? 'Select partner' : 'Select team'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {assigneeType === 'partner'
                                        ? partners.map((partner) => (
                                            <SelectItem key={partner.id} value={partner.id}>
                                                {partner.name}
                                            </SelectItem>
                                        ))
                                        : teams.map((team) => (
                                            <SelectItem key={team.id} value={team.id}>
                                                {team.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="deadline" className="text-right">
                                Deadline
                            </Label>
                            <Input
                                id="deadline"
                                type="date"
                                className="col-span-3"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {createObjective.isError ? (
                        <p className="pb-4 text-sm text-destructive">
                            {createObjective.error instanceof Error
                                ? createObjective.error.message
                                : 'Failed to create objective'}
                        </p>
                    ) : null}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={createObjective.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                createObjective.isPending ||
                                !title.trim() ||
                                !(assigneeType === 'partner' ? partnerId : teamId) ||
                                !endDate
                            }
                        >
                            {createObjective.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create Objective
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
