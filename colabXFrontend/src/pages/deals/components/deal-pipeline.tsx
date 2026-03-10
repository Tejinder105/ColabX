import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CircleDashed, FileText, Handshake, CheckCircle2, XCircle } from 'lucide-react';
import type { PipelineSummary } from '@/types/deal';

export function DealPipeline({ summary }: { summary: PipelineSummary }) {
    const total = summary.leadCount + summary.proposalCount + summary.negotiationCount + summary.wonCount + summary.lostCount;

    const stages = [
        { label: 'Lead', count: summary.leadCount, icon: CircleDashed, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Proposal', count: summary.proposalCount, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { label: 'Negotiation', count: summary.negotiationCount, icon: Handshake, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Won', count: summary.wonCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Lost', count: summary.lostCount, icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', hideArrow: true }
    ];

    return (
        <div className="py-2">
            <h3 className="text-lg font-semibold mb-4">Pipeline Overview <span className="text-muted-foreground text-sm font-normal">({total} total deals)</span></h3>

            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
                {stages.map((stage) => (
                    <div key={stage.label} className="w-full flex items-center group">
                        <Card className={`flex-1 transition-all ${stage.bg} border-transparent group-hover:border-border/50`}>
                            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                <div className={`p-2 rounded-full bg-background/50 mb-2 ${stage.color}`}>
                                    <stage.icon className="w-5 h-5" />
                                </div>
                                <div className="text-2xl font-bold">{stage.count}</div>
                                <div className="text-sm text-foreground/80 font-medium">{stage.label}</div>
                            </CardContent>
                        </Card>
                        {!stage.hideArrow && (
                            <ArrowRight className="hidden md:block w-5 h-5 text-muted-foreground/30 mx-2 flex-shrink-0" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
