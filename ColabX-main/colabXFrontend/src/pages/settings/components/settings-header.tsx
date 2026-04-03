export function SettingsHeader() {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
                <p className="text-muted-foreground">
                    Manage your organization profile, users, teams, and security permissions.
                </p>
            </div>
        </div>
    );
}
