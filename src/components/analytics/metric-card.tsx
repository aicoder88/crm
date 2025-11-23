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
        <Card className={cn(
            "glass-card relative group overflow-hidden",
            "hover:scale-[1.02] transition-all duration-300",
            className
        )}>
            {/* Animated gradient background */}
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-blue-500/5 opacity-30 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Glow effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent blur-xl" />
            </div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground/90 group-hover:text-muted-foreground transition-colors">
                    {title}
                </CardTitle>
                {Icon && (
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/10 text-primary group-hover:from-primary/30 group-hover:to-purple-500/20 transition-all duration-300 shadow-lg shadow-primary/10">
                        <Icon className="h-5 w-5" />
                    </div>
                )}
            </CardHeader>
            <CardContent className="relative z-10">
                {loading ? (
                    <div className="flex items-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                ) : (
                    <>
                        <div className={cn(
                            'text-3xl font-bold bg-gradient-to-br from-white via-white/95 to-white/80 bg-clip-text text-transparent',
                            'group-hover:from-primary group-hover:via-purple-400 group-hover:to-pink-400 transition-all duration-500',
                            valueClassName
                        )}>
                            {value}
                        </div>
                        {change !== undefined && (
                            <div className="mt-2 flex items-center text-xs">
                                {isPositive && <ArrowUp className="mr-1 h-3.5 w-3.5 text-emerald-400" />}
                                {isNegative && <ArrowDown className="mr-1 h-3.5 w-3.5 text-rose-400" />}
                                {isNeutral && <Minus className="mr-1 h-3.5 w-3.5 text-gray-400" />}
                                <span
                                    className={cn(
                                        'font-semibold',
                                        isPositive && 'text-emerald-400',
                                        isNegative && 'text-rose-400',
                                        isNeutral && 'text-gray-400'
                                    )}
                                >
                                    {change > 0 && '+'}
                                    {change.toFixed(1)}%
                                </span>
                                <span className="ml-1.5 text-muted-foreground/60">{changeLabel}</span>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
