import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MonthlyTrendData, PartnerReportMetric } from '@/types/report';

interface PerformanceChartsProps {
    revenueData: MonthlyTrendData[];
    partnerData: PartnerReportMetric[];
}

export function PerformanceCharts({ revenueData, partnerData }: PerformanceChartsProps) {

    // Transform partner data for the bar chart
    const chartData = partnerData.map(p => ({
        name: p.partnerName,
        revenue: p.revenue,
        deals: p.dealsClosed
    }));

    return (
        <div className="space-y-6">
            {/* Revenue Trend Line Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Revenue Trend (YTD)</CardTitle>
                    <CardDescription>Monthly pipeline and closed deal revenue</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis
                                yAxisId="left"
                                tickFormatter={(value) => `$${value / 1000}k`}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    name === 'revenue' ? `$${value.toLocaleString()}` : value,
                                    name === 'revenue' ? 'Revenue' : 'Deals Closed'
                                ]}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="revenue" name="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line yAxisId="right" type="step" dataKey="deals" name="deals" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Partner Performance Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Revenue by Top Partners</CardTitle>
                    <CardDescription>Comparative revenue generated per partner</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis
                                tickFormatter={(value) => `$${value / 1000}k`}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
