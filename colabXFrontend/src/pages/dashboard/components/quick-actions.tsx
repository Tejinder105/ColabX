import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Calendar,
    FileText,
    MessageSquare,
    PieChart,
    Plus,
    StickyNote,
} from "lucide-react"
import { AlertsNotifications } from "@/pages/dashboard/components/alerts-notifications"

export function QuickActions() {
    const actions = [
        { label: "Add Partner", icon: Plus },
        { label: "Create Deal", icon: StickyNote },
        { label: "Schedule Meeting", icon: Calendar },
        { label: "Upload Document", icon: FileText },
        { label: "Create Report", icon: PieChart },
        { label: "Start Chat", icon: MessageSquare },
    ]

    return (
        <div className="flex flex-col gap-4 h-full">
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2">
                    {actions.map((action) => (
                        <Button
                            key={action.label}
                            variant="outline"
                            className="flex h-20 flex-col items-center justify-center gap-2 text-xs"
                        >
                            <action.icon className="h-5 w-5" />
                            <span className="text-center leading-none">{action.label}</span>
                        </Button>
                    ))}
                </CardContent>
            </Card>

            <div className="flex-1">
                <AlertsNotifications />
            </div>
        </div>
    )
}
