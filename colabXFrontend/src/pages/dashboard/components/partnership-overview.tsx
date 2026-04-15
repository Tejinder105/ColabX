import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { ArrowUpRight } from "lucide-react"

interface PartnershipOverviewProps {
    activePartners: number
    atRiskPartners: number
    onboardingPartners: number
    tiers: Array<{ name: string; count: number; max: number; color: string }>
}

const chartConfig = {
    partners: {
        label: "Partners",
    },
    active: {
        label: "Active",
        color: "var(--chart-1)", 
    },
    atRisk: {
        label: "At Risk",
        color: "var(--chart-4)", 
    },
    onboarding: {
        label: "Onboarding",
        color: "var(--chart-2)", 
    },
} satisfies ChartConfig

export function PartnershipOverview({ activePartners, atRiskPartners, onboardingPartners, tiers }: PartnershipOverviewProps) {
    const chartData = React.useMemo(() => [
        { status: "active", partners: activePartners, fill: "var(--color-active)" },
        { status: "atRisk", partners: atRiskPartners, fill: "var(--color-atRisk)" },
        { status: "onboarding", partners: onboardingPartners, fill: "var(--color-onboarding)" },
    ], [activePartners, atRiskPartners, onboardingPartners])

    const totalPartners = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.partners, 0)
    }, [chartData])

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="items-start pb-0">
                <CardTitle>Executive Summary</CardTitle>
                <CardDescription>Partnership Health & Distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 grid gap-6 lg:grid-cols-2 pt-6">

                {/* Left: Donut Chart */}
                <div className="flex flex-col items-center justify-center relative">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[220px] w-full"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="partners"
                                nameKey="status"
                                innerRadius={60}
                                strokeWidth={5}
                                activeIndex={0}
                                activeShape={({
                                    outerRadius = 0,
                                    ...props
                                }: PieSectorDataItem) => (
                                    <Sector {...props} outerRadius={outerRadius + 10} />
                                )}
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {totalPartners.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-xs"
                                                    >
                                                        Total Partners
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>

                    <div className="flex w-full justify-center gap-6 mt-2 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-chart-4" />
                            <span className="font-bold text-chart-4">{atRiskPartners} At Risk</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-chart-2" />
                            <span className="font-medium text-chart-2">{onboardingPartners} Onboarding</span>
                        </div>
                    </div>
                </div>

                {/* Right: Tier Distribution */}
                <div className="flex flex-col justify-center space-y-5">
                    {tiers.map((tier) => (
                        <div key={tier.name} className="space-y-1.5 group cursor-pointer">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium group-hover:text-primary transition-colors">{tier.name}</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="font-bold">{tier.count}</span>
                                    <span className="text-muted-foreground text-xs">/ {tier.max}</span>
                                </div>
                            </div>
                            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className={`h-full flex-1 transition-all ${tier.color}`}
                                    style={{ width: `${tier.max > 0 ? (tier.count / tier.max) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    <div className="pt-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            <span>Live partner distribution by health and tier.</span>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
