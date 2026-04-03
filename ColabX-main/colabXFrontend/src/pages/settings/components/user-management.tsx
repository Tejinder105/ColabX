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
import { MoreHorizontal, Plus, Search, X, Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { OrgUser, UserRole, UserStatus } from '@/types/settings';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';

// ──────────────────────────────────────────
// Toast types
// ──────────────────────────────────────────
type ToastVariant = 'success' | 'error';

interface Toast {
    id: number;
    message: string;
    variant: ToastVariant;
}

// ──────────────────────────────────────────
// Props
// ──────────────────────────────────────────
interface UserManagementProps {
    users: OrgUser[];
    onRemove?: (userId: string) => Promise<void> | void;
    onChangeRole?: (userId: string, role: 'admin' | 'manager' | 'partner') => void;
    onInvite?: (email: string, role: string) => void;
    isRemoving?: boolean;
    isInviting?: boolean;
}

// ──────────────────────────────────────────
// Toast component
// ──────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
    return (
        <div
            className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
            role="region"
            aria-label="Notifications"
        >
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg border text-sm font-medium min-w-[260px] max-w-sm transition-all animate-in slide-in-from-right-4 ${
                        t.variant === 'success'
                            ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
                            : 'bg-red-950 border-red-700 text-red-200'
                    }`}
                >
                    {t.variant === 'success' ? (
                        <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                    ) : (
                        <XCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                    )}
                    <span className="flex-1">{t.message}</span>
                    <button
                        onClick={() => onDismiss(t.id)}
                        className="ml-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Dismiss notification"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}
        </div>
    );
}

// ──────────────────────────────────────────
// Confirmation Modal
// ──────────────────────────────────────────
interface ConfirmModalProps {
    user: OrgUser;
    isLoading: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmRemoveModal({ user, isLoading, onConfirm, onCancel }: ConfirmModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) onCancel();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isLoading, onCancel]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-remove-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !isLoading && onCancel()}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                {/* Danger icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 mx-auto mb-4">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>

                <h2
                    id="confirm-remove-title"
                    className="text-center text-base font-semibold text-foreground mb-1"
                >
                    Remove from organization
                </h2>

                <p className="text-center text-sm text-muted-foreground mb-6">
                    Are you sure you want to remove{' '}
                    <span className="font-medium text-foreground">{user.name}</span>{' '}
                    from the organization? This action cannot be undone.
                </p>

                <div className="flex gap-3">
                    <Button
                        id="confirm-remove-cancel-btn"
                        variant="outline"
                        className="flex-1"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        id="confirm-remove-confirm-btn"
                        variant="destructive"
                        className="flex-1"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Removing...' : 'Remove account'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ──────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────
export function UserManagement({ users, onRemove, onInvite, isRemoving, isInviting }: UserManagementProps) {
    const activeOrg = useAuthStore((state) => state.activeOrg);
    const currentUserRole = activeOrg?.role?.toLowerCase() ?? '';
    const canManageMembers = currentUserRole === 'admin' || currentUserRole === 'owner';

    const [searchQuery, setSearchQuery] = useState('');
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'partner'>('manager');

    // The user pending removal confirmation
    const [pendingRemoveUser, setPendingRemoveUser] = useState<OrgUser | null>(null);
    // Local loading state per-removal (supplements the global isRemoving)
    const [isRemovingLocal, setIsRemovingLocal] = useState(false);

    // Toast state
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [toastCounter, setToastCounter] = useState(0);

    const addToast = useCallback((message: string, variant: ToastVariant) => {
        const id = toastCounter + 1;
        setToastCounter(id);
        setToasts((prev) => [...prev, { id, message, variant }]);
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, [toastCounter]);

    const dismissToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const filteredUsers = users.filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendInvite = () => {
        if (!inviteEmail.trim()) return;
        onInvite?.(inviteEmail.trim(), inviteRole);
        setInviteEmail('');
        setShowInviteForm(false);
    };

    const handleConfirmRemove = async () => {
        if (!pendingRemoveUser) return;
        setIsRemovingLocal(true);
        try {
            await onRemove?.(pendingRemoveUser.id);
            addToast(`${pendingRemoveUser.name} has been removed from the organization.`, 'success');
            setPendingRemoveUser(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to remove user. Please try again.';
            addToast(message, 'error');
        } finally {
            setIsRemovingLocal(false);
        }
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

    const isActionLoading = isRemoving || isRemovingLocal;

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 pb-2">
                    <div>
                        <CardTitle className="text-xl">User &amp; Access Management</CardTitle>
                        <CardDescription>Invite organization members and manage access.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 mt-4 sm:mt-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="user-search-input"
                                placeholder="Find user or email..."
                                className="pl-8 bg-card w-full sm:w-64 border-muted-foreground/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button id="invite-user-btn" onClick={() => setShowInviteForm(!showInviteForm)}>
                            {showInviteForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                            {showInviteForm ? 'Cancel' : 'Invite User'}
                        </Button>
                    </div>
                </CardHeader>

                {/* Inline invite form */}
                {showInviteForm && (
                    <div className="px-6 py-3 border-t bg-muted/20">
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
                                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
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
                            <Button
                                id="send-invite-btn"
                                size="sm"
                                className="h-9"
                                onClick={handleSendInvite}
                                disabled={!inviteEmail.trim() || isInviting}
                            >
                                {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Invite
                            </Button>
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
                                {canManageMembers && (
                                    <TableHead className="text-right">Manage</TableHead>
                                )}
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

                                    {/* Manage dropdown — only visible to Admin/Owner, only for Active members */}
                                    {canManageMembers && (
                                        <TableCell className="text-right pr-4">
                                            {user.status !== 'Invited' && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            id={`manage-user-${user.id}-btn`}
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            aria-label={`Manage ${user.name}`}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {/* Only "Remove account" — destructive, styled red */}
                                                        <DropdownMenuItem
                                                            id={`remove-user-${user.id}-option`}
                                                            className="text-destructive font-medium focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                                            disabled={isActionLoading}
                                                            onSelect={() => setPendingRemoveUser(user)}
                                                        >
                                                            {isActionLoading && pendingRemoveUser?.id === user.id ? (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            ) : null}
                                                            Remove account
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {filteredUsers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={canManageMembers ? 5 : 4} className="h-24 text-center text-muted-foreground">
                                        No users found matching your query.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Confirmation Modal */}
            {pendingRemoveUser && (
                <ConfirmRemoveModal
                    user={pendingRemoveUser}
                    isLoading={isActionLoading}
                    onConfirm={handleConfirmRemove}
                    onCancel={() => setPendingRemoveUser(null)}
                />
            )}

            {/* Toast notifications */}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </>
    );
}
