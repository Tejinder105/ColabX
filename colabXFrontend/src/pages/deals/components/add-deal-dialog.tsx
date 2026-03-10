import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

export function AddDealDialog() {
    const [open, setOpen] = useState(false);

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
                        <Input id="name" placeholder="E.g. Enterprise SaaS Rollout" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="partner" className="text-right">
                            Partner
                        </Label>
                        <Select>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select associated partner" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TechCorp">TechCorp</SelectItem>
                                <SelectItem value="CloudX">CloudX</SelectItem>
                                <SelectItem value="Global Solutions">Global Solutions</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">
                            Value ($)
                        </Label>
                        <Input id="value" type="number" placeholder="200000" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stage" className="text-right">
                            Initial Stage
                        </Label>
                        <Select defaultValue="Lead">
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select pipeline stage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Lead">Lead</SelectItem>
                                <SelectItem value="Proposal">Proposal</SelectItem>
                                <SelectItem value="Negotiation">Negotiation</SelectItem>
                                <SelectItem value="Won">Won</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="team" className="text-right">
                            Assigned Team
                        </Label>
                        <Select>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select managing team" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Sales Team">Sales Team</SelectItem>
                                <SelectItem value="Enterprise Team">Enterprise Team</SelectItem>
                                <SelectItem value="Partner Growth">Partner Growth</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={() => setOpen(false)}>Create Deal</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
