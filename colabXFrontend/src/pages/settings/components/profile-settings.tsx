import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Upload, Loader2 } from 'lucide-react';
import type { OrgProfile } from '@/types/settings';

interface ProfileSettingsProps {
    profile: OrgProfile;
    onSave?: (name: string) => void;
    onDelete?: () => void;
    isSaving?: boolean;
    isDeleting?: boolean;
}

export function ProfileSettings({ profile, onSave, onDelete, isSaving, isDeleting }: ProfileSettingsProps) {
    const [orgName, setOrgName] = useState(profile.name);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Organization Profile</CardTitle>
                    <CardDescription>
                        Update your company details and branding. These details are visible to partners.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-8 sm:space-y-0 items-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <div className="h-24 w-24 rounded-full border-2 border-dashed flex items-center justify-center bg-muted hover:bg-muted/80 cursor-pointer transition-colors">
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <Button variant="outline" size="sm" className="w-full" disabled>
                                <Upload className="mr-2 h-4 w-4" />
                                Logo Upload (Not Configured)
                            </Button>
                        </div>

                        <div className="flex-1 w-full grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="orgName">Organization Name</Label>
                                <Input
                                    id="orgName"
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="domain">Primary Domain</Label>
                                <Input id="domain" defaultValue={profile.domain} disabled />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input id="industry" defaultValue={profile.industry} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="employees">Employee Count Size</Label>
                            <Input id="employees" defaultValue={profile.employeeCount} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="year">Established Year</Label>
                            <Input id="year" type="number" defaultValue={profile.establishedYear.toString()} disabled />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Backend currently supports updating organization name only. Additional profile fields are read-only.
                    </p>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button
                        onClick={() => onSave?.(orgName)}
                        disabled={isSaving || !orgName.trim()}
                    >
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            </Card>

            <Card className="border-destructive/20">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Permanently delete your organization and all data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Once you delete your organization, there is no going back. Please be certain.
                    </p>
                    <Button
                        variant="destructive"
                        onClick={() => onDelete?.()}
                        disabled={isDeleting}
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Delete Organization
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
