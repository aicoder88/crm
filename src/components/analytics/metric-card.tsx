import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus, Loader2, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: LucideIcon;
    loading?: boolean;
    className?: string;
    valueClassName?: string;
}

export function MetricCard({
    title,
    value,
    change,
    changeLabel = 'vs last period',
    icon: Icon,
    loading,
    className,
    valueClassName
}: MetricCardProps) {
    const isPositive = change !== undefined && change > 0;
    const isNegative = change !== undefined && change < 0;
    const isNeutral = change !== undefined && change === 0;

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                ) : (
                    <>
                        <div className={cn('text-2xl font-bold', valueClassName)}>{value}</div>
                        {change !== undefined && (
                            <div className="mt-1 flex items-center text-xs">
                                {isPositive && <ArrowUp className="mr-1 h-3 w-3 text-green-600" />}
                                {isNegative && <ArrowDown className="mr-1 h-3 w-3 text-red-600" />}
                                {isNeutral && <Minus className="mr-1 h-3 w-3 text-gray-600" />}
                                <span
                                    className={cn(
                                        'font-medium',
                                        isPositive && 'text-green-600',
                                        isNegative && 'text-red-600',
                                        isNeutral && 'text-gray-600'
                                    )}
                                >
                                    {change > 0 && '+'}
                                    {change.toFixed(1)}%
                                </span>
                                <span className="ml-1 text-muted-foreground">{changeLabel}</span>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
