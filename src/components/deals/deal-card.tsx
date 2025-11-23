import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Deal } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { CalendarIcon, Building2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealCardProps {
    deal: Deal;
    onClick: (deal: Deal) => void;
}

export function DealCard({ deal, onClick }: DealCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: deal.id,
        data: {
            type: 'Deal',
            deal,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 bg-primary/20 border-2 border-dashed border-primary rounded-xl h-[150px] backdrop-blur-sm"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => onClick(deal)}
            className="cursor-grab active:cursor-grabbing group perspective-1000"
        >
            <Card className="glass border-white/5 shadow-sm hover:shadow-[0_0_20px_rgba(120,50,255,0.2)] transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10">
                <CardHeader className="p-4 pb-2 space-y-1">
                    <CardTitle className="text-sm font-medium leading-none text-foreground/90 group-hover:text-primary transition-colors">
                        {deal.title}
                    </CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground group-hover:text-muted-foreground/80">
                        <Building2Icon className="mr-1 h-3 w-3" />
                        <span className="truncate max-w-[150px]">
                            {deal.customer?.store_name || 'Unknown Customer'}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <div className="flex justify-between items-end">
                        <div className="text-lg font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            {deal.value ? formatCurrency(deal.value) : '-'}
                        </div>
                        {deal.expected_close_date && (
                            <div className="flex items-center text-xs text-muted-foreground/70 bg-white/5 px-2 py-1 rounded-md">
                                <CalendarIcon className="mr-1 h-3 w-3" />
                                {new Date(deal.expected_close_date).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
