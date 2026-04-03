import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function PartnerTierDistribution() {
    const tiers = [
        { name: "Platinum", count: 8, max: 20, color: "bg-chart-2" }, 
        { name: "Gold", count: 15, max: 20, color: "bg-chart-4" }, 
        { name: "Silver", count: 14, max: 20, color: "bg-muted" }, 
        { name: "Bronze", count: 10, max: 20, color: "bg-chart-3" },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle>Partner Tier Distribution</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                {tiers.map((tier) => (
                    <div
                        key={tier.name}
                        className="space-y-1 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                        onClick={() => console.log(`Filter by ${tier.name}`)}
                    >
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{tier.name}</span>
                            <span className="text-muted-foreground">{tier.count}</span>
                        </div>
                        <Progress value={(tier.count / tier.max) * 100} className="h-2" />
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <Button variant="ghost" className="w-full text-sm text-muted-foreground">
                    View All Partners <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
