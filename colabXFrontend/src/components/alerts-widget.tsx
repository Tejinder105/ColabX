import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useAlertsSummary, useCheckAlerts, useMarkNotificationAsRead } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useRbac } from "@/hooks/useRbac";

interface AlertsWidgetProps {
    partnerId?: string;
}

export function AlertsWidget({ partnerId }: AlertsWidgetProps) {
    const { data, isLoading } = useAlertsSummary(partnerId);
    const markAsRead = useMarkNotificationAsRead();
    const checkAlerts = useCheckAlerts();
    const { isAdmin } = useRbac();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">Loading alerts...</div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.alerts.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle>Alerts</CardTitle>
                        {isAdmin && (
                            <Button variant="outline" size="sm" onClick={() => checkAlerts.mutate()} disabled={checkAlerts.isPending}>
                                {checkAlerts.isPending ? "Checking..." : "Check Alerts"}
                            </Button>
                        )}
                    </div>
                    <CardDescription>No alerts at this time</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">All clear! Your metrics look good.</div>
                </CardContent>
            </Card>
        );
    }

    const { alerts, summary } = data;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Alerts</CardTitle>
                        <CardDescription>
                            {summary.total} unread alert{summary.total !== 1 ? "s" : ""}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {isAdmin && (
                            <Button variant="outline" size="sm" onClick={() => checkAlerts.mutate()} disabled={checkAlerts.isPending}>
                                {checkAlerts.isPending ? "Checking..." : "Check Alerts"}
                            </Button>
                        )}
                        {summary.critical > 0 && (
                            <Badge variant="destructive" className="flex gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {summary.critical}
                            </Badge>
                        )}
                        {summary.warning > 0 && (
                            <Badge variant="secondary" className="flex gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {summary.warning}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] w-full pr-4">
                    <div className="space-y-3">
                        {alerts.map((alert) => (
                            <div
                                key={alert.notificationId}
                                className={cn(
                                    "flex gap-3 rounded-lg border p-3 transition-colors",
                                    !alert.read ? "bg-accent/50" : "bg-muted/30"
                                )}
                            >
                                {/* Icon */}
                                <div className="mt-0.5 flex-shrink-0">
                                    {alert.severity === "critical" && (
                                        <AlertCircle className="h-5 w-5 text-destructive" />
                                    )}
                                    {alert.severity === "warning" && (
                                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    )}
                                    {alert.severity === "info" && (
                                        <Info className="h-5 w-5 text-blue-600" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <h4 className="font-medium text-sm">{alert.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {alert.message}
                                            </p>
                                        </div>
                                        {!alert.read && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => markAsRead.mutate(alert.notificationId)}
                                                className="ml-2 flex-shrink-0"
                                            >
                                                Mark read
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                            {alert.alertType.replace(/_/g, " ")}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(alert.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
