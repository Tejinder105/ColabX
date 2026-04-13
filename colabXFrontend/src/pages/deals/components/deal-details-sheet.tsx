import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FileText, Download, Activity, MessageSquare, UserPlus, X, Users, Send, Loader2, Plus, Trash2, CheckCircle2, Upload } from "lucide-react";
import type { Deal } from "@/types/deal";
import { 
    useDealDetails, 
    useAssignUserToDealMutation, 
    useRemoveUserFromDealMutation,
    useDealMessages,
    useSendDealMessageMutation,
    useDealTasks,
    useCreateDealTaskMutation,
    useUpdateDealTaskMutation,
    useDeleteDealTaskMutation,
    useDealDocuments,
    useCreateDealDocumentMutation,
    useDeleteDealDocumentMutation,
    useDeleteDealMutation,
} from "@/hooks/useDeals";
import { useOrgMembers } from "@/hooks/useOrg";
import { useCurrentUser } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { useRbac } from "@/hooks/useRbac";
import { useState, useRef, useEffect } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { validateUploadFile } from "@/lib/documentUpload";
import { toast } from "sonner";

interface DealDetailsSheetProps {
    deal: Deal | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DealDetailsSheet({ deal, open, onOpenChange }: DealDetailsSheetProps) {
    const { data: dealDetails } = useDealDetails(deal?.id, open && !!deal?.id);
    const activeOrgId = useAuthStore((state) => state.activeOrgId);
    const { data: currentUser } = useCurrentUser();
    const { canManageDeals, isPartner, isMember } = useRbac();
    const canManageDealDocuments = canManageDeals || isPartner || isMember;
    const { data: membersData } = useOrgMembers(activeOrgId, { enabled: canManageDeals });
    
    // Assignment mutations
    const assignUser = useAssignUserToDealMutation();
    const removeUser = useRemoveUserFromDealMutation();
    
    // Message queries and mutations
    const { data: messagesData, isLoading: messagesLoading } = useDealMessages(deal?.id, open && !!deal?.id);
    const sendMessage = useSendDealMessageMutation();
    const { data: tasksData, isLoading: tasksLoading } = useDealTasks(deal?.id, open && !!deal?.id && !isPartner);
    const createTask = useCreateDealTaskMutation();
    const updateTask = useUpdateDealTaskMutation();
    const deleteTask = useDeleteDealTaskMutation();
    const { data: documentsData, isLoading: documentsLoading } = useDealDocuments(deal?.id, open && !!deal?.id);
    const createDocument = useCreateDealDocumentMutation();
    const deleteDocument = useDeleteDealDocumentMutation();
    const deleteDeal = useDeleteDealMutation();
    
    const [selectedUserId, setSelectedUserId] = useState<string>("");
    const [messageText, setMessageText] = useState<string>("");
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskAssigneeId, setNewTaskAssigneeId] = useState("");
    const [newTaskDueDate, setNewTaskDueDate] = useState("");
    const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null);
    const [documentVisibility, setDocumentVisibility] = useState<"shared" | "internal">("shared");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messagesData?.messages]);

    if (!deal) return null;

    const assignments = dealDetails?.assignments ?? [];
    const activities = (dealDetails?.activities ?? deal.activity ?? []).map((activity) => (
        'activityLogId' in activity
            ? activity
            : {
                activityLogId: activity.id,
                action: activity.action,
                userName: activity.user,
                createdAt: activity.timestamp,
            }
    ));
    const messages = messagesData?.messages ?? [];
    const tasks = tasksData?.tasks ?? dealDetails?.tasks ?? [];
    const documents = documentsData?.documents ?? dealDetails?.documents ?? [];
    
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

    const handleCreateTask = () => {
        if (!newTaskTitle.trim() || !deal.id) return;
        createTask.mutate(
            {
                dealId: deal.id,
                input: {
                    title: newTaskTitle.trim(),
                    assigneeUserId: newTaskAssigneeId || undefined,
                    dueDate: newTaskDueDate ? new Date(`${newTaskDueDate}T23:59:00`).toISOString() : undefined,
                },
            },
            {
                onSuccess: () => {
                    setNewTaskTitle("");
                    setNewTaskAssigneeId("");
                    setNewTaskDueDate("");
                    toast.success("Task created");
                },
                onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create task"),
            }
        );
    };

    const handleUpdateTaskStatus = (taskId: string, status: "todo" | "in_progress" | "done") => {
        if (!deal.id) return;
        updateTask.mutate(
            { dealId: deal.id, taskId, input: { status } },
            { onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to update task") }
        );
    };

    const handleDeleteTask = (taskId: string) => {
        if (!deal.id) return;
        deleteTask.mutate(
            { dealId: deal.id, taskId },
            { onSuccess: () => toast.success("Task deleted") }
        );
    };

    const handleDocumentFileSelected = (file: File | null) => {
        if (!file) {
            setSelectedDocumentFile(null);
            return;
        }

        const error = validateUploadFile(file);
        if (error) {
            toast.error(error);
            setSelectedDocumentFile(null);
            return;
        }

        setSelectedDocumentFile(file);
    };

    const handleUploadDocument = async () => {
        if (!selectedDocumentFile || !deal.id) return;
        try {
            const uploaded = await uploadToCloudinary({ file: selectedDocumentFile });
            await createDocument.mutateAsync({
                dealId: deal.id,
                input: {
                    fileName: selectedDocumentFile.name || uploaded.originalFilename,
                    fileUrl: uploaded.secureUrl,
                    visibility: documentVisibility,
                },
            });
            setSelectedDocumentFile(null);
            setDocumentVisibility("shared");
            toast.success("Document uploaded");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to upload document");
        }
    };

    const handleDeleteDocument = (documentId: string) => {
        if (!deal.id) return;
        deleteDocument.mutate(
            { dealId: deal.id, documentId },
            { onSuccess: () => toast.success("Document deleted") }
        );
    };

    const handleDeleteDeal = () => {
        if (!deal.id) return;
        if (!window.confirm(`Delete deal "${deal.name}"? This action cannot be undone.`)) return;
        deleteDeal.mutate(deal.id, {
            onSuccess: () => {
                toast.success("Deal deleted");
                onOpenChange(false);
            },
            onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to delete deal"),
        });
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
                        {canManageDeals && (
                            <Button
                                variant="destructive"
                                size="sm"
                                className="mt-3 w-fit"
                                onClick={handleDeleteDeal}
                                disabled={deleteDeal.isPending}
                            >
                                {deleteDeal.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Delete Deal
                            </Button>
                        )}
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-hidden">
                    <Tabs defaultValue={isPartner ? "messages" : "assignees"} className="w-full h-full flex flex-col">
                        <div className="px-6 pt-4 border-b border-white/5">
                            <TabsList className="grid w-full grid-cols-5 max-w-[650px]">
                                {!isPartner && (
                                    <TabsTrigger value="assignees" className="flex items-center gap-2">
                                        <Users className="w-4 h-4" /> Assignees
                                    </TabsTrigger>
                                )}
                                <TabsTrigger value="messages" className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" /> Messages
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Documents
                                </TabsTrigger>
                                {!isPartner && (
                                    <TabsTrigger value="tasks" className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Tasks
                                    </TabsTrigger>
                                )}
                                {!isPartner && (
                                    <TabsTrigger value="activity" className="flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Activity
                                    </TabsTrigger>
                                )}
                            </TabsList>
                        </div>

                        <ScrollArea className="flex-1 p-6">

                            {/* ASSIGNEES TAB */}
                            {!isPartner && (
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
                                                key={assignment.dealAssignmentId}
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
                            )}

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
                                                const isOwnMessage = msg.senderUserId === currentUser?.user?.id;
                                                return (
                                                    <div key={msg.dealMessageId} className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
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
                                {canManageDealDocuments && (
                                    <div className="rounded-lg border p-4 space-y-3">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                            <div className="flex-1 space-y-2">
                                                <Label htmlFor="dealDocument">Upload Document</Label>
                                                <Input
                                                    id="dealDocument"
                                                    type="file"
                                                    onChange={(event) => handleDocumentFileSelected(event.target.files?.[0] || null)}
                                                    disabled={createDocument.isPending}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Visibility</Label>
                                                <Select
                                                    value={documentVisibility}
                                                    onValueChange={(value) => setDocumentVisibility(value as "shared" | "internal")}
                                                    disabled={isPartner}
                                                >
                                                    <SelectTrigger className="w-[140px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="shared">Shared</SelectItem>
                                                        {!isPartner && <SelectItem value="internal">Internal</SelectItem>}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button onClick={handleUploadDocument} disabled={!selectedDocumentFile || createDocument.isPending}>
                                                {createDocument.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                                Upload
                                            </Button>
                                        </div>
                                        {selectedDocumentFile ? (
                                            <p className="text-xs text-muted-foreground">Selected: {selectedDocumentFile.name}</p>
                                        ) : null}
                                    </div>
                                )}

                                {documentsLoading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : documents.length > 0 ? (
                                    <div className="space-y-3">
                                        {documents.map((doc) => (
                                            <div key={doc.dealDocumentId} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm">{doc.fileName}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <span>{doc.visibility}</span>
                                                            <span>Uploaded by {doc.uploaderName ?? doc.uploadedByUserId} {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" asChild disabled={!doc.fileUrl}>
                                                    <a
                                                        href={doc.fileUrl ?? '#'}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        onClick={(event) => {
                                                            if (!doc.fileUrl) {
                                                                event.preventDefault();
                                                            }
                                                        }}
                                                    >
                                                    <Download className="w-4 h-4 text-muted-foreground" />
                                                    </a>
                                                </Button>
                                                {canManageDealDocuments && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDeleteDocument(doc.dealDocumentId)}
                                                        disabled={deleteDocument.isPending}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">No documents attached to this deal.</div>
                                )}
                            </TabsContent>

                            {/* TASKS TAB */}
                            {!isPartner && (
                                <TabsContent value="tasks" className="m-0 space-y-4">
                                    {canManageDeals && (
                                        <div className="rounded-lg border p-4 space-y-3">
                                            <div className="grid gap-3 md:grid-cols-[1fr_180px_160px_auto] md:items-end">
                                                <div className="space-y-2">
                                                    <Label>Task</Label>
                                                    <Input
                                                        placeholder="Follow up with procurement"
                                                        value={newTaskTitle}
                                                        onChange={(event) => setNewTaskTitle(event.target.value)}
                                                        disabled={createTask.isPending}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Assignee</Label>
                                                    <Select value={newTaskAssigneeId} onValueChange={setNewTaskAssigneeId}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Optional" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {(membersData?.members ?? []).map((member) => (
                                                                <SelectItem key={member.userId} value={member.userId}>
                                                                    {member.userName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Due Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={newTaskDueDate}
                                                        onChange={(event) => setNewTaskDueDate(event.target.value)}
                                                        disabled={createTask.isPending}
                                                    />
                                                </div>
                                                <Button onClick={handleCreateTask} disabled={!newTaskTitle.trim() || createTask.isPending}>
                                                    {createTask.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                                    Add
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {tasksLoading ? (
                                        <div className="flex items-center justify-center py-10">
                                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : tasks.length > 0 ? (
                                        <div className="space-y-3">
                                            {tasks.map((task) => (
                                                <div key={task.dealTaskId} className="rounded-lg border p-4 space-y-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-medium">{task.title}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {task.assigneeName ?? task.assigneeUserId ?? "Unassigned"}
                                                                {task.dueDate ? ` - Due ${new Date(task.dueDate).toLocaleDateString()}` : ""}
                                                            </p>
                                                        </div>
                                                        {canManageDeals && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-destructive hover:text-destructive"
                                                                onClick={() => handleDeleteTask(task.dealTaskId)}
                                                                disabled={deleteTask.isPending}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <Select
                                                        value={task.status}
                                                        onValueChange={(value) => handleUpdateTaskStatus(task.dealTaskId, value as "todo" | "in_progress" | "done")}
                                                        disabled={updateTask.isPending}
                                                    >
                                                        <SelectTrigger className="w-[180px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="todo">To do</SelectItem>
                                                            <SelectItem value="in_progress">In progress</SelectItem>
                                                            <SelectItem value="done">Done</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-muted-foreground">No tasks attached to this deal.</div>
                                    )}
                                </TabsContent>
                            )}

                            {/* ACTIVITY TAB */}
                            <TabsContent value="activity" className="m-0 space-y-4">
                                {activities.length > 0 ? (
                                    <div className="space-y-6 relative pl-3">
                                        <div className="absolute left-[15px] top-2 bottom-0 w-px bg-border"></div>
                                        {activities.map((act) => (
                                            <div key={act.activityLogId} className="relative flex gap-4 text-sm">
                                                <div className="bg-background rounded-full p-1 mt-0.5 z-10 border shadow-sm h-min">
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                </div>
                                                <div className="flex flex-col flex-1">
                                                    <span className="text-foreground">{act.action}</span>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                        <span className="font-medium text-foreground/80">{act.userName ?? 'Unknown'}</span>
                                                        <span>•</span>
                                                        <span>{act.createdAt}</span>
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
