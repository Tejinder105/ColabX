import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { MoreHorizontal, Plus, Search } from 'lucide-react';
import type { OrgUser, UserRole, UserStatus } from '@/types/settings';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';

export function UserManagement({ users }: { users: OrgUser[] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getRoleBadge = (role: UserRole) => {
        switch (role) {
            case 'Admin': return <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">Admin</Badge>;
            case 'Manager': return <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">Manager</Badge>;
            case 'Partner': return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Partner</Badge>;
            default: return <Badge variant="outline">User</Badge>;
        }
    };

    const getStatusIndicator = (status: UserStatus) => {
        switch (status) {
            case 'Active': return <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" /> Active</span>;
            case 'Invited': return <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" /> Pending</span>;
            case 'Suspended': return <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-destructive flex-shrink-0" /> Suspended</span>;
            default: return status;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 pb-2">
                <div>
                    <CardTitle className="text-xl">User & Access Management</CardTitle>
                    <CardDescription>Invite organization members and define base roles.</CardDescription>
                </div>
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Find user or email..."
                            className="pl-8 bg-card w-full sm:w-64 border-muted-foreground/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Invite User
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0 border-t">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30">
                            <TableHead className="pl-6">Name</TableHead>
                            <TableHead>System Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead className="text-right">Manage</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id} className="hover:bg-muted/50">
                                <TableCell className="pl-6 font-medium">
                                    <div className="flex flex-col gap-0.5">
                                        <span>{user.name}</span>
                                        <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                <TableCell>{getStatusIndicator(user.status)}</TableCell>
                                <TableCell className="text-muted-foreground">{user.lastActive || '-'}</TableCell>
                                <TableCell className="text-right pr-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>Change specific role</DropdownMenuItem>
                                            <DropdownMenuItem>Reset password</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive font-medium">Remove account</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No users found matching your query.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
