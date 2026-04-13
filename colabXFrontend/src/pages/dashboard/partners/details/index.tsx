import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Mail, ExternalLink, FileText, Download, Loader2, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceCharts } from './components/performance-charts';
import { PartnerTeamAssignmentCard } from './components/partner-team-assignment-card';
import { usePartner, usePartnerDeals } from '@/hooks/usePartners';
import { usePartnerPerformance } from '@/hooks/useOkrs';
import { useDeleteContactMutation, usePartnerContacts, useUpdateContactMutation } from '@/hooks/useContacts';
import { usePartnerCommunications, usePartnerDocuments, usePartnerActivities } from '@/hooks/useCollaboration';
import { EditPartnerDialog } from '../components/edit-partner-dialog';
import { AddContactDialog } from '../components/add-contact-dialog';
import { NewMessageDialog } from '../components/new-message-dialog';
import { UploadDocumentDialog } from '../components/upload-document-dialog';
import type { Partner, PartnerType, Industry, PartnerStage, UIStatus, HealthStatus, PartnerDeal, PartnerContact, PartnerDocument, PartnerCommunication, PartnerActivity } from '@/types/partner';
import type { ApiPartnerDetail, ApiPartnerDeal, ApiDealStage } from '@/services/partnersService';
import type { ApiContact } from '@/services/contactsService';
import type { ApiCommunication, ApiDocument, ApiActivity } from '@/services/collaborationService';
import type { ApiPartnerPerformanceSummary } from '@/services/okrService';

// --- Mapping helpers (same as PartnersPage) ---

function mapType(type: string): PartnerType {
    switch (type) {
        case 'reseller': return 'Reseller';
        case 'agent': return 'Agency';
        case 'technology': return 'Technology';
        case 'distributor': return 'Strategic';
        default: return 'Technology';
    }
}

function mapStage(status: string): PartnerStage {
    switch (status?.toLowerCase()) {
        case 'active': return 'Active';
        case 'inactive': return 'Churned';
        case 'onboarding': return 'Onboarding';
        default: return 'Prospect';
    }
}

function mapUiStatus(status: string): UIStatus {
    switch (status?.toLowerCase()) {
        case 'active': return 'Green';
        case 'inactive': return 'Red';
        default: return 'Yellow';
    }
}

function mapHealthStatus(status: string): HealthStatus {
    switch (status?.toLowerCase()) {
        case 'active': return 'Good';
        case 'inactive': return 'Poor';
        default: return 'Average';
    }
}

const VALID_INDUSTRIES: Industry[] = ['Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Software', 'Defense', 'Other'];

function mapIndustry(industry: string | null): Industry {
    if (!industry) return 'Other';
    const match = VALID_INDUSTRIES.find(i => i.toLowerCase() === industry.toLowerCase());
    return match ?? 'Other';
}

function mapDealStage(stage: ApiDealStage): PartnerDeal['stage'] {
    switch (stage) {
        case 'lead': return 'Discovery';
        case 'proposal': return 'Proposal';
        case 'negotiation': return 'Negotiation';
        case 'won': return 'Closed Won';
        case 'lost': return 'Closed Lost';
        default: return 'Discovery';
    }
}

function mapApiDealToPartnerDeal(deal: ApiPartnerDeal): PartnerDeal {
    return {
        id: deal.dealId,
        name: deal.title,
        amount: deal.value ?? 0,
        stage: mapDealStage(deal.stage),
        expectedCloseDate: deal.updatedAt,
    };
}

function mapApiContactToPartnerContact(contact: ApiContact): PartnerContact {
    return {
        id: contact.contactId,
        name: contact.name,
        email: contact.email,
        role: contact.role ?? '',
        phone: contact.phone ?? undefined,
    };
}

function mapApiCommunicationToPartnerCommunication(comm: ApiCommunication): PartnerCommunication {
    return {
        id: comm.communicationId,
        sender: comm.senderName ?? 'Unknown',
        subject: '',
        snippet: comm.message,
        date: comm.createdAt,
        isUnread: false,
    };
}

