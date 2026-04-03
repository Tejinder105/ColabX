import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FileText, Download, Activity, MessageSquare } from "lucide-react";
import type { Deal } from "@/types/deal";
import { useDealDetails } from "@/hooks/useDeals";

interface DealDetailsSheetProps {
    deal: Deal | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DealDetailsSheet({ deal, open, onOpenChange }: DealDetailsSheetProps) {
    const { data: dealDetails } = useDealDetails(deal?.id, open && !!deal?.id);

    if (!deal) return null;

    const assignments = dealDetails?.assignments ?? [];
    const activities = dealDetails?.activities ?? deal.activity ?? [];

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
    }).format(val);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col p-0 border-l border-white/10 bg-background/95 backdrop-blur-xl">
                <div className="p-6 border-b border-white/5">
                    <SheetHeader className="text-left space-y-2">
                        <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-muted-foreground">
                                {assignments.length > 0
                                    ? `${assignments.length} assignee${assignments.length === 1 ? '' : 's'}`
                                    : deal.assignedTeam}
                            </Badge>
                            <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">{deal.stage}</Badge>
                        </div>
                        <SheetTitle className="text-2xl font-bold">{deal.name}</SheetTitle>
                        <SheetDescription className="flex items-center gap-2 text-base">
                            <span className="font-semibold text-foreground">{deal.partnerName}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-emerald-500 font-medium">{formatCurrency(deal.value)}</span>
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-hidden">
                    <Tabs defaultValue="messages" className="w-full h-full flex flex-col">
                        <div className="px-6 pt-4 border-b border-white/5">
                            <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                                <TabsTrigger value="messages" className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> Messages
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Documents
                                </TabsTrigger>
                                <TabsTrigger value="activity" className="flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Activity
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 p-6">

                            {/* MESSAGES TAB */}
                            <TabsContent value="messages" className="m-0 space-y-4">
                                {deal.messages && deal.messages.length > 0 ? (
                                    <div className="space-y-6">
                                        {deal.messages.map((msg) => (
                                            <div key={msg.id} className={`flex gap-4 ${msg.senderRole === 'Manager' ? 'flex-row-reverse' : ''}`}>
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={msg.avatarUrl} />
                                                    <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className={`flex flex-col space-y-1 w-full max-w-[80%] ${msg.senderRole === 'Manager' ? 'items-end' : 'items-start'}`}>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span className="font-semibold text-foreground">{msg.sender}</span>
                                                        <span>{msg.timestamp}</span>
                                                    </div>
                                                    <div className={`p-3 rounded-lg text-sm ${msg.senderRole === 'Manager'
                                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                                            : 'bg-muted rounded-tl-none'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">No messages yet. Start the conversation!</div>
                                )}
                            </TabsContent>

                            {/* DOCUMENTS TAB */}
                            <TabsContent value="documents" className="m-0 space-y-4">
                                {deal.documents && deal.documents.length > 0 ? (
                                    <div className="space-y-3">
                                        {deal.documents.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{doc.name}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <span>{doc.type}</span>•<span>{doc.size}</span>•<span>Uploaded by {doc.uploadedBy} {doc.uploadedAt}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" asChild disabled={!doc.url}>
                                                    <a
                                                        href={doc.url ?? '#'}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(event) => {
                                                            if (!doc.url) {
                                                                event.preventDefault();
                                                            }
                                                        }}
                                                    >
                                                    <Download className="w-4 h-4 text-muted-foreground" />
                                                    </a>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">No documents attached to this deal.</div>
                                )}
                            </TabsContent>

                            {/* ACTIVITY TAB */}
                            <TabsContent value="activity" className="m-0 space-y-4">
                                {activities.length > 0 ? (
                                    <div className="space-y-6 relative pl-3">
                                        <div className="absolute left-[15px] top-2 bottom-0 w-px bg-border"></div>
                                        {activities.map((act) => (
                                            <div key={act.id} className="relative flex gap-4 text-sm">
                                                <div className="bg-background rounded-full p-1 mt-0.5 z-10 border shadow-sm h-min">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                </div>
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-foreground">{act.action}</span>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                        <span className="font-medium text-foreground/80">{act.user}</span>
                                                        <span>•</span>
                                                        <span>{act.timestamp}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">No recent activity.</div>
                                )}
                            </TabsContent>
                        </ScrollArea>

                    </Tabs>
                </div>
            </SheetContent>
        </Sheet>
    );
}
