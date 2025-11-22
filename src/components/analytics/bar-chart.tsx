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
            <Card>
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
            <Card>
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
        <Card>
            {title && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
            )}
            <CardContent>
                <ResponsiveContainer width="100%" height={height}>
                    <RechartsBarChart data={data} layout={layout}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        {layout === 'horizontal' ? (
                            <>
                                <XAxis dataKey={xKey} className="text-xs" />
                                <YAxis className="text-xs" />
                            </>
                        ) : (
                            <>
                                <XAxis type="number" className="text-xs" />
                                <YAxis dataKey={xKey} type="category" className="text-xs" />
                            </>
                        )}
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        {bars.map((bar) => (
                            <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.fill} name={bar.name} radius={[4, 4, 0, 0]} />
                        ))}
                    </RechartsBarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
