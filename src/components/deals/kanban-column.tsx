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
        <div className="flex flex-col h-full min-w-[300px] w-[300px] glass-card border-none rounded-xl p-2 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center justify-between p-3 mb-2 bg-white/5 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-tight">{stage.name}</h3>
                    <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                        {deals.length}
                    </span>
                </div>
                <div className="text-xs font-mono text-muted-foreground/80">
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
                    "flex-1 overflow-y-auto space-y-3 p-1 min-h-[100px] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent",
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
