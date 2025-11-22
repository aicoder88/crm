'use client';

import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface LineChartProps {
    title?: string;
    description?: string;
    data: any[];
    xKey: string;
    lines: Array<{
        dataKey: string;
        stroke: string;
        name: string;
    }>;
    height?: number;
    loading?: boolean;
}

export function LineChart({ title, description, data, xKey, lines, height = 300, loading }: LineChartProps) {
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
                    <RechartsLineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey={xKey} className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        {lines.map((line) => (
                            <Line
                                key={line.dataKey}
                                type="monotone"
                                dataKey={line.dataKey}
                                stroke={line.stroke}
                                name={line.name}
                                strokeWidth={2}
                            />
                        ))}
                    </RechartsLineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
