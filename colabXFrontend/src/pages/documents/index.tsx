import { useState } from 'react';
import { DocumentsHeader } from './components/documents-header';
import { FolderNav } from './components/folder-nav';
import { DocumentsTable } from './components/documents-table';
import { mockFolders, mockDocuments } from '@/lib/mock-documents';

export default function DocumentsPage() {
    const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

    // Filter documents based on the selected folder. 
    // If null, show all.
    const displayedDocuments = activeFolderId
        ? mockDocuments.filter(doc => doc.folderId === activeFolderId)
        : mockDocuments;

    return (
        <div className="flex-1 p-4 md:p-8 pt-6 h-[calc(100vh-3.5rem)] flex flex-col">
            <DocumentsHeader />

            <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden">
                {/* Left Sidebar: Folders */}
                <FolderNav
                    folders={mockFolders}
                    activeFolderId={activeFolderId}
                    onSelectFolder={setActiveFolderId}
                />

                {/* Right Content: Files */}
                <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pr-2">
                    <DocumentsTable documents={displayedDocuments} />
                </div>
            </div>
        </div>
    );
}
