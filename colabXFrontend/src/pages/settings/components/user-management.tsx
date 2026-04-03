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
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Plus, Search, X, Loader2, Copy, Check } from 'lucide-react';
import type { OrgUser, UserRole, UserStatus } from '@/types/settings';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from 'react';

interface UserManagementProps {
    users: OrgUser[];
    onRemove?: (userId: string) => void;
    onChangeRole?: (userId: string, role: 'admin' | 'manager' | 'partner') => void;
    onInvite?: (email: string, role: string, partnerType?: string, partnerIndustry?: string) => void;
    isRemoving?: boolean;
    isInviting?: boolean;
    invitationToken?: string | null;
    onTokenDismiss?: () => void;
}

// Partner types and industries - keep in sync with backend
const PARTNER_TYPES = [
    { value: 'reseller', label: 'Reseller' },
    { value: 'agent', label: 'Agent' },
    { value: 'technology', label: 'Technology Partner' },
    { value: 'distributor', label: 'Distributor' },
] as const;

const PARTNER_INDUSTRIES = [
    { value: 'Software', label: 'Software' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Defense', label: 'Defense' },
    { value: 'Other', label: 'Other' },
] as const;

export function UserManagement({ users, onRemove, onChangeRole, onInvite, isRemoving, isInviting, invitationToken, onTokenDismiss }: UserManagementProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'partner'>('manager');
    const [partnerType, setPartnerType] = useState<string>('');
    const [partnerIndustry, setPartnerIndustry] = useState<string>('');
    const [copied, setCopied] = useState(false);

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendInvite = (event?: React.MouseEvent) => {
        event?.preventDefault();
        if (!inviteEmail.trim()) return;
        // Partner role requires type selection
        if (inviteRole === 'partner' && !partnerType) return;
        onInvite?.(
            inviteEmail.trim(),
            inviteRole,
            inviteRole === 'partner' ? partnerType : undefined,
            inviteRole === 'partner' ? partnerIndustry || undefined : undefined
        );
    };

    // Reset partner fields when role changes away from partner
    const handleRoleChange = (role: 'admin' | 'manager' | 'partner') => {
        setInviteRole(role);
        if (role !== 'partner') {
            setPartnerType('');
            setPartnerIndustry('');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                    <Button onClick={() => setShowInviteForm(!showInviteForm)}>
                        {showInviteForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                        {showInviteForm ? 'Cancel' : 'Invite User'}
                    </Button>
                </div>
            </CardHeader>

            {/* Inline invite form */}
            {showInviteForm && (
                <div className="px-6 py-3 border-t bg-muted/20">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row items-end gap-3">
                            <div className="flex-1 grid gap-1.5">
                                <Label htmlFor="inviteEmail" className="text-xs text-muted-foreground">Email address</Label>
                                <Input
                                    id="inviteEmail"
                                    type="email"
                                    placeholder="user@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    className="h-9"
                                />
                            </div>
                            <div className="grid gap-1.5">
                                <Label className="text-xs text-muted-foreground">Role</Label>
                                <Select value={inviteRole} onValueChange={(v) => handleRoleChange(v as typeof inviteRole)}>
                                    <SelectTrigger className="h-9 w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                        <SelectItem value="partner">Partner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {inviteRole !== 'partner' && (
                                <Button
                                    size="sm"
                                    className="h-9"
                                    onClick={handleSendInvite}
                                    disabled={!inviteEmail.trim() || isInviting}
                                >
                                    {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Invite
                                </Button>
                            )}
                        </div>

                        {/* Partner-specific fields */}
                        {inviteRole === 'partner' && (
                            <div className="flex flex-col sm:flex-row items-end gap-3 pt-2 border-t border-muted-foreground/10">
                                <div className="grid gap-1.5">
                                    <Label className="text-xs text-muted-foreground">Partner Type *</Label>
                                    <Select value={partnerType} onValueChange={setPartnerType}>
                                        <SelectTrigger className="h-9 w-44">
                                            <SelectValue placeholder="Select type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PARTNER_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-1.5">
                                    <Label className="text-xs text-muted-foreground">Industry</Label>
                                    <Select value={partnerIndustry} onValueChange={setPartnerIndustry}>
                                        <SelectTrigger className="h-9 w-44">
                                            <SelectValue placeholder="Select industry..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {PARTNER_INDUSTRIES.map((industry) => (
                                                <SelectItem key={industry.value} value={industry.value}>
                                                    {industry.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    size="sm"
                                    className="h-9"
                                    onClick={handleSendInvite}
                                    disabled={!inviteEmail.trim() || !partnerType || isInviting}
                                >
                                    {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Invite
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}

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
                                    {user.status !== 'Invited' && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onSelect={() => onChangeRole?.(user.id, 'admin')}>
                                                    Set as Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => onChangeRole?.(user.id, 'manager')}>
                                                    Set as Manager
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => onChangeRole?.(user.id, 'partner')}>
                                                    Set as Partner
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive font-medium"
                                                    disabled={isRemoving}
                                                    onSelect={() => {
                                                        if (window.confirm(`Remove ${user.name} from the organization?`)) {
                                                            onRemove?.(user.id);
                                                        }
                                                    }}
                                                >
                                                    Remove account
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
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

            {/* Invitation Token Display Modal */}
            <Dialog open={!!invitationToken} onOpenChange={(open) => !open && onTokenDismiss?.()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>✅ Invitation Sent!</DialogTitle>
                        <DialogDescription>
                            An invitation email has been sent to {inviteEmail}.
                            You can also share this code with them.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="token" className="text-xs text-muted-foreground mb-2 block">
                                Invitation Code
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="token"
                                    readOnly
                                    value={invitationToken || ''}
                                    className="font-mono font-bold text-sm"
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => copyToClipboard(invitationToken || '')}
                                    className="flex-shrink-0"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-sm text-blue-900">
                                <strong>💡 Tip:</strong> Share the code above or the email contains a direct join link.
                                The invitation expires in 7 days.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => {
                                onTokenDismiss?.();
                                setInviteEmail('');
                                setShowInviteForm(false);
                            }}
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
