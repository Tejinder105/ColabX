import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TeamObjective } from '@/types/team';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export function TeamObjectives({ objectives }: { objectives: TeamObjective[] }) {

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'On Track': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'At Risk': return <AlertCircle className="h-4 w-4 text-amber-500" />;
            case 'Behind': return <Clock className="h-4 w-4 text-destructive" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Team Objectives (OKRs)</h3>
            {objectives.length === 0 ? (
                <div className="text-center p-8 border rounded-md text-muted-foreground">
                    No objectives set for this team.
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {objectives.map((objective) => (
                        <Card key={objective.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-md font-medium">{objective.title}</CardTitle>
                                {getStatusIcon(objective.status)}
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="font-semibold">{objective.progress}%</span>
                                    </div>
                                    <Progress value={objective.progress} className="h-2" />
                                    <Badge variant="outline" className="mt-2 text-xs">
                                        Status: {objective.status}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
