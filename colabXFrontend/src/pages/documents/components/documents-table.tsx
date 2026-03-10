import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, FileImage, FileBarChart, Download, MoreHorizontal, Search, File } from 'lucide-react';
import type { AppDocument, FileType, AccessLevel } from '@/types/document';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';

export function DocumentsTable({ documents }: { documents: AppDocument[] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDocs = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getFileIcon = (type: FileType) => {
        switch (type) {
            case 'PDF': return <FileText className="h-5 w-5 text-red-500" />;
            case 'DOC': return <FileText className="h-5 w-5 text-blue-500" />;
            case 'XLS': return <FileBarChart className="h-5 w-5 text-emerald-500" />;
            case 'PPT': return <FileBarChart className="h-5 w-5 text-orange-500" />;
            case 'IMG': return <FileImage className="h-5 w-5 text-purple-500" />;
            default: return <File className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const getAccessBadge = (level: AccessLevel) => {
        switch (level) {
            case 'Organization': return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">Organization</Badge>;
            case 'Team': return <Badge variant="secondary" className="bg-violet-500/10 text-violet-500">Team</Badge>;
            case 'Partner': return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Partner</Badge>;
            default: return <Badge variant="outline">{level}</Badge>;
        }
    };

    return (
        <div className="flex-1 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search files or uploaders..."
                        className="pl-8 bg-card"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">File Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Location Access</TableHead>
                            <TableHead>Uploaded By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredDocs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="bg-muted p-4 rounded-full">
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold">No documents found</h3>
                                        <p className="text-muted-foreground max-w-sm">
                                            Try adjusting your search query or upload a new file.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredDocs.map((doc) => (
                                <TableRow key={doc.id} className="group hover:bg-muted/50">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            {getFileIcon(doc.type)}
                                            <span className="truncate max-w-[200px]" title={doc.name}>{doc.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{doc.type}</TableCell>
                                    <TableCell>{getAccessBadge(doc.accessLevel)}</TableCell>
                                    <TableCell>{doc.uploadedBy}</TableCell>
                                    <TableCell className="text-muted-foreground">{doc.uploadDate}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 text-muted-foreground">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem>View document</DropdownMenuItem>
                                                    <DropdownMenuItem>Download</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>Manage access</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
