import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsHeader } from './components/settings-header';
import { ProfileSettings } from './components/profile-settings';
import { UserManagement } from './components/user-management';
import { TeamManagement } from './components/team-management';
import { PermissionsSettings } from './components/permissions-settings';
import { AuditLogs } from './components/audit-logs';
import { mockOrgProfile, mockUsers, mockTeamsSettings, mockPermissions, mockAuditLogs } from '@/lib/mock-settings';
import { Building2, Users, ShieldCheck, FileClock, Network } from 'lucide-react';

export default function SettingsPage() {
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
                    <TabsTrigger value="permissions" className="w-full justify-start text-left data-[state=active]:bg-muted/50 data-[state=active]:shadow-none px-4 py-3 rounded-none border-l-2 data-[state=active]:border-primary border-transparent">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Role Permissions
                    </TabsTrigger>
                    <TabsTrigger value="audit" className="w-full justify-start text-left data-[state=active]:bg-muted/50 data-[state=active]:shadow-none px-4 py-3 rounded-none border-l-2 data-[state=active]:border-primary border-transparent mt-4">
                        <FileClock className="mr-2 h-4 w-4" />
                        Audit Logs
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 w-full min-w-0">
                    <TabsContent value="profile" className="m-0 border-none p-0 outline-none">
                        <ProfileSettings profile={mockOrgProfile} />
                    </TabsContent>

                    <TabsContent value="users" className="m-0 border-none p-0 outline-none">
                        <UserManagement users={mockUsers} />
                    </TabsContent>

                    <TabsContent value="teams" className="m-0 border-none p-0 outline-none">
                        <TeamManagement teams={mockTeamsSettings} />
                    </TabsContent>

                    <TabsContent value="permissions" className="m-0 border-none p-0 outline-none">
                        <PermissionsSettings permissions={mockPermissions} />
                    </TabsContent>

                    <TabsContent value="audit" className="m-0 border-none p-0 outline-none">
                        <AuditLogs logs={mockAuditLogs} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
