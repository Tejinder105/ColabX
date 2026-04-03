import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import type { Partner } from "@/types/partner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Building2, Mail, Phone, Calendar, Target, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PartnerDrawerProps {
    partner: Partner | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PartnerDrawer({ partner, isOpen, onClose }: PartnerDrawerProps) {
    if (!partner) return null;

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'Good': return 'text-emerald-500';
            case 'Average': return 'text-amber-500';
            case 'Poor': return 'text-destructive';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
                <SheetHeader className="text-left mb-6">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-2xl font-bold">{partner.name}</SheetTitle>
                        <Badge variant="outline">{partner.type}</Badge>
                    </div>
                    <SheetDescription className="flex items-center gap-2 mt-2">
                        <span className={getHealthColor(partner.healthStatus)}>
                            {partner.healthStatus} Health ({partner.healthScore})
                        </span>
                        <span>•</span>
                        <span>{partner.stage}</span>
                        <span>•</span>
                        <span>Owned by {partner.ownerName}</span>
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-full pr-4 pb-20">
                    <div className="space-y-6">
                        {/* Overview Section */}
                        <div>
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground mb-3">
                                <Building2 className="h-4 w-4" />
                                Overview
                            </h3>
                            <p className="text-sm leading-relaxed">
                                {partner.overview || "No overview available for this partner."}
                            </p>
                            <div className="flex gap-2 mt-4 flex-wrap">
                                {partner.tags.map(tag => (
                                    <Badge variant="secondary" key={tag}>{tag}</Badge>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Contacts Section */}
                        <div>
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground mb-3">
                                <Mail className="h-4 w-4" />
                                Key Contacts
                            </h3>
                            {partner.contacts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No contacts listed.</p>
                            ) : (
                                <div className="space-y-4">
                                    {partner.contacts.map(contact => (
                                        <div key={contact.id} className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">{contact.name} - {contact.role}</span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-2">
                                                <Mail className="h-3 w-3" /> {contact.email}
                                            </span>
                                            {contact.phone && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <Phone className="h-3 w-3" /> {contact.phone}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Pipeline Section */}
                        <div>
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground mb-3">
                                <Target className="h-4 w-4" />
                                Active Pipeline
                            </h3>
                            {partner.activeDeals.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No active deals.</p>
                            ) : (
                                <div className="space-y-3">
                                    {partner.activeDeals.map(deal => (
                                        <div key={deal.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium">{deal.name}</span>
                                                <span className="text-xs text-muted-foreground">Expires: {format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-sm font-bold">${deal.amount.toLocaleString()}</span>
                                                <Badge variant="outline" className="text-[10px]">{deal.stage}</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Activities Section */}
                        <div>
                            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground mb-3">
                                <Calendar className="h-4 w-4" />
                                Recent Activity
                            </h3>
                            {partner.activities.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No recent activity.</p>
                            ) : (
                                <div className="space-y-4">
                                    {partner.activities.map(activity => (
                                        <div key={activity.id} className="flex gap-4">
                                            <div className="mt-0.5">
                                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium">{activity.type}</span>
                                                <span className="text-sm text-muted-foreground">{activity.description}</span>
                                                <span className="text-xs text-muted-foreground">{format(new Date(activity.date), "MMM d, yyyy 'at' h:mm a")}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {partner.notes && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Internal Notes</h3>
                                    <p className="text-sm p-3 bg-muted/50 rounded-md italic">
                                        "{partner.notes}"
                                    </p>
                                </div>
                            </>
                        )}

                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
