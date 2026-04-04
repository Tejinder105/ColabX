import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Activity, MessageSquare, UserPlus, X, Users, Send, Loader2 } from "lucide-react";
import type { Deal } from "@/types/deal";
import { 
    useDealDetails, 
    useAssignUserToDealMutation, 
    useRemoveUserFromDealMutation,
    useDealMessages,
    useSendDealMessageMutation,
} from "@/hooks/useDeals";
import { useOrgMembers } from "@/hooks/useOrg";
import { useCurrentUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { useRbac } from "@/hooks/useRbac";
import { useState, useRef, useEffect } from "react";

interface DealDetailsSheetProps {
    deal: Deal | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DealDetailsSheet({ deal, open, onOpenChange }: DealDetailsSheetProps) {
    const { data: dealDetails } = useDealDetails(deal?.id, open && !!deal?.id);
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    const { data: currentUser } = useCurrentUser();
    const { data: membersData } = useOrgMembers(activeOrgId);
    const { canManageDeals } = useRbac();
    
    // Assignment mutations
    const assignUser = useAssignUserToDealMutation();
    const removeUser = useRemoveUserFromDealMutation();
    
    // Message queries and mutations
    const { data: messagesData, isLoading: messagesLoading } = useDealMessages(deal?.id, open && !!deal?.id);
    const sendMessage = useSendDealMessageMutation();
    
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [messageText, setMessageText] = useState<string>("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messagesData?.messages]);

    if (!deal) return null;

    const assignments = dealDetails?.assignments ?? [];
    const activities = dealDetails?.activities ?? deal.activity ?? [];
    const messages = messagesData?.messages ?? [];
    
    // Get members not already assigned to this deal
    const assignedUserIds = new Set(assignments.map(a => a.userId));
    const availableMembers = (membersData?.members ?? []).filter(
        m => !assignedUserIds.has(m.userId)
    );

    const handleAssignUser = () => {
        if (!selectedUserId || !deal.id) return;
        assignUser.mutate(
            { dealId: deal.id, userId: selectedUserId },
            { onSuccess: () => setSelectedUserId("") }
        );
    };

    const handleRemoveUser = (userId: string) => {
        if (!deal.id) return;
        removeUser.mutate({ dealId: deal.id, userId });
    };

    const handleSendMessage = () => {
        if (!messageText.trim() || !deal.id) return;
        sendMessage.mutate(
            { dealId: deal.id, content: messageText.trim() },
            { onSuccess: () => setMessageText("") }
        );
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
    }).format(val);

    const formatMessageTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

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
                    <Tabs defaultValue="assignees" className="w-full h-full flex flex-col">
                        <div className="px-6 pt-4 border-b border-white/5">
                            <TabsList className="grid w-full grid-cols-4 max-w-[500px]">
                                <TabsTrigger value="assignees" className="flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Assignees
                                </TabsTrigger>
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

                            {/* ASSIGNEES TAB */}
                            <TabsContent value="assignees" className="m-0 space-y-4">
                                {/* Add Assignee Section - Only for Admin/Manager */}
                                {canManageDeals && (
                                    <div className="flex gap-2 items-center mb-6">
                                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select a team member to assign..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableMembers.length === 0 ? (
                                                    <SelectItem value="_none" disabled>
                                                        All members are assigned
                                                    </SelectItem>
                                                ) : (
                                                    availableMembers.map((member) => (
                                                        <SelectItem key={member.userId} value={member.userId}>
                                                            {member.userName} ({member.userEmail})
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            onClick={handleAssignUser}
                                            disabled={!selectedUserId || assignUser.isPending}
                                            size="sm"
                                        >
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Assign
                                        </Button>
                                    </div>
                                )}

                                {/* Assignees List */}
                                {assignments.length > 0 ? (
                                    <div className="space-y-3">
                                        {assignments.map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-10 h-10">
                                                        <AvatarImage src={assignment.userImage ?? undefined} />
                                                        <AvatarFallback>
                                                            {assignment.userName?.charAt(0) ?? '?'}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-sm">{assignment.userName}</p>
                                                        <p className="text-xs text-muted-foreground">{assignment.userEmail}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-muted-foreground">
                                                        Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                                                    </span>
                                                    {canManageDeals && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleRemoveUser(assignment.userId)}
                                                            disabled={removeUser.isPending}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        No one is assigned to this deal yet.
                                        {canManageDeals && " Use the dropdown above to assign team members."}
                                    </div>
                                )}
                            </TabsContent>

                            {/* MESSAGES TAB */}
                            <TabsContent value="messages" className="m-0 h-full flex flex-col">
                                <div className="flex-1 space-y-4 pb-4">
                                    {messagesLoading ? (
                                        <div className="flex items-center justify-center py-10">
                                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : messages.length > 0 ? (
                                        <div className="space-y-4">
                                            {messages.map((msg) => {
                                                const isOwnMessage = msg.senderId === currentUser?.user?.id;
                                                return (
                                                    <div key={msg.id} className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                                                        <Avatar className="w-8 h-8 shrink-0">
                                                            <AvatarImage src={msg.senderImage ?? undefined} />
                                                            <AvatarFallback className="text-xs">
                                                                {msg.senderName?.charAt(0) ?? '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className={`flex flex-col space-y-1 max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                                            <div className={`flex items-center gap-2 text-xs text-muted-foreground ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                                                                <span className="font-medium text-foreground">
                                                                    {isOwnMessage ? 'You' : msg.senderName}
                                                                </span>
                                                                <span>{formatMessageTime(msg.createdAt)}</span>
                                                            </div>
                                                            <div className={`p-3 rounded-xl text-sm leading-relaxed ${
                                                                isOwnMessage
                                                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                                                    : 'bg-muted rounded-bl-sm'
                                                            }`}>
                                                                {msg.content}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-muted-foreground">
                                            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                            <p>No messages yet.</p>
                                            <p className="text-sm">Start the conversation!</p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Message Input */}
                                <div className="flex gap-2 pt-4 border-t border-white/10">
                                    <Input
                                        placeholder="Type a message..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        disabled={sendMessage.isPending}
                                        className="flex-1"
                                    />
                                    <Button 
                                        onClick={handleSendMessage} 
                                        disabled={!messageText.trim() || sendMessage.isPending}
                                        size="icon"
                                    >
                                        {sendMessage.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
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
