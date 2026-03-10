import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Info, ArrowRight, Loader2 } from "lucide-react"
import { useCreateOrgMutation } from "@/hooks/useOrg"

function CreateOrganizationCard() {
  const [organizationName, setOrganizationName] = React.useState("")
  const navigate = useNavigate()
  const createOrgMutation = useCreateOrgMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizationName.trim()) return

    createOrgMutation.mutate(
      { name: organizationName.trim() },
      {
        onSuccess: () => {
          navigate("/dashboard")
        },
      }
    )
  }

  return (
    <Card className="w-full max-w-md border-0 bg-transparent shadow-none">
      <CardHeader className="space-y-2 px-0">
        <CardTitle className="text-3xl font-bold text-foreground">
          Create Organization
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Get started by setting up your team's workspace. You can invite your team later.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-0">
          <div className="space-y-2">
            <Label htmlFor="org-name" className="text-sm font-medium text-muted-foreground">
              Organization Name
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="org-name"
                type="text"
                placeholder="e.g. Acme Corporation"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                disabled={createOrgMutation.isPending}
                className="h-12 border-input bg-background/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
              />
            </div>
          </div>

          {createOrgMutation.isError && (
            <p className="text-sm text-destructive">
              {createOrgMutation.error?.message || "Failed to create organization"}
            </p>
          )}

          <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              The organization name will be used to create your unique workspace URL and brand your dashboard.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4 px-0 pt-2">
          <Button
            type="submit"
            size="lg"
            disabled={createOrgMutation.isPending || !organizationName.trim()}
            className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {createOrgMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Organization
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            By creating an organization, you agree to our{" "}
            <span className="cursor-pointer text-primary hover:underline">Terms of Service</span>
            {" "}and{" "}
            <span className="cursor-pointer text-primary hover:underline">Privacy Policy</span>.
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export { CreateOrganizationCard }
