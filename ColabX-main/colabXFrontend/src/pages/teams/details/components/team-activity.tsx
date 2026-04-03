import type { TeamActivity as TeamActivityType } from '@/types/team';

export function TeamActivity({ activities }: { activities: TeamActivityType[] }) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <div className="border rounded-md p-4">
                {activities.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        No recent activity.
                    </div>
                ) : (
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {activities.map((activity) => (
                            <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-emerald-500 text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                    <div className="h-2 w-2 rounded-full bg-current" />
                                </div>
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border shadow-sm">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-bold text-slate-900">{activity.user}</div>
                                        <time className="text-xs font-medium text-emerald-500">{activity.timestamp}</time>
                                    </div>
                                    <div className="text-slate-500">{activity.action}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