function mapApiDocumentToPartnerDocument(doc: ApiDocument): PartnerDocument {
    return {
        id: doc.documentId,
        name: doc.fileName,
        type: doc.visibility,
        size: '',
        uploadDate: doc.uploadedAt,
        url: doc.fileUrl,
    };
}

function mapApiActivityToPartnerActivity(activity: ApiActivity): PartnerActivity {
    return {
        id: activity.activityLogId,
        type: 'Note',
        description: activity.action,
        date: activity.createdAt,
    };
}

interface PartnerCollaborationData {
    contacts: ApiContact[];
    communications: ApiCommunication[];
    documents: ApiDocument[];
    activities: ApiActivity[];
}

function toUiPartner(
    p: ApiPartnerDetail,
    deals: ApiPartnerDeal[] = [],
    collab: PartnerCollaborationData = { contacts: [], communications: [], documents: [], activities: [] },
    performance?: ApiPartnerPerformanceSummary
): Partner {
    const openDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
    const wonRevenue = deals
        .filter((deal) => deal.stage === 'won')
        .reduce((sum, deal) => sum + (deal.value ?? 0), 0);
    const performanceScore = Math.round(performance?.score?.score ?? performance?.completionRate ?? (p.status?.toLowerCase() === 'active' ? 80 : 40));
    return {
        id: p.partnerId,
        name: p.name,
        type: mapType(p.type),
        industry: mapIndustry(p.industry),
        ownerName: '—',
        stage: mapStage(p.status),
        healthScore: p.status?.toLowerCase() === 'active' ? 80 : 40,
        healthStatus: mapHealthStatus(p.status),
        uiStatus: mapUiStatus(p.status),
        performanceScore,
        openDealsCount: openDeals.length,
        openDealsValue: openDeals.reduce((sum, d) => sum + (d.value ?? 0), 0),
        lastActivityDate: p.updatedAt,
        nextActionDue: null,
        region: '',
        tags: [],
        contacts: collab.contacts.map(mapApiContactToPartnerContact),
        activities: collab.activities.map(mapApiActivityToPartnerActivity),
        activeDeals: openDeals.map(mapApiDealToPartnerDeal),
        okrs: [],
        documents: collab.documents.map(mapApiDocumentToPartnerDocument),
        communications: collab.communications.map(mapApiCommunicationToPartnerCommunication),
        performanceHistory: performance ? [{ date: 'Current', score: performanceScore }] : [],
        revenueHistory: deals.length > 0 ? [{ date: 'Current', revenue: wonRevenue }] : [],
        notes: '',
    };
}

// --- Component ---

const getUIStatusBadge = (uiStatus: string) => {
    switch (uiStatus) {
        case 'Green': return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Green</Badge>;
        case 'Yellow': return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Yellow</Badge>;
        case 'Red': return <Badge variant="destructive">Red</Badge>;
        default: return <Badge variant="outline">{uiStatus}</Badge>;
    }
};

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);
}

function titleCase(value: string) {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return date.toLocaleDateString();
}

