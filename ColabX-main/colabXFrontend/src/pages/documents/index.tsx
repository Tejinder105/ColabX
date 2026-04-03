import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DocumentsHeader } from './components/documents-header';
import { FolderNav } from './components/folder-nav';
import { DocumentsTable } from './components/documents-table';
import type { AppDocument, AppFolder, FileType, AccessLevel } from '@/types/document';
import {
    useCreateDocumentForPartnerMutation,
    useDeleteDocumentMutation,
    useOrgDocuments,
    useUpdateDocumentVisibilityMutation,
} from '@/hooks/useCollaboration';
import { usePartners } from '@/hooks/usePartners';
import { uploadToCloudinary } from '@/lib/cloudinary';
import {
    ACCEPTED_UPLOAD_EXTENSIONS,
    ACCEPTED_UPLOAD_LABEL,
    MAX_UPLOAD_SIZE_BYTES,
    formatUploadSize,
    validateUploadFile,
} from '@/lib/documentUpload';

type DocumentVisibility = 'public' | 'private' | 'team';

function toFileType(fileName: string): FileType {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'PDF';
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'DOC';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'XLS';
    if (['ppt', 'pptx'].includes(ext)) return 'PPT';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'IMG';
    return 'OTHER';
}

function toAccessLevel(visibility: string): AccessLevel {
    if (visibility === 'public') return 'Organization';
    if (visibility === 'team') return 'Team';
    return 'Partner';
}

