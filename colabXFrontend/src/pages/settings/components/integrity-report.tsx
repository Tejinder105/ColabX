import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OrgIntegrityReport } from '@/services/orgService';

interface IntegrityReportProps {
    report?: OrgIntegrityReport;
    isLoading?: boolean;
}

function count(value: unknown[] | undefined) {
    return value?.length ?? 0;
}

export function IntegrityReport({ report, isLoading }: IntegrityReportProps) {
    const internalUsersInMultipleOrgs = count(report?.internalUsersInMultipleOrgs);
    const partnersInTeams = count(report?.partnersInTeams);
    const partnersLeadingTeams = count(report?.partnersLeadingTeams);
    const teamsWithoutLead = count(report?.teamsWithoutLead);
    const multiTeamPartners = report?.partnersAssignedToMultipleTeams?.length ?? 0;
    const allClear = internalUsersInMultipleOrgs === 0 && partnersInTeams === 0 && partnersLeadingTeams === 0 && teamsWithoutLead === 0 && multiTeamPartners === 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Integrity Report</CardTitle>
                <CardDescription>Backend consistency checks for organization relationship data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading integrity report...</p>
                ) : (
                    <>
                        <div className="flex items-center gap-2">
                            <Badge variant={allClear ? 'secondary' : 'destructive'}>
                                {allClear ? 'All clear' : 'Needs attention'}
                            </Badge>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Internal users in multiple orgs</p>
                                <p className="text-2xl font-semibold">{internalUsersInMultipleOrgs}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Partners in team member rows</p>
                                <p className="text-2xl font-semibold">{partnersInTeams}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Partners leading teams</p>
                                <p className="text-2xl font-semibold">{partnersLeadingTeams}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Partners on multiple teams</p>
                                <p className="text-2xl font-semibold">{multiTeamPartners}</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <p className="text-xs text-muted-foreground">Teams without lead</p>
                                <p className="text-2xl font-semibold">{teamsWithoutLead}</p>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
