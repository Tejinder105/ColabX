import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsHeader } from './components/settings-header';
import { ProfileSettings } from './components/profile-settings';
import { UserManagement } from './components/user-management';
import { TeamManagement } from './components/team-management';
import { AuditLogs } from './components/audit-logs';
import { Building2, Users, FileClock, Network } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import {
    useOrgDetails,
    useOrgMembers,
    usePendingInvitations,
    useOrgAuditLogs,
    useUpdateOrgMutation,
    useDeleteOrgMutation,
    useRemoveMemberMutation,
    useCreateInviteMutation,
} from '@/hooks/useOrg';
import { useCreateTeamMutation, useTeams } from '@/hooks/useTeams';
import type { OrgProfile, OrgUser, UserRole, UserStatus, OrgTeamData } from '@/types/settings';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

// Map backend role to UI Role
function mapRole(role: string): UserRole {
    switch (role?.toLowerCase()) {
        case 'admin': return 'Admin';
        case 'manager': return 'Manager';
        case 'partner': return 'Partner';
        default: return 'User';
    }
}

export default function SettingsPage() {
    const navigate = useNavigate();
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    const activeOrg = useAuthStore((state) => state.activeOrg);
    const [invitationToken, setInvitationToken] = useState<string | null>(null);

    // Data fetching
    const { data: orgData } = useOrgDetails(activeOrgId);
    const { data: membersData } = useOrgMembers(activeOrgId);
    const { data: invitesData } = usePendingInvitations(activeOrgId);
    const { data: auditData, isLoading: isAuditLoading } = useOrgAuditLogs(activeOrgId);
    const { data: teamsData } = useTeams();

    // Mutations
    const updateOrg = useUpdateOrgMutation();
    const deleteOrg = useDeleteOrgMutation();
    const removeMember = useRemoveMemberMutation();
    const createInvite = useCreateInviteMutation();
    const createTeam = useCreateTeamMutation();

    // Build OrgProfile from real data
    const orgProfile: OrgProfile = {
        name: orgData?.organization?.name ?? activeOrg?.name ?? '',
        industry: '',
        domain: orgData?.organization?.slug ?? activeOrg?.slug ?? '',
        employeeCount: '',
        establishedYear: new Date().getFullYear(),
    };

    // Build OrgUser[] from real members + pending invitations
    const orgUsers: OrgUser[] = [
        ...(membersData?.members ?? []).map((m) => ({
            id: m.id,  // orgUser row id — required for changeMemberRole and removeMember API calls
            name: m.userName,
            email: m.userEmail,
            role: mapRole(m.role),
            status: 'Active' as UserStatus,
        })),
        ...(invitesData?.invitations ?? []).map((inv) => ({
            id: inv.id,
            name: inv.email,
            email: inv.email,
            role: mapRole(inv.role),
            status: 'Invited' as UserStatus,
        })),
    ];

    // Build OrgTeamData[] from real teams
    const orgTeams: OrgTeamData[] = (teamsData?.teams ?? []).map((t) => ({
        id: t.id,
        name: t.name,
        leadName: '—',
        memberCount: t.memberCount,
        department: t.description ?? '',
    }));

    const auditLogs = (auditData?.logs ?? []).map((log) => ({
        id: log.id,
        timestamp: new Date(log.createdAt).toLocaleString(),
        user: log.userName ?? log.userEmail ?? 'Unknown',
        action: log.action,
        target: `${log.entityType}:${log.entityId}`,
    }));

    // Callbacks
    const handleSaveProfile = (name: string) => {
        if (!activeOrgId) return;
        updateOrg.mutate({ orgId: activeOrgId, name });
    };

    const handleDeleteOrg = () => {
        if (!activeOrgId) return;
        if (!window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;
        deleteOrg.mutate(activeOrgId, {
            onSuccess: () => navigate('/onboarding'),
        });
    };

    const handleRemoveMember = (userId: string) => {
        if (!activeOrgId) return;
        removeMember.mutate({ orgId: activeOrgId, memberId: userId });
    };

    const handleInvite = (email: string, role: string, partnerType?: string, partnerIndustry?: string) => {
        if (!activeOrgId) return;
        createInvite.mutate(
            {
                orgId: activeOrgId,
                email,
                role: role as 'admin' | 'manager' | 'partner',
                partnerType,
                partnerIndustry,
            },
            {
                onSuccess: (data) => {
                    // Show token to admin
                    setInvitationToken(data.invitation.token);
                },
            }
        );
    };

    const handleCreateTeam = (name: string, description: string) => {
        createTeam.mutate({ name, description });
    };

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <SettingsHeader />

            <Tabs defaultValue="profile" orientation="vertical" className="w-full flex flex-col md:flex-row gap-6">
                <TabsList className="flex flex-col h-auto w-full md:w-64 bg-transparent border-r justify-start items-start p-0">
                    <TabsTrigger value="profile" className="w-full justify-start text-left data-[state=active]:bg-muted/50 data-[state=active]:shadow-none px-4 py-3 rounded-none border-l-2 data-[state=active]:border-primary border-transparent">
                        <Building2 className="mr-2 h-4 w-4" />
                        Organization Profile
                    </TabsTrigger>
                    <TabsTrigger value="users" className="w-full justify-start text-left data-[state=active]:bg-muted/50 data-[state=active]:shadow-none px-4 py-3 rounded-none border-l-2 data-[state=active]:border-primary border-transparent">
                        <Users className="mr-2 h-4 w-4" />
                        User Management
                    </TabsTrigger>
                    <TabsTrigger value="teams" className="w-full justify-start text-left data-[state=active]:bg-muted/50 data-[state=active]:shadow-none px-4 py-3 rounded-none border-l-2 data-[state=active]:border-primary border-transparent">
                        <Network className="mr-2 h-4 w-4" />
                        Teams & Departments
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="w-full justify-start text-left data-[state=active]:bg-muted/50 data-[state=active]:shadow-none px-4 py-3 rounded-none border-l-2 data-[state=active]:border-primary border-transparent mt-4">
                        <FileClock className="mr-2 h-4 w-4" />
                        Audit Logs
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 w-full min-w-0">
                    <TabsContent value="profile" className="m-0 border-none p-0 outline-none">
                        <ProfileSettings
                            profile={orgProfile}
                            onSave={handleSaveProfile}
                            onDelete={handleDeleteOrg}
                            isSaving={updateOrg.isPending}
                            isDeleting={deleteOrg.isPending}
                        />
                    </TabsContent>

                    <TabsContent value="users" className="m-0 border-none p-0 outline-none">
                        <UserManagement
                            users={orgUsers}
                            onRemove={handleRemoveMember}
                            onInvite={handleInvite}
                            isRemoving={removeMember.isPending}
                            isInviting={createInvite.isPending}
                            invitationToken={invitationToken}
                            onTokenDismiss={() => setInvitationToken(null)}
                        />
                    </TabsContent>

                    <TabsContent value="teams" className="m-0 border-none p-0 outline-none">
                        <TeamManagement
                            teams={orgTeams}
                            onCreateTeam={handleCreateTeam}
                            isCreating={createTeam.isPending}
                        />
                    </TabsContent>

                    <TabsContent value="audit" className="m-0 border-none p-0 outline-none">
                        <AuditLogs logs={auditLogs} isLoading={isAuditLoading} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
