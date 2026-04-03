import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Loader2 } from 'lucide-react';
import { useCreateContactMutation } from '@/hooks/useContacts';

interface AddContactDialogProps {
    partnerId: string;
}

export function AddContactDialog({ partnerId }: AddContactDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('');
    const [isPrimary, setIsPrimary] = useState(false);

    const createContact = useCreateContactMutation(partnerId);

    const handleSubmit = () => {
        if (!name.trim() || !email.trim()) return;
        createContact.mutate(
            {
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || undefined,
                role: role.trim() || undefined,
                isPrimary,
            },
            {
                onSuccess: () => {
                    setOpen(false);
                    setName('');
                    setEmail('');
                    setPhone('');
                    setRole('');
                    setIsPrimary(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Contact
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Contact</DialogTitle>
                    <DialogDescription>
                        Add a new contact to this partner.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            className="col-span-3"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            className="col-span-3"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">Phone</Label>
                        <Input
                            id="phone"
                            placeholder="+1 234 567 890"
                            className="col-span-3"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Input
                            id="role"
                            placeholder="Partner Manager"
                            className="col-span-3"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="primary" className="text-right">Primary</Label>
                        <div className="col-span-3 flex items-center space-x-2">
                            <Switch
                                id="primary"
                                checked={isPrimary}
                                onCheckedChange={setIsPrimary}
                            />
                            <Label htmlFor="primary" className="text-sm text-muted-foreground">
                                Main point of contact
                            </Label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={createContact.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={createContact.isPending || !name.trim() || !email.trim()}>
                        {createContact.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Contact
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
