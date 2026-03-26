import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Loader2 } from 'lucide-react';
import type { TeamMember } from '@/types/team';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TeamMembersProps {
    members: TeamMember[];
    availableMembers?: Array<{ id: string; name: string; email: string }>;
    onAdd?: (memberId: string, role: 'lead' | 'member') => void;
    isAdding?: boolean;
    onRemove?: (memberId: string) => void;
    onChangeRole?: (memberId: string, newRole: 'lead' | 'member') => void;
}

export function TeamMembers({
    members,
    availableMembers = [],
    onAdd,
    isAdding,
    onRemove,
    onChangeRole,
}: TeamMembersProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [newMemberRole, setNewMemberRole] = useState<'lead' | 'member'>('member');

    const handleAddMember = () => {
        if (!selectedMemberId) return;
        onAdd?.(selectedMemberId, newMemberRole);
        setSelectedMemberId('');
        setNewMemberRole('member');
        setShowAddForm(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Team Members</h3>
                <Button
                    size="sm"
                    onClick={() => setShowAddForm((prev) => !prev)}
                    disabled={availableMembers.length === 0 && !showAddForm}
                >
                    {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    {showAddForm ? 'Cancel' : 'Add Member'}
                </Button>
            </div>

            {showAddForm && (
                <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-[1fr_140px_auto] sm:items-end">
                    <div className="grid gap-1.5">
                        <span className="text-xs text-muted-foreground">Organization member</span>
                        <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a member" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableMembers.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.name} ({member.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-1.5">
                        <span className="text-xs text-muted-foreground">Role</span>
                        <Select value={newMemberRole} onValueChange={(value) => setNewMemberRole(value as 'lead' | 'member')}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="lead">Team Lead</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleAddMember}
                        disabled={!selectedMemberId || isAdding}
                    >
                        {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add
                    </Button>
                </div>
            )}

            {availableMembers.length === 0 && (
                <p className="text-sm text-muted-foreground">All organization members are already on this team.</p>
            )}

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No team members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="font-medium">{member.name}</TableCell>
                                    <TableCell>{member.role}</TableCell>
                                    <TableCell className="text-muted-foreground">{member.email}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onSelect={() => onChangeRole?.(member.id, member.role === 'Team Lead' ? 'member' : 'lead')}
                                                >
                                                    {member.role === 'Team Lead' ? 'Set as Member' : 'Set as Team Lead'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onSelect={() => {
                                                        if (window.confirm(`Remove ${member.name} from this team?`)) {
                                                            onRemove?.(member.id);
                                                        }
                                                    }}
                                                >
                                                    Remove member
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
