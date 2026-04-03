import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, X, Loader2 } from 'lucide-react';
import type { OrgTeamData } from '@/types/settings';
import { useState } from 'react';

interface TeamManagementProps {
    teams: OrgTeamData[];
    onCreateTeam?: (name: string, description: string) => void;
    isCreating?: boolean;
}

export function TeamManagement({ teams, onCreateTeam, isCreating }: TeamManagementProps) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [teamDescription, setTeamDescription] = useState('');

    const handleCreateTeam = () => {
        const name = teamName.trim();
        if (!name) return;
        onCreateTeam?.(name, teamDescription.trim());
        setTeamName('');
        setTeamDescription('');
        setShowCreateForm(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 pb-2 border-b">
                <div>
                    <CardTitle className="text-xl">Team Departments</CardTitle>
                    <CardDescription>Configure organizational group mappings and assign leads.</CardDescription>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Button variant="outline" onClick={() => setShowCreateForm((v) => !v)}>
                        {showCreateForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />} {showCreateForm ? 'Cancel' : 'Create Team'}
                    </Button>
                </div>
            </CardHeader>

            {showCreateForm && (
                <div className="px-6 py-3 border-b bg-muted/20 grid gap-3">
                    <div className="grid gap-1.5">
                        <Label htmlFor="teamName" className="text-xs text-muted-foreground">Team Name</Label>
                        <Input
                            id="teamName"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Enterprise Sales"
                        />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor="teamDescription" className="text-xs text-muted-foreground">Description (optional)</Label>
                        <Input
                            id="teamDescription"
                            value={teamDescription}
                            onChange={(e) => setTeamDescription(e.target.value)}
                            placeholder="Department or focus area"
                        />
                    </div>
                    <div>
                        <Button onClick={handleCreateTeam} disabled={!teamName.trim() || isCreating}>
                            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Team
                        </Button>
                    </div>
                </div>
            )}

            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="pl-6 w-1/3">Team Name</TableHead>
                            <TableHead className="w-1/4">Assigned Lead</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead className="text-right">Members</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teams.map((team) => (
                            <TableRow key={team.id} className="hover:bg-muted/50 cursor-pointer group">
                                <TableCell className="pl-6 font-medium">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-md group-hover:bg-primary/20 transition-colors">
                                            <Users className="h-4 w-4 text-primary" />
                                        </div>
                                        {team.name}
                                    </div>
                                </TableCell>
                                <TableCell>{team.leadName}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-normal text-muted-foreground">{team.department}</Badge>
                                </TableCell>
                                <TableCell className="text-right pr-6 font-medium">
                                    {team.memberCount}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
