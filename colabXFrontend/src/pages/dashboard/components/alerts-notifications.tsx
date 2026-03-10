import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react"

export function AlertsNotifications() {
    const alerts = [
        {
            title: "TechCorp partnership at risk",
            description: "Engagement dropped 40% this month",
            action: "Take Action",
            severity: "critical",
        },
        {
            title: "Contract renewal in 15 days",
            description: "GlobalFinance Inc. - Premium Tier",
            action: "Review",
            severity: "warning",
        },
        {
            title: "New milestone achieved!",
            description: "DataSync reached Gold tier",
            action: "Send Congrats",
            severity: "info",
        },
        {
            title: "System Maintenance",
            description: "Scheduled for Feb 10, 2:00 AM",
            action: "Details",
            severity: "neutral",
        }
    ]

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
