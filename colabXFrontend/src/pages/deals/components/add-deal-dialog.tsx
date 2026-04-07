import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { usePartner, usePartners } from '@/hooks/usePartners';
import { mapUiDealStageToApi, useCreateDealMutation, useUpdateDealMutation } from '@/hooks/useDeals';
import type { DealStage } from '@/types/deal';

export function AddDealDialog() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [partnerId, setPartnerId] = useState('');
    const [teamId, setTeamId] = useState('');
    const [value, setValue] = useState('');
    const [stage, setStage] = useState<DealStage>('Lead');

    const { data: partnersData, isLoading: isPartnersLoading } = usePartners();
    const { data: partnerDetailsData, isLoading: isPartnerDetailsLoading } = usePartner(partnerId || undefined);
    const createDealMutation = useCreateDealMutation();
    const updateDealMutation = useUpdateDealMutation();

    const isSubmitting = createDealMutation.isPending || updateDealMutation.isPending;
    const partnerTeams = partnerDetailsData?.teams ?? [];
    const hasSelectedPartner = !!partnerId;
    const hasNoTeamAssignments =
        hasSelectedPartner && !isPartnerDetailsLoading && partnerTeams.length === 0;
    const requiresTeamSelection = partnerTeams.length > 1;
    const resolvedTeamId = partnerTeams.length === 1 ? partnerTeams[0]?.id : teamId || undefined;

    const resetForm = () => {
        setTitle('');
        setPartnerId('');
        setTeamId('');
        setValue('');
        setStage('Lead');
    };

    useEffect(() => {
        setTeamId('');
    }, [partnerId]);

    useEffect(() => {
        const partnerFromUrl = searchParams.get('partnerId');
        if (partnerFromUrl) {
            setPartnerId(partnerFromUrl);
            setOpen(true);
        }
    }, [searchParams]);

    const handleSubmit = async () => {
        if (!title.trim() || !partnerId || isPartnerDetailsLoading) {
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
                teamId: resolvedTeamId,
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

                    {hasSelectedPartner ? (
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="pt-2 text-right">Team</Label>
                            <div className="col-span-3 space-y-2">
                                {isPartnerDetailsLoading ? (
                                    <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                                        Loading partner team assignments...
                                    </div>
                                ) : null}

                                {hasNoTeamAssignments ? (
                                    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                                        <div className="flex items-start gap-2">
                                            <Users className="mt-0.5 h-4 w-4 text-amber-600" />
                                            <div className="space-y-2">
                                                <p className="text-sm text-amber-900">
                                                    This partner is not assigned to a team yet. Assign a team before creating a deal.
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setOpen(false);
                                                        navigate(`/partners/${partnerId}`);
                                                    }}
                                                >
                                                    Manage Team Assignment
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}

                                {!isPartnerDetailsLoading && partnerTeams.length === 1 ? (
                                    <div className="rounded-md border bg-muted/30 p-3 text-sm">
                                        This deal will be created under <span className="font-medium">{partnerTeams[0]?.name}</span>.
                                    </div>
                                ) : null}

                                {!isPartnerDetailsLoading && requiresTeamSelection ? (
                                    <>
                                        <p className="text-sm text-muted-foreground">
                                            This partner belongs to multiple teams. Choose which team should own the deal.
                                        </p>
                                        <Select value={teamId} onValueChange={setTeamId}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select deal team" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {partnerTeams.map((team) => (
                                                    <SelectItem key={team.id} value={team.id}>
                                                        {team.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

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
                        disabled={
                            isSubmitting ||
                            !title.trim() ||
                            !partnerId ||
                            (hasSelectedPartner && isPartnerDetailsLoading) ||
                            hasNoTeamAssignments ||
                            (requiresTeamSelection && !teamId)
                        }
                    >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Deal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
