import * as React from "react"
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
import { KeyRound, ArrowRight, Building2 } from "lucide-react"

interface JoinOrganizationCardProps {
  onSwitchToCreate?: () => void
}

function JoinOrganizationCard({ onSwitchToCreate }: JoinOrganizationCardProps) {
  const [invitationCode, setInvitationCode] = React.useState("")

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
      <CardContent className="space-y-2 px-0">
        <div className="space-y-2">
          <Label htmlFor="invite-code" className="text-sm font-medium text-muted-foreground">
            Invitation Code
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="invite-code"
              type="text"
              placeholder="e.g. CX-123-ABC"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="h-12 border-input bg-background/50 pl-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
            />
          </div>
          <p className="text-sm text-muted-foreground">Case sensitive code</p>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-6 px-0 pt-4">
        <Button
          type="button"
          size="lg"
          className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Join Organization
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

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
    </Card>
  )
}

export { JoinOrganizationCard }
