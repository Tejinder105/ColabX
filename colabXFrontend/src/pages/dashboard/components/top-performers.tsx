import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Medal, Trophy } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface TopPartnerItem {
    name: string
    revenue: number
}

interface TopTeamItem {
    name: string
    score: string
}

interface TopPerformersProps {
    partners: TopPartnerItem[]
    teams: TopTeamItem[]
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value)
}

export function TopPerformers({ partners, teams }: TopPerformersProps) {
    const navigate = useNavigate()

    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-chart-4" />
                    Top Performers
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="text-sm font-semibold mb-3">Partners by Revenue (Q1)</h4>
                    {partners.length === 0 && (
                        <p className="text-sm text-muted-foreground">No partner revenue data yet.</p>
                    )}
                    <div className="space-y-2">
                        {partners.map((p, idx) => (
                            <div key={p.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-muted-foreground w-4">{idx + 1}.</span>
                                    {idx + 1 === 1 && <Medal className="h-3 w-3 text-chart-4" />}
                                    {idx + 1 === 2 && <Medal className="h-3 w-3 text-muted" />}
                                    {idx + 1 === 3 && <Medal className="h-3 w-3 text-chart-3" />}
                                    <span>{p.name}</span>
                                </div>
                                <span className="font-mono font-medium">{formatCurrency(p.revenue)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-3">Top Performing Teams</h4>
                    {teams.length === 0 && (
                        <p className="text-sm text-muted-foreground">No team performance data yet.</p>
                    )}
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
                <Button variant="ghost" className="w-full text-sm text-muted-foreground" onClick={() => navigate("/reports")}>
                    View Full Leaderboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    )
}
