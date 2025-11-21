import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Deal, DealStage } from '@/types';
import { DealCard } from './deal-card';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
    stage: DealStage;
    deals: Deal[];
    onDealClick: (deal: Deal) => void;
}

export function KanbanColumn({ stage, deals, onDealClick }: KanbanColumnProps) {
    const { setNodeRef } = useDroppable({
        id: stage.name,
        data: {
            type: 'Column',
            stage,
        },
    });

    const totalValue = deals.reduce((sum, deal) => sum + (deal.value || 0), 0);

    return (
        <div className="flex flex-col h-full min-w-[300px] w-[300px] bg-muted/30 rounded-lg border p-2">
            <div className="flex items-center justify-between p-2 mb-2">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{stage.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">
                        {deals.length}
                    </span>
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                    {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        notation: 'compact',
                        maximumFractionDigits: 1,
                    }).format(totalValue)}
                </div>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 overflow-y-auto space-y-3 p-1 min-h-[100px]",
                    // Add visual cue when dragging over
                )}
            >
                <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
                    {deals.map((deal) => (
                        <DealCard
                            key={deal.id}
                            deal={deal}
                            onClick={onDealClick}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