export default function DocumentsPage() {
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
    const [selectedVisibility, setSelectedVisibility] = useState<DocumentVisibility>('private');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const { data: orgDocumentsData, isLoading, isError, error } = useOrgDocuments();
    const { data: partnersData } = usePartners();

    const createDocumentMutation = useCreateDocumentForPartnerMutation();
    const deleteDocumentMutation = useDeleteDocumentMutation();
    const updateVisibilityMutation = useUpdateDocumentVisibilityMutation();

    const documents = orgDocumentsData?.documents ?? [];
    const partners = partnersData?.partners ?? [];

    const folders = useMemo<AppFolder[]>(() => {
        const folderMap = new Map<string, AppFolder>();

        documents.forEach((doc) => {
            if (!doc.partnerId) return;
            const name = doc.partnerName || 'Unknown Partner';
            const existing = folderMap.get(doc.partnerId);
            if (existing) {
                existing.fileCount += 1;
                return;
            }
            folderMap.set(doc.partnerId, {
                id: doc.partnerId,
                name,
                fileCount: 1,
            });
        });

        return Array.from(folderMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [documents]);

    const allDocuments = useMemo<AppDocument[]>(() => {
        return documents.map((doc) => ({
            id: doc.id,
            folderId: doc.partnerId || 'unknown',
            name: doc.fileName,
            type: toFileType(doc.fileName),
            size: '--',
            uploadedBy: doc.uploaderName || 'Unknown user',
            uploadDate: new Date(doc.uploadedAt).toLocaleDateString(),
            accessLevel: toAccessLevel(doc.visibility),
            url: doc.fileUrl,
        }));
    }, [documents]);

    const displayedDocuments = activeFolderId
        ? allDocuments.filter((doc) => doc.folderId === activeFolderId)
        : allDocuments;

    const isMutating = createDocumentMutation.isPending || deleteDocumentMutation.isPending || updateVisibilityMutation.isPending;

    function handleFileSelected(file: File | null) {
        if (!file) {
            setSelectedFile(null);
            return;
        }

        const validationError = validateUploadFile(file);
        if (validationError) {
            toast.error(validationError);
            setSelectedFile(null);
            return;
        }

        setSelectedFile(file);
    }

    async function handleUploadSubmit() {
        if (!selectedPartnerId) {
            toast.error('Please select a partner folder.');
            return;
        }

        if (!selectedFile) {
            toast.error('Please choose a file to upload.');
            return;
        }

        try {
            const uploaded = await uploadToCloudinary({ file: selectedFile });
            await createDocumentMutation.mutateAsync({
                partnerId: selectedPartnerId,
                input: {
                    fileName: selectedFile.name || uploaded.originalFilename,
                    fileUrl: uploaded.secureUrl,
                    visibility: selectedVisibility,
                },
            });

            toast.success('Document uploaded successfully.');
            setIsUploadOpen(false);
            setSelectedFile(null);
            setIsDragActive(false);
            setSelectedPartnerId('');
            setSelectedVisibility('private');
        } catch (uploadError) {
            const message = uploadError instanceof Error ? uploadError.message : 'Failed to upload document';
            toast.error(message);
        }
    }

    async function handleDeleteDocument(doc: AppDocument) {
        try {
            await deleteDocumentMutation.mutateAsync(doc.id);
            toast.success('Document deleted.');
        } catch (deleteError) {
            const message = deleteError instanceof Error ? deleteError.message : 'Failed to delete document';
            toast.error(message);
        }
    }

    async function handleUpdateVisibility(doc: AppDocument, visibility: DocumentVisibility) {
        try {
            await updateVisibilityMutation.mutateAsync({ documentId: doc.id, visibility });
            toast.success('Document access updated.');
        } catch (visibilityError) {
            const message = visibilityError instanceof Error ? visibilityError.message : 'Failed to update document access';
            toast.error(message);
        }
    }

    function handleOpenDocument(doc: AppDocument) {
        if (!doc.url) {
            toast.error('No file URL available for this document.');
            return;
        }
        window.open(doc.url, '_blank', 'noopener,noreferrer');
    }

    function handleDownloadDocument(doc: AppDocument) {
        if (!doc.url) {
            toast.error('No file URL available for this document.');
            return;
        }
        const anchor = document.createElement('a');
        anchor.href = doc.url;
        anchor.download = doc.name;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    }

    const uploadButtonDisabled = partners.length === 0;

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 h-[calc(100vh-3.5rem)] flex flex-col">
            <DocumentsHeader
                onUploadClick={() => setIsUploadOpen(true)}
                isUploadDisabled={uploadButtonDisabled}
            />

            {isLoading ? (
                <div className="flex-1 grid place-items-center">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading documents...</span>
                    </div>
                </div>
            ) : null}

            {isError ? (
                <div className="flex-1 grid place-items-center">
                    <div className="text-center space-y-2">
                        <p className="font-semibold">Could not load documents</p>
                        <p className="text-sm text-muted-foreground">
                            {error instanceof Error ? error.message : 'Please try again.'}
                        </p>
                    </div>
                </div>
            ) : null}

            {!isLoading && !isError ? (
                <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
                    <FolderNav
                        folders={folders}
                        activeFolderId={activeFolderId}
                        onSelectFolder={setActiveFolderId}
                    />

                    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-2">
                        <DocumentsTable
                            documents={displayedDocuments}
                            isMutating={isMutating}
                            onViewDocument={handleOpenDocument}
                            onDownloadDocument={handleDownloadDocument}
                            onDeleteDocument={handleDeleteDocument}
                            onUpdateVisibility={handleUpdateVisibility}
                        />
                    </div>
                </div>
            ) : null}

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                            Upload to Cloudinary, then save metadata to the selected partner folder.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="partner">Partner Folder</Label>
                            <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                                <SelectTrigger id="partner">
                                    <SelectValue placeholder="Select partner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {partners.map((partner) => (
                                        <SelectItem key={partner.id} value={partner.id}>
                                            {partner.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="visibility">Visibility</Label>
                            <Select
                                value={selectedVisibility}
                                onValueChange={(value) => setSelectedVisibility(value as DocumentVisibility)}
                            >
                                <SelectTrigger id="visibility">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="private">Partner</SelectItem>
                                    <SelectItem value="team">Team</SelectItem>
                                    <SelectItem value="public">Organization</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">File</Label>
                            <div
                                className={cn(
                                    'rounded-md border-2 border-dashed p-4 transition-colors',
                                    isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30'
                                )}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    setIsDragActive(true);
                                }}
                                onDragLeave={(event) => {
                                    event.preventDefault();
                                    setIsDragActive(false);
                                }}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    setIsDragActive(false);
                                    handleFileSelected(event.dataTransfer.files?.[0] || null);
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
                                        onChange={(event) => handleFileSelected(event.target.files?.[0] || null)}
                                    />
                                    <p className="text-xs text-muted-foreground">Allowed: {ACCEPTED_UPLOAD_LABEL}</p>
                                    <p className="text-xs text-muted-foreground">Max size: {formatUploadSize(MAX_UPLOAD_SIZE_BYTES)}</p>
                                    {selectedFile ? (
                                        <p className="text-xs font-medium">Selected: {selectedFile.name} ({formatUploadSize(selectedFile.size)})</p>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isMutating}>
                            Cancel
                        </Button>
                        <Button onClick={handleUploadSubmit} disabled={isMutating}>
                            {isMutating ? 'Uploading...' : 'Upload'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
