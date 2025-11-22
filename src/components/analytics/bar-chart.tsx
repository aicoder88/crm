'use client';

import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BarChartProps {
    title?: string;
    description?: string;
    data: any[];
    xKey: string;
    bars: Array<{
        dataKey: string;
        fill: string;
        name: string;
    }>;
    height?: number;
    loading?: boolean;
    layout?: 'horizontal' | 'vertical';
}

export function BarChart({
    title,
    description,
    data,
    xKey,
    bars,
    height = 300,
    loading,
    layout = 'horizontal'
}: BarChartProps) {
    if (loading) {
        return (
            <Card className="glass-card border-none">
                {title && (
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </CardHeader>
                )}
                <CardContent>
                    <div className="flex h-[300px] items-center justify-center">
                        <p className="text-sm text-muted-foreground">Loading chart...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Card className="glass-card border-none">
                {title && (
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        {description && <CardDescription>{description}</CardDescription>}
                    </CardHeader>
                )}
                <CardContent>
                    <div className="flex h-[300px] items-center justify-center">
                        <p className="text-sm text-muted-foreground">No data available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass-card group hover:scale-[1.01] transition-all duration-300">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent blur-2xl" />
            </div>
            {title && (
                <CardHeader className="relative z-10">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                        {title}
                    </CardTitle>
                    {description && <CardDescription className="text-muted-foreground/70">{description}</CardDescription>}
                </CardHeader>
            )}
            <CardContent className="relative z-10">
                <ResponsiveContainer width="100%" height={height}>
                    <RechartsBarChart data={data} layout={layout}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-white/10" vertical={false} />
                        {layout === 'horizontal' ? (
                            <>
                                <XAxis
                                    dataKey={xKey}
                                    className="text-xs text-muted-foreground"
                                    tick={{ fill: 'currentColor', opacity: 0.7 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    className="text-xs text-muted-foreground"
                                    tick={{ fill: 'currentColor', opacity: 0.7 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                            </>
                        ) : (
                            <>
                                <XAxis type="number" className="text-xs" hide />
                                <YAxis
                                    dataKey={xKey}
                                    type="category"
                                    className="text-xs text-muted-foreground"
                                    tick={{ fill: 'currentColor', opacity: 0.7 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={100}
                                />
                            </>
                        )}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(20, 20, 30, 0.8)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                                color: '#fff'
                            }}
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        />
                        <Legend />
                        {bars.map((bar, index) => (
                            <Bar
                                key={bar.dataKey}
                                dataKey={bar.dataKey}
                                fill={bar.fill}
                                name={bar.name}
                                radius={[4, 4, 4, 4]}
                                animationDuration={1500}
                            />
                        ))}
                    </RechartsBarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
