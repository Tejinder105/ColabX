import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileClock, Search, Download } from 'lucide-react';
import { useState } from 'react';
import type { AuditLogEntry } from '@/types/settings';

export function AuditLogs({ logs, isLoading }: { logs: AuditLogEntry[]; isLoading?: boolean }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const filteredLogs = logs.filter(l =>
        l.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.target.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pagedLogs = filteredLogs.slice(startIdx, endIdx);

    const handleExportCsv = () => {
        if (filteredLogs.length === 0) return;
        const header = ['Timestamp', 'Actor', 'Action', 'Target', 'IP Address'];
        const rows = filteredLogs.map((log) => [
            log.timestamp,
            log.user,
            log.action,
            log.target,
            log.ipAddress || 'Internal',
        ]);

        const csv = [header, ...rows]
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 pb-2 border-b">
                <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <FileClock className="h-5 w-5 text-blue-500" />
                        System Audit Logs
                    </CardTitle>
                    <CardDescription>Track internal actions, configuration changes, and security events.</CardDescription>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            className="pl-8 bg-card w-full sm:w-64 border-muted-foreground/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 border-b">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/10">
                            <TableHead className="pl-6 w-1/4">Timestamp</TableHead>
                            <TableHead className="w-1/5">Actor</TableHead>
                            <TableHead className="w-[200px]">Action</TableHead>
                            <TableHead>Target/Details</TableHead>
                            <TableHead className="text-right pr-6">IP Address</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                                    Loading audit logs...
                                </TableCell>
                            </TableRow>
                        )}
                        {!isLoading && pagedLogs.map((log) => (
                            <TableRow key={log.activityLogId} className="hover:bg-muted/30 font-mono text-[13px] text-muted-foreground">
                                <TableCell className="pl-6">{log.timestamp}</TableCell>
                                <TableCell className="font-semibold text-foreground/80">{log.user}</TableCell>
                                <TableCell>
                                    <span className="bg-secondary/50 px-2 py-0.5 rounded-sm border">{log.action}</span>
                                </TableCell>
                                <TableCell className="truncate max-w-[250px]" title={log.target}>{log.target}</TableCell>
                                <TableCell className="text-right pr-6">{log.ipAddress || 'Internal'}</TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && pagedLogs.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                                    No audit logs found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="px-6 py-4 justify-between bg-muted/10">
                <p className="text-sm text-muted-foreground">
                    Showing {filteredLogs.length === 0 ? 0 : startIdx + 1} to {Math.min(endIdx, filteredLogs.length)} of {filteredLogs.length} entries
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous Page</Button>
                    <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next Page</Button>
                    <Button variant="secondary" size="sm" className="ml-4 gap-2" onClick={handleExportCsv} disabled={filteredLogs.length === 0}>
                        <Download className="w-4 h-4" /> Export Logs
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
