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
import { useNavigate } from "react-router-dom"

interface QuickActionAlert {
    title: string
    description: string
    action: string
    severity: "critical" | "warning" | "info" | "neutral"
    onAction?: () => void
}

interface QuickActionsProps {
    alerts: QuickActionAlert[]
}

export function QuickActions({ alerts }: QuickActionsProps) {
    const navigate = useNavigate()

    const actions = [
        { label: "Add Partner", icon: Plus, onClick: () => navigate("/partners") },
        { label: "Create Deal", icon: StickyNote, onClick: () => navigate("/deals") },
        { label: "Plan OKR Check-in", icon: Calendar, onClick: () => navigate("/okrs") },
        { label: "Upload Document", icon: FileText, onClick: () => navigate("/documents") },
        { label: "Create Report", icon: PieChart, onClick: () => navigate("/reports") },
        { label: "Start Chat", icon: MessageSquare, onClick: () => navigate("/support") },
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
                            onClick={action.onClick}
                        >
                            <action.icon className="h-5 w-5" />
                            <span className="text-center leading-none">{action.label}</span>
                        </Button>
                    ))}
                </CardContent>
            </Card>

            <div className="flex-1">
                <AlertsNotifications alerts={alerts} />
            </div>
        </div>
    )
}
