import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    MoreHorizontal,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Users
} from 'lucide-react';
import type { Team } from '@/types/team';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';

type SortConfig = { key: keyof Team; direction: 'asc' | 'desc' } | null;

interface TeamsTableProps {
    teams: Team[];
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onRowClick?: (team: Team) => void;
}

export function TeamsTable({
    teams,
    searchQuery,
    onSearchChange,
    onRowClick
}: TeamsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const handleSort = (key: keyof Team) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const filteredTeams = teams.filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.leadName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const sortedTeams = [...filteredTeams].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        const valueA = a[key] ?? '';
        const valueB = b[key] ?? '';
        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const totalPages = Math.ceil(sortedTeams.length / itemsPerPage) || 1;
    const paginatedTeams = sortedTeams.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search teams or leads..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => {
                            onSearchChange(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            <div className="border rounded-md mt-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('name')}>
                                    <span>Team Name</span>
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('leadName')}>
                                    <span>Team Lead</span>
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('memberCount')}>
                                    <span>Members</span>
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('partnersManagedCount')}>
                                    <span>Partners Managed</span>
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>
                                <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('dealsCount')}>
                                    <span>Deals</span>
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teams.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3">
                                        <div className="bg-muted p-4 rounded-full">
                                            <Users className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-semibold">No teams found</h3>
                                        <p className="text-muted-foreground max-w-sm">
                                            There are no teams matching your criteria.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredTeams.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <Search className="h-6 w-6 text-muted-foreground mb-2" />
                                        <h4 className="font-semibold">No results</h4>
                                        <p className="text-muted-foreground text-sm">
                                            Try adjusting your search query.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedTeams.map((team) => (
                                <TableRow
                                    key={team.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => { if (onRowClick) onRowClick(team); }}
                                >
                                    <TableCell className="font-medium">{team.name}</TableCell>
                                    <TableCell>{team.leadName}</TableCell>
                                    <TableCell>{team.memberCount}</TableCell>
                                    <TableCell>{team.partnersManagedCount}</TableCell>
                                    <TableCell>{team.dealsCount}</TableCell>
                                    <TableCell>
                                        <Badge variant={team.status === 'Active' ? 'default' : 'secondary'} className={team.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>
                                            {team.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); if (onRowClick) onRowClick(team); }}>
                                                    View team
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Edit team</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Assign members</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-destructive">Delete team</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedTeams.length)} of {sortedTeams.length} teams
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
