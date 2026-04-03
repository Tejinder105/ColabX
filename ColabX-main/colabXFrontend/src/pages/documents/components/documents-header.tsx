import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

interface DocumentsHeaderProps {
    onUploadClick?: () => void;
    isUploadDisabled?: boolean;
}

export function DocumentsHeader({ onUploadClick, isUploadDisabled }: DocumentsHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Document Library</h1>
                <p className="text-muted-foreground">
                    Securely share and manage files across your organization and partners.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button onClick={onUploadClick} disabled={isUploadDisabled}>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Upload File
                </Button>
            </div>
        </div>
    );
}
