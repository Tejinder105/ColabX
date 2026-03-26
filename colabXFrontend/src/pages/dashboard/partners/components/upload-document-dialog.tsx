import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Loader2 } from 'lucide-react';
import { useCreateDocumentMutation } from '@/hooks/useCollaboration';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';
import {
    ACCEPTED_UPLOAD_EXTENSIONS,
    ACCEPTED_UPLOAD_LABEL,
    MAX_UPLOAD_SIZE_BYTES,
    formatUploadSize,
    validateUploadFile,
} from '@/lib/documentUpload';
import { cn } from '@/lib/utils';

interface UploadDocumentDialogProps {
    partnerId: string;
}

export function UploadDocumentDialog({ partnerId }: UploadDocumentDialogProps) {
    const [open, setOpen] = useState(false);
    const [fileName, setFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [visibility, setVisibility] = useState<'public' | 'private' | 'team'>('private');

    const createDocument = useCreateDocumentMutation(partnerId);

    const handleFileSelected = (file: File | null) => {
        if (!file) {
            setSelectedFile(null);
            return;
        }

        const error = validateUploadFile(file);
        if (error) {
            toast.error(error);
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
        if (!fileName.trim()) {
            setFileName(file.name);
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            toast.error('Please choose a file to upload.');
            return;
        }

        try {
            const uploaded = await uploadToCloudinary({ file: selectedFile });
            await createDocument.mutateAsync({
                fileName: fileName.trim() || selectedFile.name || uploaded.originalFilename,
                fileUrl: uploaded.secureUrl,
                visibility,
            });

            toast.success('Document uploaded successfully.');
            setOpen(false);
            setFileName('');
            setSelectedFile(null);
            setIsDragActive(false);
            setVisibility('private');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upload document';
            toast.error(message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                        Upload a file.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="fileName" className="text-right">File Name</Label>
                        <Input
                            id="fileName"
                            placeholder="Contract_2024.pdf"
                            className="col-span-3"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="file" className="text-right">File</Label>
                        <div
                            className={cn(
                                'col-span-3 rounded-md border-2 border-dashed p-4 transition-colors',
                                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
                            )}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragActive(true);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                setIsDragActive(false);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragActive(false);
                                handleFileSelected(e.dataTransfer.files?.[0] || null);
                            }}
                        >
                            <div className="space-y-2 text-sm">
                                <p className="font-medium">Drag and drop a file here</p>
                                <p className="text-muted-foreground">or choose a file manually</p>
                                <Input
                                    id="file"
                                    type="file"
                                    className="cursor-pointer"
                                    accept={ACCEPTED_UPLOAD_EXTENSIONS.join(',')}
                                    onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
                                />
                                <p className="text-xs text-muted-foreground">Allowed: {ACCEPTED_UPLOAD_LABEL}</p>
                                <p className="text-xs text-muted-foreground">Max size: {formatUploadSize(MAX_UPLOAD_SIZE_BYTES)}</p>
                                {selectedFile ? (
                                    <p className="text-xs font-medium">Selected: {selectedFile.name} ({formatUploadSize(selectedFile.size)})</p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="visibility" className="text-right">Visibility</Label>
                        <Select value={visibility} onValueChange={(v) => setVisibility(v as typeof visibility)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="private">Private</SelectItem>
                                <SelectItem value="team">Team Only</SelectItem>
                                <SelectItem value="public">Public</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={createDocument.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={createDocument.isPending || !selectedFile}>
                        {createDocument.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
