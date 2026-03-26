import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Briefcase,
    DollarSign,
    Target,
    Users,
    Wallet,
} from "lucide-react"

interface StatsCardsProps {
    partnersCount: number
    pipelineValue: number
    revenueValue: number
    okrProgress: number
    activeDealsCount: number
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value)
}

export function StatsCards({
    partnersCount,
    pipelineValue,
    revenueValue,
    okrProgress,
    activeDealsCount,
}: StatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
                <CardHeader className="flex flex-row items-center space-y-0  gap-2">
                    <Users className="text-muted-foreground h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Partners</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{partnersCount}</div>
                    <p className="text-muted-foreground text-xs">Total partner records</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center space-y-0 gap-2">
                    <Wallet className="text-muted-foreground h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(pipelineValue)}</div>
                    <p className="text-muted-foreground text-xs">Open deals value</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center space-y-0  gap-2">
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(revenueValue)}</div>
                    <p className="text-muted-foreground text-xs">Won deals value</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center space-y-0  gap-2">
                    <Target className="text-muted-foreground h-4 w-4" />
                    <CardTitle className="text-sm font-medium">OKR Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{okrProgress}%</div>
                    <p className="text-muted-foreground text-xs">Average team performance</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center space-y-0 gap-2">
                    <Briefcase className="text-muted-foreground h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeDealsCount}</div>
                    <p className="text-muted-foreground text-xs">Lead, proposal, negotiation</p>
                </CardContent>
            </Card>
        </div>
    )
}
