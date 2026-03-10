import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Medal, Trophy } from "lucide-react"

export function TopPerformers() {
    const partners = [
        { name: "Acme Corp", revenue: "$245K", rank: 1 },
        { name: "GlobalTech", revenue: "$198K", rank: 2 },
        { name: "CloudNet", revenue: "$156K", rank: 3 },
        { name: "FinanceHub", revenue: "$134K", rank: 4 },
        { name: "TeleServe", revenue: "$122K", rank: 5 },
    ]

    const teams = [
        { name: "APAC Team", score: "92% 🔥" },
        { name: "Enterprise Team", score: "87%" },
        { name: "SMB Team", score: "81%" },
    ]

    return (
        <Card className="col-span-1 lg:col-span-2"> {/* Span 2 cols */}
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-chart-4" />
                    Top Performers
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="text-sm font-semibold mb-3">Partners by Revenue (Q1)</h4>
                    <div className="space-y-2">
                        {partners.map((p) => (
                            <div key={p.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-muted-foreground w-4">{p.rank}.</span>
                                    {p.rank === 1 && <Medal className="h-3 w-3 text-chart-4" />}
                                    {p.rank === 2 && <Medal className="h-3 w-3 text-muted" />}
                                    {p.rank === 3 && <Medal className="h-3 w-3 text-chart-3" />}
                                    <span>{p.name}</span>
                                </div>
                                <span className="font-mono font-medium">{p.revenue}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">Top Performing Teams</h4>
                    <div className="space-y-2">
                        {teams.map((t, i) => (
                            <div key={t.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-muted-foreground w-4">{i + 1}.</span>
                                    <span>{t.name}</span>
                                </div>
                                <span className="font-medium">{t.score}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button variant="ghost" className="w-full text-sm text-muted-foreground">
                    View Full Leaderboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
