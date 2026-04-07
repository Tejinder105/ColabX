import { useState } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus } from 'lucide-react';
import { useCreatePartnerMutation } from '@/hooks/usePartners';

export function AddPartnerDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState<'reseller' | 'agent' | 'technology' | 'distributor'>('technology');
    const [industry, setIndustry] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const createPartner = useCreatePartnerMutation();

    const resetForm = () => {
        setName('');
        setType('technology');
        setIndustry('');
        setContactEmail('');
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        createPartner.mutate(
            {
                name: name.trim(),
                type,
                industry: industry || undefined,
                contactEmail: contactEmail || undefined,
            },
            {
                onSuccess: () => {
                    toast.success('Partner created');
                    resetForm();
                    setOpen(false);
                },
                onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to create partner'),
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Partner
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Partner</DialogTitle>
                    <DialogDescription>Create a partner profile before assigning teams, contacts, deals, and documents.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="partnerName" className="text-right">Name</Label>
                        <Input id="partnerName" className="col-span-3" value={name} onChange={(event) => setName(event.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Type</Label>
                        <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="technology">Technology</SelectItem>
                                <SelectItem value="reseller">Reseller</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                                <SelectItem value="distributor">Distributor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Industry</Label>
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
                        <Label htmlFor="partnerEmail" className="text-right">Email</Label>
                        <Input
                            id="partnerEmail"
                            type="email"
                            className="col-span-3"
                            value={contactEmail}
                            onChange={(event) => setContactEmail(event.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={createPartner.isPending}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={createPartner.isPending || !name.trim()}>
                        {createPartner.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Partner
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
