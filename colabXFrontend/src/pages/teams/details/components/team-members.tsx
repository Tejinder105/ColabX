import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import type { TeamMember } from '@/types/team';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamMembersProps {
    members: TeamMember[];
    onRemove?: (memberId: string) => void;
    onChangeRole?: (memberId: string, newRole: 'lead' | 'member') => void;
}

export function TeamMembers({ members, onRemove, onChangeRole }: TeamMembersProps) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Team Members</h3>
                <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                </Button>
            </div>
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
