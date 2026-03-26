import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { ShieldCheck } from 'lucide-react';
import type { PermissionMatrix } from '@/types/settings';

export function PermissionsSettings({ permissions, isLoading }: { permissions: PermissionMatrix[]; isLoading?: boolean }) {
    return (
        <Card>
            <CardHeader className="py-4 pb-2 border-b">
                <CardTitle className="text-xl flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    Role Permissions Matrix
                </CardTitle>
                <CardDescription>Configure granular access control and feature availability across roles.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableHead className="w-1/2 pl-6">Feature Access</TableHead>
                            <TableHead className="text-center">Admin</TableHead>
                            <TableHead className="text-center">Manager</TableHead>
                            <TableHead className="text-center pr-6">Partner</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                                    Loading permissions...
                                </TableCell>
                            </TableRow>
                        )}
                        {permissions.map((p, i) => (
                            <TableRow key={i} className="hover:bg-muted/30">
                                <TableCell className="pl-6 font-medium text-foreground/80">{p.feature}</TableCell>
                                <TableCell className="text-center">
                                    <Switch checked={p.admin} disabled />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Switch checked={p.manager} disabled />
                                </TableCell>
                                <TableCell className="text-center pr-6">
                                    <Switch checked={p.partner} disabled />
                                </TableCell>
                            </TableRow>
                        ))}
                        {!isLoading && permissions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                                    No permissions available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 justify-end bg-muted/20">
                <p className="text-sm text-muted-foreground">Permissions are derived from backend role policies.</p>
            </CardFooter>
        </Card>
    );
}
