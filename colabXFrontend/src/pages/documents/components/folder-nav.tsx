import { Folder, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AppFolder } from '@/types/document';

interface FolderNavProps {
    folders: AppFolder[];
    activeFolderId: string | null;
    onSelectFolder: (id: string | null) => void;
}

export function FolderNav({ folders, activeFolderId, onSelectFolder }: FolderNavProps) {
    return (
        <div className="w-full md:w-64 flex-shrink-0 border rounded-md bg-card flex flex-col h-[500px]">
            <div className="p-4 border-b">
                <h3 className="font-semibold text-lg">Folders</h3>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    <Button
                        variant={activeFolderId === null ? 'secondary' : 'ghost'}
                        className="w-full justify-start text-left font-normal"
                        onClick={() => onSelectFolder(null)}
                    >
                        {activeFolderId === null ? <FolderOpen className="mr-2 h-4 w-4 text-blue-500" /> : <Folder className="mr-2 h-4 w-4 text-muted-foreground" />}
                        All Documents
                    </Button>
                    {folders.map((folder) => {
                        const isActive = activeFolderId === folder.id;
                        return (
                            <Button
                                key={folder.id}
                                variant={isActive ? 'secondary' : 'ghost'}
                                className="w-full justify-start text-left font-normal flex items-center justify-between group"
                                onClick={() => onSelectFolder(folder.id)}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    {isActive ? <FolderOpen className="h-4 w-4 text-blue-500" /> : <Folder className="h-4 w-4 text-muted-foreground group-hover:text-blue-500/70" />}
                                    <span className="truncate">{folder.name}</span>
                                </div>
                                <span className="text-xs text-muted-foreground ml-2">{folder.fileCount}</span>
                            </Button>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
