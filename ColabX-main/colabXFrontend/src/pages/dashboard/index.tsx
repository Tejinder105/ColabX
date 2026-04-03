import { useCurrentUser } from "@/hooks/useAuth"
import { useDealsDashboard } from "@/hooks/useDeals"
import { useOkrsDashboard } from "@/hooks/useOkrs"
import { usePartners } from "@/hooks/usePartners"
import { useReportsDashboard } from "@/hooks/useReports"
import { useOrgAuditLogs, usePendingInvitations } from "@/hooks/useOrg"
import { useTeams } from "@/hooks/useTeams"
import { useAuthStore } from "@/stores/authStore"
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
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"

function relativeTime(input: string): string {
    const then = new Date(input).getTime()
    const now = Date.now()
    const diffMs = Math.max(0, now - then)
    const min = Math.floor(diffMs / 60000)
    if (min < 1) return "just now"
    if (min < 60) return `${min} min${min > 1 ? "s" : ""} ago`
    const hr = Math.floor(min / 60)
    if (hr < 24) return `${hr} hr${hr > 1 ? "s" : ""} ago`
    const day = Math.floor(hr / 24)
    return `${day} day${day > 1 ? "s" : ""} ago`
}

function sameDate(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function DashboardPage() {
    const navigate = useNavigate()
    const activeOrgId = useAuthStore((state) => state.activeOrgId)
    const { data } = useCurrentUser()
    const { data: partnersData, refetch: refetchPartners, dataUpdatedAt: partnersUpdatedAt } = usePartners()
    const { data: dealsData, refetch: refetchDeals, dataUpdatedAt: dealsUpdatedAt } = useDealsDashboard()
    const { data: reportsData, refetch: refetchReports, dataUpdatedAt: reportsUpdatedAt } = useReportsDashboard()
    const { data: okrsData, refetch: refetchOkrs, dataUpdatedAt: okrsUpdatedAt } = useOkrsDashboard()
    const { data: teamsData, refetch: refetchTeams } = useTeams()
    const { data: auditData, refetch: refetchAudit, dataUpdatedAt: auditUpdatedAt } = useOrgAuditLogs(activeOrgId)
    const { data: invitesData, refetch: refetchInvites } = usePendingInvitations(activeOrgId)

    const rawDeals = dealsData?.rawDeals ?? []
    const partners = partnersData?.partners ?? []
    const objectives = okrsData?.objectives ?? []
    const invites = invitesData?.invitations ?? []

    const pipelineValue = rawDeals
        .filter((deal) => deal.stage !== "won" && deal.stage !== "lost")
        .reduce((sum, deal) => sum + (deal.value ?? 0), 0)

    const revenueValue = rawDeals
        .filter((deal) => deal.stage === "won")
        .reduce((sum, deal) => sum + (deal.value ?? 0), 0)

    const activeDeals = rawDeals.filter((deal) => deal.stage !== "won" && deal.stage !== "lost")
    const closedDeals = rawDeals.filter((deal) => deal.stage === "won" || deal.stage === "lost")

    const avgDealSize = rawDeals.length > 0
        ? rawDeals.reduce((sum, deal) => sum + (deal.value ?? 0), 0) / rawDeals.length
        : 0

    const wonCount = rawDeals.filter((deal) => deal.stage === "won").length
    const winRate = closedDeals.length > 0 ? Math.round((wonCount / closedDeals.length) * 100) : 0

    const avgDealAgeDays = activeDeals.length > 0
        ? Math.round(
            activeDeals.reduce((sum, deal) => {
                const created = new Date(deal.createdAt).getTime()
                return sum + (Date.now() - created) / (1000 * 60 * 60 * 24)
            }, 0) / activeDeals.length,
        )
        : 0

    const dealStages = [
        { key: "lead", name: "Lead", color: "bg-chart-1" },
        { key: "proposal", name: "Proposal", color: "bg-chart-2" },
        { key: "negotiation", name: "Negotiation", color: "bg-chart-3" },
        { key: "won", name: "Won", color: "bg-chart-4" },
        { key: "lost", name: "Lost", color: "bg-chart-5" },
    ] as const

    const stageMetrics = dealStages.map((stage) => {
        const stageDeals = rawDeals.filter((deal) => deal.stage === stage.key)
        return {
            name: stage.name,
            count: stageDeals.length,
            value: stageDeals.reduce((sum, deal) => sum + (deal.value ?? 0), 0),
            color: stage.color,
        }
    })

    const atRiskPartners = partners.filter((partner) => partner.status !== "active").length
    const onboardingPartners = invites.length

    const typeName = (type: string) => {
        if (type === "technology") return "Technology"
        if (type === "reseller") return "Reseller"
        if (type === "agent") return "Agency"
        return "Strategic"
    }

    const tierColors = ["bg-chart-2", "bg-chart-4", "bg-muted-foreground/30", "bg-chart-3"]
    const tierMap = new Map<string, number>()
    partners.forEach((partner) => {
        const key = typeName(partner.type)
        tierMap.set(key, (tierMap.get(key) ?? 0) + 1)
    })

    const partnerTiers = [...tierMap.entries()].map(([name, count], idx) => ({
        name,
        count,
        max: Math.max(1, partners.length),
        color: tierColors[idx % tierColors.length],
    }))

    const objectiveProgress = [...objectives]
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
        .slice(0, 3)
        .map((objective) => ({
            title: objective.title,
            progress: objective.progress,
            completed: objective.keyResults.filter((kr) => kr.progress >= 100).length,
            total: objective.keyResults.length,
            dueDate: new Date(objective.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: objective.status,
        }))

    const today = new Date()
    const weekLimit = new Date(today)
    weekLimit.setDate(today.getDate() + 7)

    const upcomingObjectiveItems = objectives
        .map((objective) => ({
            date: new Date(objective.deadline),
            title: objective.title,
            type: "objective" as const,
        }))
        .filter((item) => item.date >= today && item.date <= weekLimit)

    const upcomingInviteItems = invites
        .map((invite) => ({
            date: new Date(invite.expiresAt),
            title: `Invitation expires: ${invite.email}`,
            type: "invite" as const,
        }))
        .filter((item) => item.date >= today && item.date <= weekLimit)

    const upcomingItems = [...upcomingObjectiveItems, ...upcomingInviteItems]
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 6)
        .map((item) => ({
            date: item.date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            title: item.title,
            type: item.type,
        }))

    const upcomingToday = upcomingItems.filter((item) => {
        const date = new Date(`${item.date}, ${today.getFullYear()}`)
        return sameDate(date, today)
    })
    const upcomingWeek = upcomingItems.filter((item) => !upcomingToday.includes(item))

    const alerts = useMemo(() => {
        const computed: Array<{
            title: string
            description: string
            action: string
            severity: "critical" | "warning" | "info" | "neutral"
            onAction: () => void
        }> = []

        if (atRiskPartners > 0) {
            computed.push({
                title: `${atRiskPartners} partner${atRiskPartners > 1 ? "s" : ""} need attention`,
                description: "Some partners are inactive or suspended.",
                action: "Review",
                severity: "critical",
                onAction: () => navigate("/partners"),
            })
        }

        const expiringSoon = invites.filter((invite) => {
            const exp = new Date(invite.expiresAt).getTime()
            const now = Date.now()
            const in3Days = now + 3 * 24 * 60 * 60 * 1000
            return exp >= now && exp <= in3Days
        }).length

        if (expiringSoon > 0) {
            computed.push({
                title: `${expiringSoon} invitation${expiringSoon > 1 ? "s" : ""} expiring soon`,
                description: "Pending invites will expire in less than 3 days.",
                action: "Open Settings",
                severity: "warning",
                onAction: () => navigate("/settings"),
            })
        }

        const riskyObjectives = objectives.filter((objective) => objective.status === "At Risk" || objective.status === "Behind").length
        if (riskyObjectives > 0) {
            computed.push({
                title: `${riskyObjectives} objective${riskyObjectives > 1 ? "s" : ""} at risk`,
                description: "Review progress and adjust key results.",
                action: "Open OKRs",
                severity: "info",
                onAction: () => navigate("/okrs"),
            })
        }

        computed.push({
            title: "Live dashboard synced",
            description: "Cards and activity feed now use backend data.",
            action: "Open Reports",
            severity: "neutral",
            onAction: () => navigate("/reports"),
        })

        return computed.slice(0, 4)
    }, [atRiskPartners, invites, navigate, objectives])

    const recentActivities = (auditData?.logs ?? []).slice(0, 5).map((log) => {
        const icon: "member" | "document" | "objective" | "message" | "deal" | "info" =
            log.entityType.includes("member") || log.entityType.includes("invitation")
                ? "member"
                : log.entityType.includes("document")
                    ? "document"
                    : log.entityType.includes("objective")
                        ? "objective"
                        : log.entityType.includes("deal")
                            ? "deal"
                            : "info"

        return {
            user: log.userName ?? log.userEmail ?? "System",
            action: log.action,
            details: `${log.entityType}:${log.entityId}`,
            time: relativeTime(log.createdAt),
            icon,
        }
    })

    const topPartners = (reportsData?.topPartners ?? []).map((partner) => ({
        name: partner.partnerName,
        revenue: partner.revenue,
    }))

    const topTeams = (teamsData?.teams ?? [])
        .slice()
        .sort((a, b) => b.memberCount - a.memberCount)
        .slice(0, 3)
        .map((team) => ({
            name: team.name,
            score: `${team.memberCount} members`,
        }))

    const latestUpdatedAt = Math.max(partnersUpdatedAt, dealsUpdatedAt, reportsUpdatedAt, okrsUpdatedAt, auditUpdatedAt)

    const handleRefresh = async () => {
        await Promise.all([
            refetchPartners(),
            refetchDeals(),
            refetchReports(),
            refetchOkrs(),
            refetchTeams(),
            refetchAudit(),
            refetchInvites(),
        ])
    }

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
                        Last updated: {latestUpdatedAt > 0 ? relativeTime(new Date(latestUpdatedAt).toISOString()) : "never"}
                    </span>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleRefresh}>
                        <RefreshCcw className="h-4 w-4" />
                        <span className="sr-only">Refresh</span>
                    </Button>
                </div>
            </div>

            <StatsCards
                partnersCount={partners.length}
                pipelineValue={pipelineValue}
                revenueValue={revenueValue}
                okrProgress={reportsData?.okrSummary.averageTeamPerformance ?? 0}
                activeDealsCount={activeDeals.length}
            />

            {/* Phase 2: Charts & Visuals */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <PartnershipOverview
                        activePartners={partners.filter((partner) => partner.status === "active").length}
                        atRiskPartners={atRiskPartners}
                        onboardingPartners={onboardingPartners}
                        tiers={partnerTiers}
                    />
                </div>
                <div className="col-span-3">
                    <OKRProgress objectives={objectiveProgress} />
                </div>
            </div>

            {/* Phase 3: Pipeline & Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 lg:col-span-4">
                    <DealPipeline
                        stages={stageMetrics}
                        avgDealSize={avgDealSize}
                        winRate={winRate}
                        avgDealAgeDays={avgDealAgeDays}
                    />
                </div>
                <div className="col-span-3 lg:col-span-3">
                    <QuickActions alerts={alerts} />
                </div>
            </div>

            {/* Phase 4: Activity & Final Assembly */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-2">
                    <UpcomingActions today={upcomingToday} thisWeek={upcomingWeek} />
                </div>
                <div className="col-span-3">
                    <RecentActivity activities={recentActivities} />
                </div>
                <div className="col-span-2">
                    <TopPerformers partners={topPartners} teams={topTeams} />
                </div>
            </div>
        </div>
    )
}

export default DashboardPage
