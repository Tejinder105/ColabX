import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { PermissionMatrix } from '@/types/settings';

interface PermissionsSettingsProps {
    permissions: PermissionMatrix[];
    isLoading?: boolean;
}

export function PermissionsSettings({ permissions, isLoading }: PermissionsSettingsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>Review which roles can access each backend feature.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p className="text-sm text-muted-foreground">Loading permissions...</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Feature</TableHead>
                                <TableHead>Admin</TableHead>
                                <TableHead>Manager</TableHead>
                                <TableHead>Partner</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.map((permission) => (
                                <TableRow key={permission.feature}>
                                    <TableCell className="font-medium">{permission.feature}</TableCell>
                                    <TableCell>{permission.admin ? <Badge>Allowed</Badge> : <Badge variant="outline">Blocked</Badge>}</TableCell>
                                    <TableCell>{permission.manager ? <Badge>Allowed</Badge> : <Badge variant="outline">Blocked</Badge>}</TableCell>
                                    <TableCell>{permission.partner ? <Badge>Allowed</Badge> : <Badge variant="outline">Blocked</Badge>}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
