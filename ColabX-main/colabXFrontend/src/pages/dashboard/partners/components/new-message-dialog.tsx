import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useCreateCommunicationMutation } from '@/hooks/useCollaboration';

interface NewMessageDialogProps {
    partnerId: string;
    trigger?: React.ReactNode;
}

export function NewMessageDialog({ partnerId, trigger }: NewMessageDialogProps) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');

    const createCommunication = useCreateCommunicationMutation(partnerId);

    const handleSubmit = () => {
        if (!message.trim()) return;
        createCommunication.mutate(
            { message: message.trim() },
            {
                onSuccess: () => {
                    setOpen(false);
                    setMessage('');
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" size="sm">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        New Message
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                    <DialogDescription>
                        Send a message to this partner's communication thread.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            placeholder="Type your message here..."
                            className="min-h-[150px]"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={createCommunication.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={createCommunication.isPending || !message.trim()}>
                        {createCommunication.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Message
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
