import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ArrowDownRight,
    ArrowUpRight,
    Briefcase,
    DollarSign,
    Target,
    Users,
    Wallet,
} from "lucide-react"

export function StatsCards() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card>
                <CardHeader className="flex flex-row items-center space-y-0  gap-2">
                    <Users className="text-muted-foreground h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Partners</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">47</div>
                    <p className="text-muted-foreground text-xs">
                        <span className="text-primary flex items-center">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            12%
                        </span>{" "}
                        vs last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center space-y-0 gap-2">
                    <Wallet className="text-muted-foreground h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$2.4M</div>
                    <p className="text-muted-foreground text-xs">
                        <span className="text-primary flex items-center">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            8%
                        </span>{" "}
                        vs last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center space-y-0  gap-2">
                    <DollarSign className="text-muted-foreground h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">$890K</div>
                    <p className="text-muted-foreground text-xs">
                        <span className="text-primary flex items-center">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            15%
                        </span>{" "}
                        vs last quarter
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center space-y-0  gap-2">
                    <Target className="text-muted-foreground h-4 w-4" />
                    <CardTitle className="text-sm font-medium">OKR Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">73%</div>
                    <p className="text-muted-foreground text-xs">
                        <span className="text-primary flex items-center">
                            <ArrowUpRight className="mr-1 h-3 w-3" />
                            5%
                        </span>{" "}
                        vs last month
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center space-y-0 gap-2">
                    <Briefcase className="text-muted-foreground h-4 w-4" />
                    <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-muted-foreground text-xs">
                        <span className="text-destructive flex items-center">
                            <ArrowDownRight className="mr-1 h-3 w-3" />
                            3
                        </span>{" "}
                        vs last week
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