export default function PartnerDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [editOpen, setEditOpen] = useState(false);

    const { data, isLoading, isError } = usePartner(id);
    const { data: dealsData, isLoading: dealsLoading } = usePartnerDeals(id);
    const { data: contactsData, isLoading: contactsLoading } = usePartnerContacts(id);
    const updateContact = useUpdateContactMutation();
    const deleteContact = useDeleteContactMutation();
    const { data: communicationsData, isLoading: communicationsLoading } = usePartnerCommunications(id);
    const { data: documentsData, isLoading: documentsLoading } = usePartnerDocuments(id);
    const { data: activitiesData, isLoading: activitiesLoading } = usePartnerActivities(id);
    const { data: performanceData, isLoading: performanceLoading } = usePartnerPerformance(id);

    const loading = isLoading || dealsLoading || contactsLoading || communicationsLoading || documentsLoading || activitiesLoading || performanceLoading;

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !data?.partner) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[500px]">
                <h3 className="text-xl font-semibold mb-2">Partner not found</h3>
                <p className="text-muted-foreground mb-4">
                    The partner you are looking for does not exist or has been removed.
                </p>
                <Button onClick={() => navigate('/partners')}>Back to Partners</Button>
            </div>
        );
    }

    const partner = toUiPartner(data.partner, dealsData?.deals ?? [], {
        contacts: contactsData?.contacts ?? [],
        communications: communicationsData?.communications ?? [],
        documents: documentsData?.documents ?? [],
        activities: activitiesData?.activities ?? [],
    }, performanceData);

    const partnerDeals = dealsData?.deals ?? [];
    const totalDeals = partnerDeals.length;
    const wonDeals = partnerDeals.filter((deal) => deal.stage === 'won').length;
    const revenueFromPartner = partnerDeals
        .filter((deal) => deal.stage === 'won')
        .reduce((sum, deal) => sum + (deal.value ?? 0), 0);

    const handleEditContact = (contact: PartnerContact) => {
        const name = window.prompt('Contact name', contact.name);
        if (!name?.trim()) return;
        const email = window.prompt('Contact email', contact.email);
        if (!email?.trim()) return;
        const role = window.prompt('Contact role', contact.role || '');
        updateContact.mutate(
            {
                contactId: contact.id,
                input: {
                    name: name.trim(),
                    email: email.trim(),
                    role: role?.trim() || null,
                },
            },
            {
                onError: (error) => alert(error instanceof Error ? error.message : 'Failed to update contact'),
            }
        );
    };

    const handleDeleteContact = (contact: PartnerContact) => {
        if (!window.confirm(`Delete contact "${contact.name}"?`)) return;
        deleteContact.mutate(contact.id);
    };

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 max-w-[1600px] mx-auto">
            {/* Header Area */}
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/partners')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight">{partner.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span>{partner.type} • {partner.industry}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">Owner: <span className="font-medium text-foreground">{partner.ownerName}</span></span>
                            <span>•</span>
                            {getUIStatusBadge(partner.uiStatus)}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <NewMessageDialog
                            partnerId={id!}
                            trigger={<Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Message</Button>}
                        />
                        <Button variant="outline" onClick={() => window.open(`mailto:${data.partner.contactEmail}`, '_blank')}>
                            <ExternalLink className="mr-2 h-4 w-4" /> Contact
                        </Button>
                        <Button onClick={() => setEditOpen(true)}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                    </div>
                </div>
            </div>

            <EditPartnerDialog partner={data.partner} open={editOpen} onOpenChange={setEditOpen} />

            <PartnerTeamAssignmentCard
                partnerId={id!}
                teams={data.teams ?? []}
            />

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview & Performance</TabsTrigger>
                    <TabsTrigger value="deals">Deals ({totalDeals})</TabsTrigger>
                    <TabsTrigger value="communications">Communications</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="notes">Internal Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Charts */}
                        <div className="border rounded-lg p-6 lg:col-span-2">
                            <PerformanceCharts partner={partner} />
                        </div>

                        {/* Contacts */}
                        <div className="border rounded-lg p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-semibold text-lg">Key Contacts</h3>
                                <AddContactDialog partnerId={id!} />
                            </div>
                            {partner.contacts && partner.contacts.length > 0 ? (
                                <div className="space-y-3">
                                    {partner.contacts.slice(0, 3).map((contact) => (
                                        <div key={contact.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                                            <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-medium">
                                                {contact.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{contact.name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{contact.role || contact.email}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditContact(contact)} disabled={updateContact.isPending}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteContact(contact)} disabled={deleteContact.isPending}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {partner.contacts.length > 3 && (
                                        <p className="text-xs text-muted-foreground text-center">+{partner.contacts.length - 3} more contacts</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No contacts added yet.</p>
                            )}
                        </div>

                        {/* OKRs */}
                        <div className="border rounded-lg p-6 space-y-4 lg:col-span-2">
                            <h3 className="font-semibold text-lg">Current OKRs</h3>
                            {partner.okrs && partner.okrs.length > 0 ? (
                                partner.okrs.map((okr, idx) => (
                                    <div key={idx} className="space-y-2 border-b pb-3 last:border-0">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium text-sm">{okr.title}</span>
                                            {getUIStatusBadge(okr.status)}
                                        </div>
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Target: {okr.target}</span>
                                            <span>Current: {okr.current}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm">No OKRs configured yet.</p>
                            )}
                        </div>

                        {/* Recent Activity */}
                        <div className="border rounded-lg p-6 space-y-4">
                            <h3 className="font-semibold text-lg">Recent Activity</h3>
                            {partner.activities && partner.activities.length > 0 ? (
                                <div className="space-y-3">
                                    {partner.activities.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 text-sm">
                                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                            <div>
                                                <p className="text-muted-foreground">{activity.description}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm">No recent activity.</p>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="deals" className="border rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Partner Deals</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-6">
                        <div className="rounded-lg border p-4">
                            <p className="text-xs text-muted-foreground">Total Deals</p>
                            <p className="text-2xl font-semibold">{totalDeals}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="text-xs text-muted-foreground">Won Deals</p>
                            <p className="text-2xl font-semibold">{wonDeals}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="text-xs text-muted-foreground">Revenue From Partner</p>
                            <p className="text-2xl font-semibold">{formatCurrency(revenueFromPartner)}</p>
                        </div>
                    </div>

                    {partnerDeals.length > 0 ? (
                        <div className="space-y-2">
                            {partnerDeals.map((deal) => {
                                const isClosed = deal.stage === 'won' || deal.stage === 'lost';
                                return (
                                    <div key={deal.dealId} className="grid grid-cols-1 gap-2 rounded-md border p-3 md:grid-cols-4 md:items-center">
                                        <div>
                                            <p className="font-medium">{deal.title}</p>
                                            <p className="text-xs text-muted-foreground">Updated: {formatDate(deal.updatedAt)}</p>
                                        </div>
                                        <div className="text-sm font-semibold">{formatCurrency(deal.value ?? 0)}</div>
                                        <div>
                                            <Badge variant="outline">{titleCase(deal.stage)}</Badge>
                                        </div>
                                        <div>
                                            <Badge variant={isClosed ? "secondary" : "outline"}>
                                                {isClosed ? "Closed" : "Open"}
                                            </Badge>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No deals found for this partner.</p>
                    )}
                </TabsContent>

                <TabsContent value="communications" className="border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">Communication Thread</h3>
                        <NewMessageDialog partnerId={id!} />
                    </div>
                    {partner.communications && partner.communications.length > 0 ? (
                        <div className="space-y-4">
                            {partner.communications.map(msg => (
                                <div key={msg.id} className="flex gap-4 border-b pb-4 last:border-0 hover:bg-muted/50 p-2 rounded-md transition-colors">
                                    <div className="bg-primary/10 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                                        {msg.sender.charAt(0)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium">{msg.sender}</h4>
                                            <span className="text-xs text-muted-foreground">{new Date(msg.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{msg.snippet}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No recent communications.</p>
                    )}
                </TabsContent>

                <TabsContent value="documents" className="border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">Shared Documents</h3>
                        <UploadDocumentDialog partnerId={id!} />
                    </div>
                    {partner.documents && partner.documents.length > 0 ? (
                        <div className="space-y-2">
                            {partner.documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-8 w-8 text-blue-500" />
                                        <div>
                                            <p className="font-medium text-sm">{doc.name}</p>
                                            <p className="text-xs text-muted-foreground">{doc.size} • Uploaded {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" asChild disabled={!doc.url}>
                                        <a href={doc.url ?? '#'} target="_blank" rel="noreferrer">
                                            <Download className="h-4 w-4" />
                                        </a>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No documents uploaded.</p>
                    )}
                </TabsContent>

                <TabsContent value="notes" className="border rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Internal Notes</h3>
                    <p className="text-muted-foreground">{partner.notes || "No internal notes."}</p>
                </TabsContent>
            </Tabs>
        </div>
    );
}
