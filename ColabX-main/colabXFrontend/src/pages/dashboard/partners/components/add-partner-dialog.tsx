import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { useCreatePartnerMutation } from '@/hooks/usePartners';

export function AddPartnerDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState<'technology' | 'reseller' | 'agent' | 'distributor'>('technology');
    const [industry, setIndustry] = useState('');

    const createPartner = useCreatePartnerMutation();

    const handleSubmit = () => {
        if (!name.trim()) return;
        createPartner.mutate(
            { name: name.trim(), type, industry: industry || undefined },
            {
                onSuccess: () => {
                    setOpen(false);
                    setName('');
                    setType('technology');
                    setIndustry('');
                },
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Partner</DialogTitle>
                    <DialogDescription>
                        Enter the details of the new partner company here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="Acme Corp"
                            className="col-span-3"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Type
                        </Label>
                        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select type" />
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
                        <Label htmlFor="industry" className="text-right">
                            Industry
                        </Label>
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
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={createPartner.isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" onClick={handleSubmit} disabled={createPartner.isPending || !name.trim()}>
                        {createPartner.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Partner
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
