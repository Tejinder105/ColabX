import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ArrowRight,
    CheckCircle2,
    FileText,
    MessageSquare,
    TrendingUp,
    UserPlus,
    type LucideIcon,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

interface RecentActivityItem {
    user: string
    action: string
    details: string
    time: string
    icon: "member" | "document" | "objective" | "message" | "deal" | "info"
}

interface RecentActivityProps {
    activities: RecentActivityItem[]
}

function iconMeta(icon: RecentActivityItem["icon"]): { Icon: LucideIcon; color: string; bg: string } {
    if (icon === "member") return { Icon: UserPlus, color: "text-chart-2", bg: "bg-chart-2/10" }
    if (icon === "document") return { Icon: FileText, color: "text-chart-4", bg: "bg-chart-4/10" }
    if (icon === "objective") return { Icon: CheckCircle2, color: "text-primary", bg: "bg-primary/10" }
    if (icon === "message") return { Icon: MessageSquare, color: "text-chart-3", bg: "bg-chart-3/10" }
    if (icon === "deal") return { Icon: TrendingUp, color: "text-chart-5", bg: "bg-chart-5/10" }
    return { Icon: CheckCircle2, color: "text-muted-foreground", bg: "bg-muted" }
}

export function RecentActivity({ activities }: RecentActivityProps) {
    const navigate = useNavigate()

    return (
        <Card className="col-span-1 lg:col-span-3"> {/* Span 3 cols */}
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {activities.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent activity available yet.</p>
                )}
                {activities.map((item, i) => (
                    <div key={`${item.user}-${item.time}-${i}`} className="flex gap-4">
                        {(() => {
                            const meta = iconMeta(item.icon)
                            const Icon = meta.Icon
                            return (
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                            )
                        })()}
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                                <span className="font-bold">{item.user}</span> {item.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {item.time}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => navigate("/settings?tab=audit") }>
                    View All Activity <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
