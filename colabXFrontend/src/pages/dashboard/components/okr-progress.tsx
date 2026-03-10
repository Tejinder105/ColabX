import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function OKRProgress() {
    const objectives = [
        {
            title: "Expand APAC Partner Network",
            progress: 65,
            completed: 3,
            total: 5,
            dueDate: "Mar 31, 2026",
        },
        {
            title: "Increase Co-Sell Revenue 25%",
            progress: 82,
            completed: 4,
            total: 5,
            dueDate: "Apr 15, 2026",
        },
        {
            title: "Launch Partner Certification Prog.",
            progress: 48,
            completed: 2,
            total: 5,
            dueDate: "May 01, 2026",
        },
    ]

    const getStatus = (progress: number) => {
        if (progress >= 100) return { label: "Completed", color: "bg-primary text-primary-foreground", icon: "✅" }
        if (progress >= 70) return { label: "On Track", color: "bg-primary/10 text-primary border-primary/20", icon: "🟢" }
        if (progress >= 50) return { label: "Needs Attention", color: "bg-chart-4/10 text-chart-4 border-chart-4/20", icon: "🟡" }
        return { label: "At Risk", color: "bg-destructive/10 text-destructive border-destructive/20", icon: "🔴" }
    }

    const getProgressColor = (progress: number) => {
        if (progress >= 100) return "bg-primary"
        if (progress >= 70) return "bg-primary"
        if (progress >= 50) return "bg-chart-4"
        return "bg-destructive"
    }

    // Since Progress component usually takes a class for the indicator, we might need a custom wrapper or override.
    // Standard Shadcn Progress uses `bg-primary` for the indicator. We can override via `[&>div]:bg-color`.

    return (
        <Card className="col-span-1 lg:col-span-3 h-full">
            <CardHeader>
                <CardTitle>OKR Progress Tracker - Q1 2026</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {objectives.map((obj) => {
                    const status = getStatus(obj.progress)
                    const progressColor = getProgressColor(obj.progress)

                    return (
                        <div key={obj.title} className="flex flex-col gap-3 p-4 rounded-lg border bg-card/50">
                            {/* Header: Title + Status */}
                            <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-sm leading-tight">{obj.title}</h4>
                                <Badge variant="outline" className={`shrink-0 ${status.color} border-0`}>
                                    {status.icon} <span className="ml-1">{status.label}</span>
                                </Badge>
                            </div>

                            {/* Progress Bar Row */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-muted-foreground">Progress</span>
                                    <span>{obj.progress}%</span>
                                </div>
                                {/* Override internal indicator color */}
                                <Progress
                                    value={obj.progress}
                                    className={`h-2 [&>div]:${progressColor}`}
                                />
                            </div>

                            {/* Footer: Key Results + Due Date */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                <span className="flex items-center">
                                    <CheckCircle2 className="mr-1 h-3 w-3" />
                                    {obj.completed} of {obj.total} Key Results
                                </span>
                                <span className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {obj.dueDate}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
                <Button variant="ghost" className="w-full text-sm text-muted-foreground">
                    View All OKRs <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
