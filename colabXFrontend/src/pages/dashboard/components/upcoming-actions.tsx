import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ClipboardList, FileSignature, Target, UserCheck } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface UpcomingActionItem {
    date: string
    title: string
    type: "objective" | "invite" | "review" | "milestone"
}

interface UpcomingActionsProps {
    today: UpcomingActionItem[]
    thisWeek: UpcomingActionItem[]
}

export function UpcomingActions({ today, thisWeek }: UpcomingActionsProps) {
    const navigate = useNavigate()

    const getItemMeta = (type: UpcomingActionItem["type"]) => {
        if (type === "objective") return { icon: Target, color: "text-pink-500 bg-pink-500/10" }
        if (type === "invite") return { icon: UserCheck, color: "text-blue-500 bg-blue-500/10" }
        if (type === "review") return { icon: FileSignature, color: "text-purple-500 bg-purple-500/10" }
        return { icon: ClipboardList, color: "text-amber-500 bg-amber-500/10" }
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Upcoming Actions & Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today</h4>
                    {today.length === 0 && (
                        <p className="text-sm text-muted-foreground">No actions due today.</p>
                    )}
                    {today.map((item, i) => (
                        <div key={`${item.title}-${i}`} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-chart-2" />
                            <div>
                                <p className="text-sm font-medium leading-none mb-1">{item.date}</p>
                                <p className="text-sm text-muted-foreground">{item.title}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Week</h4>
                    {thisWeek.length === 0 && (
                        <p className="text-sm text-muted-foreground">No actions this week.</p>
                    )}
                    {thisWeek.map((item, i) => {
                        const meta = getItemMeta(item.type)
                        const Icon = meta.icon
                        return (
                            <div key={`${item.title}-${i}`} className="flex items-center gap-3 text-sm py-1">
                                <div className={`p-1.5 rounded-md ${meta.color}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <span className="font-medium text-muted-foreground w-14 shrink-0">{item.date}</span>
                                <span className="text-foreground">{item.title}</span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => navigate("/okrs")}>
                    View Full Calendar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
