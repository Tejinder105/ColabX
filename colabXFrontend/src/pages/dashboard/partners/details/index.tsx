import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Mail, ExternalLink, FileText, Download } from 'lucide-react';
import { mockPartners } from '@/lib/mock-partners';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PerformanceCharts } from './components/performance-charts';

export default function PartnerDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // In a real app, you would fetch the partner by ID.
    const partner = mockPartners.find(p => p.id === id) || mockPartners[0]; // fallback for demo

    const getUIStatusBadge = (uiStatus: string) => {
        switch (uiStatus) {
            case 'Green': return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Green</Badge>;
            case 'Yellow': return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">Yellow</Badge>;
            case 'Red': return <Badge variant="destructive">Red</Badge>;
            default: return <Badge variant="outline">{uiStatus}</Badge>;
        }
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
                        <Button variant="outline"><Mail className="mr-2 h-4 w-4" /> Message</Button>
                        <Button variant="outline"><ExternalLink className="mr-2 h-4 w-4" /> Website</Button>
                        <Button><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                    </div>
                </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview & Performance</TabsTrigger>
                    <TabsTrigger value="deals">Pipeline ({partner.openDealsCount})</TabsTrigger>
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

                        {/* OKRs */}
                        <div className="border rounded-lg p-6 space-y-4">
                            <h3 className="font-semibold text-lg">Current OKRs</h3>
                            {partner.okrs?.map((okr, idx) => (
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
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="deals" className="border rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Active Pipeline Deals</h3>
                    {partner.activeDeals.length > 0 ? (
                        <div className="space-y-4">
                            {partner.activeDeals.map(deal => (
                                <div key={deal.id} className="flex justify-between items-center border-b pb-4 last:border-0 hover:bg-muted/50 p-2 rounded-md transition-colors">
                                    <div>
                                        <h4 className="font-medium">{deal.name}</h4>
                                        <p className="text-sm text-muted-foreground">Expected Close: {deal.expectedCloseDate}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">${deal.amount.toLocaleString()}</p>
                                        <Badge variant="outline">{deal.stage}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">No active deals in pipeline.</p>
                    )}
                </TabsContent>

                <TabsContent value="communications" className="border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-lg">Communication Thread</h3>
                        <Button variant="outline" size="sm">New Message</Button>
                    </div>
                    {partner.communications?.length ? (
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
                                        <p className="text-sm font-medium">{msg.subject}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{msg.snippet}</p>
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
                        <Button variant="outline" size="sm">Upload Document</Button>
                    </div>
                    {partner.documents?.length ? (
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
                                    <Button variant="ghost" size="icon">
                                        <Download className="h-4 w-4" />
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
                    <p>{partner.notes || "No internal notes."}</p>
                </TabsContent>
            </Tabs>
        </div>
    );
}
