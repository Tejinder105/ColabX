import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function DealPipeline() {
    const stages = [
        { name: "Discovery", count: 8, value: "$480K", width: "w-full", color: "bg-chart-1" },
        { name: "Qualification", count: 6, value: "$520K", width: "w-[85%]", color: "bg-chart-2" },
        { name: "Proposal", count: 5, value: "$680K", width: "w-[70%]", color: "bg-chart-3" },
        { name: "Negotiation", count: 3, value: "$420K", width: "w-[55%]", color: "bg-chart-4" },
        { name: "Closing", count: 2, value: "$300K", width: "w-[40%]", color: "bg-chart-5" },
    ]

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle>Deal Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
                <div className="space-y-1 relative">
                    {stages.map((stage, index) => (
                        <div key={stage.name} className="flex flex-col items-center">
                            {/* Funnel Bar */}
                            <div className={`${stage.width} relative group transition-all duration-300`}>
                                <div
                                    className={`h-10 mx-auto rounded-md ${stage.color} flex items-center justify-between px-4 text-primary-foreground shadow-sm relative z-10`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{stage.name}</span>
                                        <span className="text-xs opacity-80">({stage.count})</span>
                                    </div>
                                    <span className="font-bold text-sm">{stage.value}</span>
                                </div>

                                {/* Connecting Line Effect (Visual only, behind bars) */}
                                {index < stages.length - 1 && (
                                    <div
                                        className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-[2px] h-4 bg-border -z-0"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-4">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg. Deal Size</p>
                        <p className="font-bold text-lg">$100K</p>
                    </div>
                    <div className="text-center border-l">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Win Rate</p>
                        <p className="font-bold text-lg">42%</p>
                    </div>
                    <div className="text-center border-l">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg. Cycle</p>
                        <p className="font-bold text-lg">45 Days</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="ghost" className="w-full text-sm text-muted-foreground">
                    View All Deals <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
