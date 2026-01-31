import * as React from "react"
import { CreateOrganizationCard } from "@/components/onboarding/CreateOrganizationCard"
import { JoinOrganizationCard } from "@/components/onboarding/JoinOrganizationCard"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

type ActiveView = "create" | "join"

function CollabXLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5 text-primary-foreground"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <span className="text-xl font-bold text-foreground">CollabX</span>
    </div>
  )
}

function CreateBrandingPanel() {
  return (
    <div className="flex h-full flex-col justify-between p-8 lg:p-12">
      <CollabXLogo />

      <div className="space-y-6">
        <h1 className="text-4xl font-bold leading-tight text-foreground lg:text-5xl">
          Build your dream team's
          <br />
          digital workspace.
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          Join thousands of organizations that use CollabX to streamline their workflow, boost productivity, and foster innovation.
        </p>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="h-10 w-10 rounded-full border-2 border-border bg-gradient-to-br from-chart-1 to-chart-5" />
            <div className="h-10 w-10 rounded-full border-2 border-border bg-gradient-to-br from-chart-2 to-chart-3" />
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-primary text-xs font-medium text-primary-foreground">
              +
            </div>
          </div>
          <span className="text-sm text-muted-foreground">Trusted by 500+ teams worldwide</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">© 2024 CollabX Inc. All rights reserved.</p>
    </div>
  )
}

function JoinBrandingPanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 lg:p-12">
      <div className="space-y-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/20">
          <Users className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-foreground lg:text-4xl">
            Together we achieve more.
          </h2>
          <p className="mx-auto max-w-sm text-muted-foreground">
            Connect with your team, sync your workflow, and accelerate your projects with CollabX workspace tools.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <div className="rounded-xl border border-border bg-muted/30 px-6 py-4 text-center">
            <p className="text-2xl font-bold text-primary">10k+</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Teams</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 px-6 py-4 text-center">
            <p className="text-2xl font-bold text-primary">500k</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Users</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 px-6 py-4 text-center">
            <p className="text-2xl font-bold text-primary">99.9%</p>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Uptime</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function OnboardingPage() {
  const [activeView, setActiveView] = React.useState<ActiveView>("create")

  const switchToJoin = () => setActiveView("join")
  const switchToCreate = () => setActiveView("create")

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left Panel */}
      <div
        className={`hidden w-1/2 transition-all duration-500 ease-in-out lg:block ${
          activeView === "create"
            ? "bg-muted"
            : "bg-background"
        }`}
      >
        <div className="relative h-full overflow-hidden">
          {/* Create Organization Form (Left side for Join view) */}
          <div
            className={`absolute inset-0 flex flex-col transition-all duration-500 ease-in-out ${
              activeView === "join"
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0"
            }`}
          >
            <div className="flex items-center justify-between p-8 lg:p-12">
              <CollabXLogo />
            </div>
            <div className="flex flex-1 items-center justify-center px-8 lg:px-16">
              <JoinOrganizationCard onSwitchToCreate={switchToCreate} />
            </div>
            <div className="flex items-center gap-6 p-8 lg:p-12">
              <p className="text-sm text-muted-foreground">© 2024 CollabX Inc.</p>
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Privacy</span>
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Terms</span>
            </div>
          </div>

          {/* Branding Panel (Left side for Create view) */}
          <div
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              activeView === "create"
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0"
            }`}
          >
            <CreateBrandingPanel />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div
        className={`flex w-full flex-col lg:w-1/2 ${
          activeView === "create"
            ? "bg-background"
            : "bg-muted"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 lg:p-8">
          <div className="lg:hidden">
            <CollabXLogo />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {activeView === "create" ? "Already have a code?" : "Need to start fresh?"}
            </span>
            <Button
              variant="outline"
              onClick={activeView === "create" ? switchToJoin : switchToCreate}
              className="border-border bg-card text-foreground hover:bg-muted hover:text-foreground"
            >
              {activeView === "create" ? "Join Organization" : "Create Organization"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6 lg:px-16">
          {/* Create Organization Card */}
          <div
            className={`w-full max-w-md transition-all duration-500 ease-in-out ${
              activeView === "create"
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0 absolute pointer-events-none"
            }`}
          >
            <CreateOrganizationCard />
          </div>

          {/* Join Branding Panel (Right side) */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${
              activeView === "join"
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 pointer-events-none"
            }`}
          >
            <JoinBrandingPanel />
          </div>
        </div>

        {/* Footer for mobile */}
        <div className="p-6 text-center lg:hidden">
          <p className="text-sm text-muted-foreground">© 2024 CollabX Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
export { OnboardingPage }
