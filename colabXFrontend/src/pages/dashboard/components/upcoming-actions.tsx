import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ClipboardList, FileSignature, Target, UserCheck } from "lucide-react"

export function UpcomingActions() {
    const today = [
        { time: "10:00 AM", title: "Quarterly Review - Acme Corp Partnership", color: "bg-chart-2" },
        { time: "2:30 PM", title: "Deal Review - CloudNet $150K Opportunity", color: "bg-chart-3" },
    ]

    const thisWeek = [
        { date: "Feb 03", title: "Submit Q4 OKR Report", icon: ClipboardList, color: "text-amber-500 bg-amber-500/10" },
        { date: "Feb 04", title: "Partner Onboarding - FinServ", icon: UserCheck, color: "text-blue-500 bg-blue-500/10" },
        { date: "Feb 05", title: "OKR Check-in - APAC Team", icon: Target, color: "text-pink-500 bg-pink-500/10" },
        { date: "Feb 06", title: "Contract Review - TeleComm", icon: FileSignature, color: "text-purple-500 bg-purple-500/10" },
    ]

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Upcoming Actions & Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today</h4>
                    {today.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
                            <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.color}`} />
                            <div>
                                <p className="text-sm font-medium leading-none mb-1">{item.time}</p>
                                <p className="text-sm text-muted-foreground">{item.title}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">This Week</h4>
                    {thisWeek.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div key={i} className="flex items-center gap-3 text-sm py-1">
                                <div className={`p-1.5 rounded-md ${item.color}`}>
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
                <Button variant="ghost" className="w-full text-sm text-muted-foreground">
                    View Full Calendar <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
