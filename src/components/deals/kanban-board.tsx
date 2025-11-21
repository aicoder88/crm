'use client';

import { useState } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { Deal, DealStage } from '@/types';
import { KanbanColumn } from './kanban-column';
import { DealCard } from './deal-card';

interface KanbanBoardProps {
    stages: DealStage[];
    deals: Deal[];
    onDealUpdate: (id: string, updates: Partial<Deal>) => Promise<void>;
    onDealClick: (deal: Deal) => void;
}

export function KanbanBoard({ stages, deals, onDealUpdate, onDealClick }: KanbanBoardProps) {
    const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px of movement required to start drag
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const deal = active.data.current?.deal;
        if (deal) {
            setActiveDeal(deal);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDeal(null);

        if (!over) return;

        const dealId = active.id as string;
        const newStage = over.id as string;
        const deal = deals.find(d => d.id === dealId);

        if (deal && deal.stage !== newStage) {
            // Optimistically update the UI
            await onDealUpdate(dealId, { stage: newStage });
        }
    };

    const getDealsByStage = (stageName: string) => {
        return deals.filter(deal => deal.stage === stageName);
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-4 overflow-x-auto pb-4">
                {stages.map((stage) => (
                    <KanbanColumn
                        key={stage.id}
                        stage={stage}
                        deals={getDealsByStage(stage.name)}
                        onDealClick={onDealClick}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeDeal ? (
                    <div className="rotate-3 cursor-grabbing">
                        <DealCard deal={activeDeal} onClick={() => { }} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
