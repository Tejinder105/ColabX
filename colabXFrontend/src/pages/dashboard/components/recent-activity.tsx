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
} from "lucide-react"

export function RecentActivity() {
    const activities = [
        {
            user: "Sarah",
            action: "added new deal with TechVentures",
            details: "$250K opportunity",
            time: "2 mins ago",
            icon: UserPlus,
            color: "text-chart-2",
            bg: "bg-chart-2/10",
        },
        {
            user: "DataSync Inc.",
            action: "Partnership Agreement uploaded",
            details: "Agreement.pdf",
            time: "15 mins ago",
            icon: FileText,
            color: "text-chart-4",
            bg: "bg-chart-4/10",
        },
        {
            user: "System",
            action: "OKR Key Result completed",
            details: '"Onboard 5 new APAC partners"',
            time: "1 hr ago",
            icon: CheckCircle2,
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            user: "Mike",
            action: "New message in #acme-partnership",
            details: '"Contract terms approved"',
            time: "2 hrs ago",
            icon: MessageSquare,
            color: "text-chart-3",
            bg: "bg-chart-3/10",
        },
        {
            user: "System",
            action: "Deal stage updated",
            details: "CloudNet → Negotiation",
            time: "4 hrs ago",
            icon: TrendingUp,
            color: "text-chart-5",
            bg: "bg-chart-5/10",
        },
    ]

    return (
        <Card className="col-span-1 lg:col-span-3"> {/* Span 3 cols */}
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {activities.map((item, i) => (
                    <div key={i} className="flex gap-4">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.bg} ${item.color}`}>
                            <item.icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                                <span className="font-bold">{item.user}</span> {item.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {item.details} • {item.time}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <Button variant="ghost" className="w-full text-sm text-muted-foreground">
                    View All Activity <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
