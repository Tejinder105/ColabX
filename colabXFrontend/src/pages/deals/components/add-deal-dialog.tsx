import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { usePartners } from '@/hooks/usePartners';
import { mapUiDealStageToApi, useCreateDealMutation, useUpdateDealMutation } from '@/hooks/useDeals';
import type { DealStage } from '@/types/deal';

export function AddDealDialog() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [partnerId, setPartnerId] = useState('');
    const [value, setValue] = useState('');
    const [stage, setStage] = useState<DealStage>('Lead');

    const { data: partnersData, isLoading: isPartnersLoading } = usePartners();
    const createDealMutation = useCreateDealMutation();
    const updateDealMutation = useUpdateDealMutation();

    const isSubmitting = createDealMutation.isPending || updateDealMutation.isPending;

    const resetForm = () => {
        setTitle('');
        setPartnerId('');
        setValue('');
        setStage('Lead');
    };

    const handleSubmit = async () => {
        if (!title.trim() || !partnerId) {
            return;
        }

        try {
            const parsedValue = value.trim() ? Number(value) : undefined;
            if (parsedValue !== undefined && Number.isNaN(parsedValue)) {
                toast.error('Deal value must be a valid number');
                return;
            }

            const created = await createDealMutation.mutateAsync({
                title: title.trim(),
                partnerId,
                value: parsedValue,
            });

            if (stage !== 'Lead') {
                await updateDealMutation.mutateAsync({
                    dealId: created.deal.id,
                    input: {
                        stage: mapUiDealStageToApi(stage),
                    },
                });
            }

            toast.success('Deal created successfully');
            setOpen(false);
            resetForm();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create deal');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Deal
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Deal</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new partnership or sales opportunity.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Deal Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="E.g. Enterprise SaaS Rollout"
                            className="col-span-3"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="partner" className="text-right">
                            Partner
                        </Label>
                        <Select value={partnerId} onValueChange={setPartnerId}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder={isPartnersLoading ? 'Loading partners...' : 'Select associated partner'} />
                            </SelectTrigger>
                            <SelectContent>
                                {(partnersData?.partners ?? []).map((partner) => (
                                    <SelectItem key={partner.id} value={partner.id}>{partner.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">
                            Value ($)
                        </Label>
                        <Input
                            id="value"
                            type="number"
                            placeholder="200000"
                            className="col-span-3"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stage" className="text-right">
                            Initial Stage
                        </Label>
                        <Select value={stage} onValueChange={(next) => setStage(next as DealStage)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select pipeline stage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Lead">Lead</SelectItem>
                                <SelectItem value="Proposal">Proposal</SelectItem>
                                <SelectItem value="Negotiation">Negotiation</SelectItem>
                                <SelectItem value="Won">Won</SelectItem>
                                <SelectItem value="Lost">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !title.trim() || !partnerId}
                    >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Deal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
