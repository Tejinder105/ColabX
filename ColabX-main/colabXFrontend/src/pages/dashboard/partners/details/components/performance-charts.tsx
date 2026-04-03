import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import type { Partner } from '@/types/partner';

export function PerformanceCharts({ partner }: { partner: Partner }) {
    if (!partner.performanceHistory?.length) {
        return (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
                No performance data available for this partner.
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full">
            <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Performance Score Over Time</h4>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={partner.performanceHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                            <Tooltip />
                            <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-medium text-sm text-muted-foreground">Deals & Revenue Contribution</h4>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={partner.revenueHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `$${ val / 1000 } k`} />
                            <Tooltip formatter={(val: number) => `$${ val.toLocaleString() } `} />
                            <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
