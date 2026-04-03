import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import { usePartners } from '@/hooks/usePartners';
import { useCreateObjectiveMutation } from '@/hooks/useOkrs';
import { toast } from 'sonner';

export function AddObjectiveDialog() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [partnerId, setPartnerId] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data: partnersData } = usePartners();
    const createObjective = useCreateObjectiveMutation();

    const partners = partnersData?.partners ?? [];

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setPartnerId('');
        setEndDate('');
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!title.trim() || !partnerId || !endDate) return;

        const startDate = new Date().toISOString().slice(0, 10);

        createObjective.mutate(
            {
                title: title.trim(),
                description: description.trim() || undefined,
                partnerId,
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
                            <Label htmlFor="owner" className="text-right">
                                Partner
                            </Label>
                            <Select value={partnerId} onValueChange={setPartnerId}>
                                <SelectTrigger id="owner" className="col-span-3">
                                    <SelectValue placeholder="Select partner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {partners.map((partner) => (
                                        <SelectItem key={partner.id} value={partner.id}>
                                            {partner.name}
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
                            disabled={createObjective.isPending || !title.trim() || !partnerId || !endDate}
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
