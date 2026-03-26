import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface StageMetric {
    name: string
    count: number
    value: number
    color: string
}

interface DealPipelineProps {
    stages: StageMetric[]
    avgDealSize: number
    winRate: number
    avgDealAgeDays: number
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value)
}

export function DealPipeline({ stages, avgDealSize, winRate, avgDealAgeDays }: DealPipelineProps) {
    const navigate = useNavigate()
    const maxCount = Math.max(1, ...stages.map((stage) => stage.count))

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
                            <div
                                className="relative group transition-all duration-300 w-full"
                                style={{ maxWidth: `${(stage.count / maxCount) * 100}%` }}
                            >
                                <div
                                    className={`h-10 mx-auto rounded-md ${stage.color} flex items-center justify-between px-4 text-primary-foreground shadow-sm relative z-10`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{stage.name}</span>
                                        <span className="text-xs opacity-80">({stage.count})</span>
                                    </div>
                                    <span className="font-bold text-sm">{formatCurrency(stage.value)}</span>
                                </div>

                                {/* Connecting Line Effect (Visual only, behind bars) */}
                                {index < stages.length - 1 && (
                                    <div
                                        className="absolute left-1/2 -translate-x-1/2 bottom-[-4px] w-[2px] h-4 bg-border z-0"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 border-t pt-4">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg. Deal Size</p>
                        <p className="font-bold text-lg">{formatCurrency(avgDealSize)}</p>
                    </div>
                    <div className="text-center border-l">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Win Rate</p>
                        <p className="font-bold text-lg">{winRate}%</p>
                    </div>
                    <div className="text-center border-l">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg. Deal Age</p>
                        <p className="font-bold text-lg">{avgDealAgeDays} Days</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => navigate("/deals")}>
                    View All Deals <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
