import { AlertCircle, Loader2, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useMyPartner, usePartnerDeals } from "@/hooks/usePartners";
import { usePartnerDocuments, usePartnerCommunications } from "@/hooks/useCollaboration";
import { NewMessageDialog } from "@/pages/dashboard/partners/components/new-message-dialog";

function formatCurrency(value: number | null) {
    if (value === null) return "-";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function titleCase(value: string) {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function MyPartnershipPage() {
    const myPartnerQuery = useMyPartner();
    const partnerId = myPartnerQuery.data?.partner?.id;

    const dealsQuery = usePartnerDeals(partnerId);
    const documentsQuery = usePartnerDocuments(partnerId);
    const communicationsQuery = usePartnerCommunications(partnerId);

    if (myPartnerQuery.isLoading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (myPartnerQuery.isError || !myPartnerQuery.data?.partner) {
        return (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                    <h2 className="text-xl font-semibold">Unable to load your partnership profile</h2>
                    <p className="text-sm text-muted-foreground">
                        We could not find a partner profile linked to your account.
                    </p>
                </div>
                <Button onClick={() => myPartnerQuery.refetch()}>Try again</Button>
            </div>
        );
    }

    const partner = myPartnerQuery.data.partner;
    const deals = dealsQuery.data?.deals ?? [];
    const documents = documentsQuery.data?.documents ?? [];
    const communications = communicationsQuery.data?.communications ?? [];

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">My Partnership</h1>
                <p className="text-sm text-muted-foreground">
                    Your organization profile, deals, shared documents, and communication history.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Your partner profile in this organization.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <p className="text-xs text-muted-foreground">Partner Name</p>
                        <p className="font-medium">{partner.name}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Type</p>
                        <p className="font-medium">{titleCase(partner.type)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Badge variant="secondary">{titleCase(partner.status)}</Badge>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Contact</p>
                        <p className="font-medium">{partner.contactEmail}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Deals</CardTitle>
                    <CardDescription>Deals associated with your partnership.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {dealsQuery.isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading deals...
                        </div>
                    ) : deals.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No deals found for your partnership yet.</p>
                    ) : (
                        deals.map((deal) => (
                            <div key={deal.id} className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <p className="font-medium">{deal.title}</p>
                                    <p className="text-xs text-muted-foreground">Stage: {titleCase(deal.stage)}</p>
                                </div>
                                <p className="text-sm font-semibold">{formatCurrency(deal.value)}</p>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Shared Documents</CardTitle>
                    <CardDescription>Documents shared with your partnership.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {documentsQuery.isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading documents...
                        </div>
                    ) : documents.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No shared documents yet.</p>
                    ) : (
                        documents.map((document) => (
                            <div key={document.id} className="flex items-center justify-between rounded-md border p-3">
                                <div>
                                    <p className="font-medium">{document.fileName}</p>
                                    <p className="text-xs text-muted-foreground">Visibility: {titleCase(document.visibility)}</p>
                                </div>
                                <a
                                    href={document.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-primary hover:underline"
                                >
                                    Open
                                </a>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Communication</CardTitle>
                        <CardDescription>Messages between your team and the organization.</CardDescription>
                    </div>
                    {partnerId ? (
                        <NewMessageDialog
                            partnerId={partnerId}
                            trigger={
                                <Button variant="outline" size="sm">
                                    <Mail className="mr-2 h-4 w-4" />
                                    New Message
                                </Button>
                            }
                        />
                    ) : null}
                </CardHeader>
                <CardContent className="space-y-3">
                    {communicationsQuery.isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading communication...
                        </div>
                    ) : communications.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No messages yet.</p>
                    ) : (
                        communications.map((message) => (
                            <div key={message.id} className="rounded-md border p-3">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-sm font-medium">{message.senderName ?? "Unknown sender"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(message.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground">{message.message}</p>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
