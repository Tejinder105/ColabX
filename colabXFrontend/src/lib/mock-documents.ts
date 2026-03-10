import type { AppDocument, AppFolder } from '@/types/document';

export const mockFolders: AppFolder[] = [
    { id: "folder-1", name: "Contracts", fileCount: 12 },
    { id: "folder-2", name: "Partner Agreements", fileCount: 8 },
    { id: "folder-3", name: "Sales Materials", fileCount: 24 },
    { id: "folder-4", name: "Product Documents", fileCount: 45 },
    { id: "folder-5", name: "Marketing Assets", fileCount: 156 },
    { id: "folder-6", name: "Training Guides", fileCount: 5 }
];

export const mockDocuments: AppDocument[] = [
    {
        id: "doc-1",
        folderId: "folder-1",
        name: "TechCorp_MSA_Final",
        type: "PDF",
        size: "3.2 MB",
        uploadedBy: "Rahul",
        uploadDate: "10 Mar 2024",
        accessLevel: "Partner"
    },
    {
        id: "doc-2",
        folderId: "folder-3",
        name: "Q1_Product_Sheet_v2",
        type: "DOC",
        size: "1.1 MB",
        uploadedBy: "Aman",
        uploadDate: "12 Mar 2024",
        accessLevel: "Organization"
    },
    {
        id: "doc-3",
        folderId: "folder-2",
        name: "CloudX_NDA_Signed",
        type: "PDF",
        size: "850 KB",
        uploadedBy: "Priya",
        uploadDate: "15 Mar 2024",
        accessLevel: "Partner"
    },
    {
        id: "doc-4",
        folderId: "folder-4",
        name: "API_Integration_Guide",
        type: "PDF",
        size: "5.4 MB",
        uploadedBy: "System",
        uploadDate: "01 Mar 2024",
        accessLevel: "Partner"
    },
    {
        id: "doc-5",
        folderId: "folder-3",
        name: "Enterprise_Pitch_Deck",
        type: "PPT",
        size: "12.5 MB",
        uploadedBy: "Sarah",
        uploadDate: "05 Mar 2024",
        accessLevel: "Team"
    },
    {
        id: "doc-6",
        folderId: "folder-1",
        name: "GlobalSolutions_Contract",
        type: "DOC",
        size: "2.1 MB",
        uploadedBy: "Rahul",
        uploadDate: "18 Mar 2024",
        accessLevel: "Team"
    }
];
