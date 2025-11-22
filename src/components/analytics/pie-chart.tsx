'use client';

import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PieChartProps {
    title?: string;
    description?: string;
    data: Array<{ name: string; value: number; color?: string }>;
    height?: number;
    loading?: boolean;
    innerRadius?: number; // For donut chart
}

const DEFAULT_COLORS = [
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
];

export function PieChart({ title, description, data, height = 300, loading, innerRadius = 0 }: PieChartProps) {
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

    const total = data.reduce((sum, item) => sum + item.value, 0);

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
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                            outerRadius={80}
                            innerRadius={innerRadius}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: number) => [
                                `${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`,
                                'Value'
                            ]}
                            contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                    </RechartsPieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
