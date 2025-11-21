import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Deal } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { CalendarIcon, Building2Icon } from 'lucide-react';

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
                className="opacity-30 bg-muted/50 border-2 border-dashed border-primary rounded-lg h-[150px]"
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
            className="cursor-grab active:cursor-grabbing"
        >
            <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="p-4 pb-2 space-y-1">
                    <CardTitle className="text-sm font-medium leading-none">
                        {deal.title}
                    </CardTitle>
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Building2Icon className="mr-1 h-3 w-3" />
                        <span className="truncate max-w-[150px]">
                            {deal.customer?.store_name || 'Unknown Customer'}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <div className="flex justify-between items-end">
                        <div className="text-lg font-bold text-primary">
                            {deal.value ? formatCurrency(deal.value) : '-'}
                        </div>
                        {deal.expected_close_date && (
                            <div className="flex items-center text-xs text-muted-foreground">
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
