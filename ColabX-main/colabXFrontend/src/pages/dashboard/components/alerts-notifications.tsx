import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react"

interface DashboardAlert {
    title: string
    description: string
    action: string
    severity: "critical" | "warning" | "info" | "neutral"
    onAction?: () => void
}

interface AlertsNotificationsProps {
    alerts: DashboardAlert[]
}

export function AlertsNotifications({ alerts }: AlertsNotificationsProps) {

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case "critical":
                return { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" }
            case "warning":
                return { icon: AlertTriangle, color: "text-chart-4", bg: "bg-chart-4/10" }
            case "info":
                return { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" }
            case "neutral":
            default:
                return { icon: Info, color: "text-muted-foreground", bg: "bg-muted" }
        }
    }

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <CardTitle>Alerts & Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {alerts.length === 0 && (
                    <p className="text-sm text-muted-foreground">No active alerts right now.</p>
                )}
                {alerts.map((alert, index) => {
                    const styles = getSeverityStyles(alert.severity)
                    const Icon = styles.icon

                    return (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                            <div className={`mt-0.5 p-1 rounded-full ${styles.bg}`}>
                                <Icon className={`h-4 w-4 ${styles.color}`} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-tight">{alert.title}</p>
                                <p className="text-xs text-muted-foreground leading-snug">
                                    {alert.description}
                                </p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2 shrink-0"
                                onClick={alert.onAction}
                            >
                                {alert.action}
                            </Button>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
