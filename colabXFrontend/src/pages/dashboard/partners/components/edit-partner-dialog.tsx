import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useUpdatePartnerMutation } from '@/hooks/usePartners';
import type { ApiPartnerDetail } from '@/services/partnersService';

interface EditPartnerDialogProps {
    partner: ApiPartnerDetail;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditPartnerDialog({ partner, open, onOpenChange }: EditPartnerDialogProps) {
    const [name, setName] = useState(partner.name);
    const [type, setType] = useState<'technology' | 'reseller' | 'agent' | 'distributor'>(partner.type);
    const [status, setStatus] = useState(partner.status);
    const [industry, setIndustry] = useState(partner.industry ?? '');
    const [contactEmail, setContactEmail] = useState(partner.contactEmail ?? '');

    const updatePartner = useUpdatePartnerMutation(partner.id);

    const handleSubmit = () => {
        if (!name.trim()) return;
        updatePartner.mutate(
            {
                name: name.trim(),
                type,
                status,
                industry: industry || undefined,
                contactEmail: contactEmail || undefined,
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Partner</DialogTitle>
                    <DialogDescription>
                        Update the partner details.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                            id="name"
                            className="col-span-3"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Type</Label>
                        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="technology">Technology</SelectItem>
                                <SelectItem value="reseller">Reseller</SelectItem>
                                <SelectItem value="agent">Agency</SelectItem>
                                <SelectItem value="distributor">Strategic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="industry" className="text-right">Industry</Label>
                        <Select value={industry} onValueChange={setIndustry}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Software">Software</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Retail">Retail</SelectItem>
                                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="Defense">Defense</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            className="col-span-3"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updatePartner.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={updatePartner.isPending || !name.trim()}>
                        {updatePartner.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
