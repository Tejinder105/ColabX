export type AccessLevel = 'Organization' | 'Team' | 'Partner';
export type FileType = 'PDF' | 'DOC' | 'XLS' | 'PPT' | 'IMG' | 'OTHER';

export interface AppDocument {
    id: string;
    folderId: string;
    name: string;
    type: FileType;
    size: string; // e.g. "2.4 MB"
    uploadedBy: string;
    uploadDate: string;
    accessLevel: AccessLevel;
}

export interface AppFolder {
    id: string;
    name: string;
    fileCount: number;
    icon?: string;
}
