import { useCurrentUser } from "@/hooks/useAuth"
import { StatsCards } from "./components/stats-cards"
import { PartnershipOverview } from "./components/partnership-overview"
import { OKRProgress } from "./components/okr-progress"
import { DealPipeline } from "./components/deal-pipeline"
import { QuickActions } from "./components/quick-actions"
import { UpcomingActions } from "./components/upcoming-actions"
import { RecentActivity } from "./components/recent-activity"
import { TopPerformers } from "./components/top-performers"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

function DashboardPage() {
    const { data } = useCurrentUser()

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Welcome back, {data?.user?.name || "Tejinder"}! Here&apos;s your partnership overview.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground hidden sm:inline-block">
                        Last updated: 5 mins ago
                    </span>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <RefreshCcw className="h-4 w-4" />
                        <span className="sr-only">Refresh</span>
                    </Button>
                </div>
            </div>

            <StatsCards />

            {/* Phase 2: Charts & Visuals */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <PartnershipOverview />
                </div>
                <div className="col-span-3">
                    <OKRProgress />
                </div>
            </div>

            {/* Phase 3: Pipeline & Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 lg:col-span-4">
                    <DealPipeline />
                </div>
                <div className="col-span-3 lg:col-span-3">
                    <QuickActions />
                </div>
            </div>

            {/* Phase 4: Activity & Final Assembly */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-2">
                    <UpcomingActions />
                </div>
                <div className="col-span-3">
                    <RecentActivity />
                </div>
                <div className="col-span-2">
                    <TopPerformers />
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
