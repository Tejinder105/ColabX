import { Navigate, useLocation } from "react-router-dom"
import { useCurrentUser } from "@/hooks/useAuth"
import { useAuthStore } from "@/stores/authStore"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
    children: React.ReactNode
    requireOrg?: boolean
}

export function ProtectedRoute({ children, requireOrg = true }: ProtectedRouteProps) {
    const location = useLocation()
    const { data, isLoading, isError } = useCurrentUser()
    const activeOrgId = useAuthStore((state) => state.activeOrgId)
    const setActiveOrg = useAuthStore((state) => state.setActiveOrg)

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if (isError || !data?.user) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />
    }

    if (requireOrg && data.orgCount === 0 && !activeOrgId) {
        return <Navigate to="/onboarding" replace />
    }

    if (requireOrg && data.organizations.length > 0 && !activeOrgId) {
        const firstOrg = data.organizations[0]
        if (firstOrg) {
            setActiveOrg(firstOrg)
        }
    }

    return <>{children}</>
}
