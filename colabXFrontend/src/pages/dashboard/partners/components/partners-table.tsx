import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Filter,
    MoreHorizontal,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import type { Partner } from '@/types/partner';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useState } from 'react';
import { useRbac } from '@/hooks/useRbac';

type SortConfig = { key: keyof Partner | 'performanceScore'; direction: 'asc' | 'desc' } | null;

interface PartnersTableProps {
    partners: Partner[];
    activeTab: string;
    onTabChange: (value: string) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onRowClick?: (partner: Partner) => void;
}

export function PartnersTable({
    partners,
    activeTab,
    onTabChange,
    searchQuery,
    onSearchChange,
    onRowClick
}: PartnersTableProps) {
    const { canManagePartners } = useRbac();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    // Local active filters
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [industryFilter, setIndustryFilter] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const handleSort = (key: keyof Partner) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Local filtering based on tabs, search, and dropdowns
    const filteredPartners = partners.filter((p) => {
        // Text search
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.ownerName.toLowerCase().includes(searchQuery.toLowerCase());

        // Dropdown filters
        const matchesType = typeFilter === 'all' || p.type === typeFilter;
        const matchesIndustry = industryFilter === 'all' || p.industry === industryFilter;
        const matchesStatus = statusFilter === 'all' || p.uiStatus === statusFilter;

        // Tab filters
        let matchesTab = true;
        if (activeTab === 'pipeline') matchesTab = p.openDealsCount > 0;
        if (activeTab === 'at-risk') matchesTab = p.uiStatus === 'Red';

        return matchesSearch && matchesType && matchesIndustry && matchesStatus && matchesTab;
    });

    // Sorting
    const sortedPartners = [...filteredPartners].sort((a, b) => {
        if (!sortConfig) return 0;

        const { key, direction } = sortConfig;
        const valueA = a[key] ?? '';
        const valueB = b[key] ?? '';

        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(sortedPartners.length / itemsPerPage);
    const paginatedPartners = sortedPartners.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getUIStatusBadge = (uiStatus: string) => {
        switch (uiStatus) {
            case 'Green': return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Green</Badge>;
            case 'Yellow': return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Yellow</Badge>;
            case 'Red': return <Badge variant="destructive">Red</Badge>;
            default: return <Badge variant="outline">{uiStatus}</Badge>;
        }
    };

    return (
        <div className="space-y-4">
            <Tabs defaultValue={activeTab} onValueChange={onTabChange} className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <TabsList>
                        <TabsTrigger value="all">All Partners ({partners.length})</TabsTrigger>
                        <TabsTrigger value="pipeline">Pipeline ({partners.filter(p => p.openDealsCount > 0).length})</TabsTrigger>
                        <TabsTrigger value="at-risk">At Risk ({partners.filter(p => p.uiStatus === 'Red').length})</TabsTrigger>
                    </TabsList>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search partners..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => {
                                    onSearchChange(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Technology">Technology</SelectItem>
                                <SelectItem value="Agency">Agency</SelectItem>
                                <SelectItem value="Reseller">Reseller</SelectItem>
                                <SelectItem value="Strategic">Strategic</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={industryFilter} onValueChange={(v) => { setIndustryFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Industry" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Industries</SelectItem>
                                <SelectItem value="Software">Software</SelectItem>
                                <SelectItem value="Finance">Finance</SelectItem>
                                <SelectItem value="Retail">Retail</SelectItem>
                                <SelectItem value="Healthcare">Healthcare</SelectItem>
                                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                                <SelectItem value="Defense">Defense</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Green">Green</SelectItem>
                                <SelectItem value="Yellow">Yellow</SelectItem>
                                <SelectItem value="Red">Red</SelectItem>
                            </SelectContent>
                        </Select>

                    </div>
                </div>

                <TabsContent value={activeTab} className="mt-4 border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('name')}>
                                        <span>Partner Name</span>
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Industry</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>
                                    <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('performanceScore')}>
                                        <span>Performance Score</span>
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button variant="ghost" size="sm" className="-ml-3 h-8 data-[state=open]:bg-accent" onClick={() => handleSort('lastActivityDate')}>
                                        <span>Last Activity</span>
                                        <ArrowUpDown className="ml-2 h-4 w-4" />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="bg-muted p-4 rounded-full">
                                                <Filter className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <h3 className="text-lg font-semibold">No partners yet</h3>
                                            <p className="text-muted-foreground max-w-sm">
                                                You don't have any partners in the system. Add your first partner to get started.
                                            </p>
                                            <Button className="mt-4" variant="outline">Add Partner</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredPartners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-48 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <Search className="h-6 w-6 text-muted-foreground mb-2" />
                                            <h4 className="font-semibold">No results found</h4>
                                            <p className="text-muted-foreground text-sm">
                                                We couldn't find any partners matching your filters.
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedPartners.map((partner) => (
                                    <TableRow
                                        key={partner.id}
                                        className="cursor-pointer hover:bg-muted/50"
                                        onClick={() => onRowClick && onRowClick(partner)}
                                    >
                                        <TableCell className="font-medium">{partner.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{partner.type}</Badge>
                                        </TableCell>
                                        <TableCell>{partner.industry}</TableCell>
                                        <TableCell>
                                            {getUIStatusBadge(partner.uiStatus)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 font-medium">
                                                {partner.performanceScore}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {format(new Date(partner.lastActivityDate), "MMM d, yyyy")}
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
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRowClick && onRowClick(partner); }}>
                                                        View details
                                                    </DropdownMenuItem>
                                                    {canManagePartners && (
                                                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Edit partner</DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    {canManagePartners && (
                                                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Assign Team</DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Add Deal</DropdownMenuItem>
                                                    {canManagePartners && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-destructive">Disable Partner</DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedPartners.length)} of {sortedPartners.length} partners
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
