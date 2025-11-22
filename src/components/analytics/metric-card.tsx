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
        <Card className={cn("glass-card border-none shadow-lg overflow-hidden relative group", className)}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {Icon && (
                    <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-4 w-4" />
                    </div>
                )}
            </CardHeader>
            <CardContent className="relative z-10">
                {loading ? (
                    <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                ) : (
                    <>
                        <div className={cn('text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent', valueClassName)}>{value}</div>
                        {change !== undefined && (
                            <div className="mt-1 flex items-center text-xs">
                                {isPositive && <ArrowUp className="mr-1 h-3 w-3 text-emerald-500" />}
                                {isNegative && <ArrowDown className="mr-1 h-3 w-3 text-rose-500" />}
                                {isNeutral && <Minus className="mr-1 h-3 w-3 text-gray-500" />}
                                <span
                                    className={cn(
                                        'font-medium',
                                        isPositive && 'text-emerald-500',
                                        isNegative && 'text-rose-500',
                                        isNeutral && 'text-gray-500'
                                    )}
                                >
                                    {change > 0 && '+'}
                                    {change.toFixed(1)}%
                                </span>
                                <span className="ml-1 text-muted-foreground/70">{changeLabel}</span>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
