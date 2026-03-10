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
import { Plus, Users } from 'lucide-react';
import type { OrgTeamData } from '@/types/settings';

export function TeamManagement({ teams }: { teams: OrgTeamData[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 pb-2 border-b">
                <div>
                    <CardTitle className="text-xl">Team Departments</CardTitle>
                    <CardDescription>Configure organizational group mappings and assign leads.</CardDescription>
                </div>
                <div className="mt-4 sm:mt-0">
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Create Team
                    </Button>
                </div>
            </CardHeader>
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
