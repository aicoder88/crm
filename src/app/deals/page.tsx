'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { KanbanBoard } from '@/components/deals/kanban-board';
import { DealDialog } from '@/components/deals/deal-dialog';
import { useDeals, useDealStages } from '@/hooks/use-deals';
import { Deal } from '@/types';

export default function DealsPage() {
    const { stages, loading: stagesLoading } = useDealStages();
    const { deals, loading: dealsLoading, createDeal, updateDeal, deleteDeal } = useDeals();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | undefined>(undefined);

    const handleDealClick = (deal: Deal) => {
        setSelectedDeal(deal);
        setDialogOpen(true);
    };

    const handleSaveDeal = async (dealData: Partial<Deal>) => {
        if (selectedDeal) {
            await updateDeal(selectedDeal.id, dealData);
        } else {
            await createDeal(dealData);
        }
    };

    const handleDialogClose = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setSelectedDeal(undefined);
        }
    };

    if (stagesLoading || dealsLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="text-muted-foreground">Loading pipeline...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-down">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Sales Pipeline</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your deals and opportunities
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(120,50,255,0.5)] hover:shadow-[0_0_25px_rgba(120,50,255,0.7)] transition-all border-none">
                    <Plus className="mr-2 h-4 w-4" /> Add Deal
                </Button>
            </div>

            <KanbanBoard
                stages={stages}
                deals={deals}
                onDealUpdate={updateDeal}
                onDealClick={handleDealClick}
            />

            <DealDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                deal={selectedDeal}
                stages={stages}
                onSave={handleSaveDeal}
            />
        </div>
    );
}
