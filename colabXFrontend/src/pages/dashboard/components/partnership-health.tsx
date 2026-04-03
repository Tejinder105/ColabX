import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
    { status: "active", partners: 32, fill: "var(--color-active)" },
    { status: "atRisk", partners: 8, fill: "var(--color-atRisk)" },
    { status: "onboarding", partners: 7, fill: "var(--color-onboarding)" },
]

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

export function PartnershipHealth() {
    const totalPartners = React.useMemo(() => {
        return chartData.reduce((acc, curr) => acc + curr.partners, 0)
    }, [])

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Partnership Health</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
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
                                                    className="fill-muted-foreground"
                                                >
                                                    Partners
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <div className="flex w-full justify-center gap-8 pb-6 text-sm">
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold">8</span>
                    <span className="text-muted-foreground text-xs">At Risk</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold">7</span>
                    <span className="text-muted-foreground text-xs">Onboarding</span>
                </div>
            </div>
        </Card>
    )
}
