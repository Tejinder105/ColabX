import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useUpdatePartnerMutation } from '@/hooks/usePartners';

interface DisablePartnerDialogProps {
    partnerId: string;
    partnerName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DisablePartnerDialog({ partnerId, partnerName, open, onOpenChange }: DisablePartnerDialogProps) {
    const [isDisabling, setIsDisabling] = useState(false);
    const updatePartner = useUpdatePartnerMutation(partnerId);

    const handleDisable = () => {
        setIsDisabling(true);
        updatePartner.mutate(
            { status: 'inactive' },
            {
                onSuccess: () => {
                    setIsDisabling(false);
                    onOpenChange(false);
                },
                onError: () => {
                    setIsDisabling(false);
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <DialogTitle>Disable Partner</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to disable <strong>{partnerName}</strong>?
                        This will mark the partner as inactive and they will no longer appear in active partner lists.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDisabling}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDisable}
                        disabled={isDisabling}
                    >
                        {isDisabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Disable Partner
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
