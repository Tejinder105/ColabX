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
import { Separator } from "@/components/ui/separator"
import { KeyRound, ArrowRight, Building2, Loader2, CheckCircle2 } from "lucide-react"
import { useValidateInvite, useAcceptInviteMutation } from "@/hooks/useOrg"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface JoinOrganizationCardProps {
  onSwitchToCreate?: () => void
}

function JoinOrganizationCard({ onSwitchToCreate }: JoinOrganizationCardProps) {
  const [invitationCode, setInvitationCode] = React.useState("")
  const [validatedToken, setValidatedToken] = React.useState<string | undefined>()
  const navigate = useNavigate()

  const validateQuery = useValidateInvite(validatedToken)
  const acceptMutation = useAcceptInviteMutation()

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!invitationCode.trim()) return
    setValidatedToken(invitationCode.trim())
  }

  const handleJoin = () => {
    if (!validatedToken) return
    const role = validateQuery.data?.invitation?.role ?? 'partner'
    acceptMutation.mutate({ token: validatedToken, role }, {
      onSuccess: () => {
        navigate("/dashboard")
      },
    })
  }

  const isValidated = validateQuery.isSuccess && validateQuery.data?.valid

  return (
    <Card className="w-full max-w-md border-0 bg-transparent shadow-none">
      <CardHeader className="space-y-2 px-0">
        <CardTitle className="text-3xl font-bold text-foreground">
          Join Organization
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground">
          Enter the invitation code provided by your admin
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleValidate}>
        <CardContent className="space-y-4 px-0">
          <div className="space-y-2">
            <Label htmlFor="invite-code" className="text-sm font-medium text-muted-foreground">
              Invitation Code
            </Label>


            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      id="invite-code"
                      type="text"
                      placeholder="e.g. CX-123-ABC"
                      value={invitationCode}
                      onChange={(e) => {
                        setInvitationCode(e.target.value)
                        setValidatedToken(undefined)
                      }}
                      disabled={validateQuery.isLoading || acceptMutation.isPending}
                      className="h-12 border-input bg-background/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Case sensitive code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {validateQuery.isError && (
            <p className="text-sm text-destructive">
              {validateQuery.error?.message || "Invalid invitation code"}
            </p>
          )}

          {acceptMutation.isError && (
            <p className="text-sm text-destructive">
              {acceptMutation.error?.message || "Failed to join organization"}
            </p>
          )}

          {isValidated && validateQuery.data?.invitation && (
            <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {validateQuery.data.invitation.organization.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  You'll join as {validateQuery.data.invitation.role}
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-6 px-0 pt-4">
          {!isValidated ? (
            <Button
              type="submit"
              size="lg"
              disabled={validateQuery.isLoading || !invitationCode.trim()}
              className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {validateQuery.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  Validate Code
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={handleJoin}
              disabled={acceptMutation.isPending}
              className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Organization
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          )}

          <Separator className="bg-border" />

          <div className="w-full space-y-3">
            <p className="text-sm text-muted-foreground">Need to start fresh?</p>
            <button
              type="button"
              onClick={onSwitchToCreate}
              className="flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              <Building2 className="h-4 w-4" />
              Create a new organization
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}

export { JoinOrganizationCard }
