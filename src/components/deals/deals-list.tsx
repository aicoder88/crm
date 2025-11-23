'use client';

import { useState } from 'react';
import { useDeals, useDealStages } from '@/hooks/use-deals';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CalendarIcon, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { DealDialog } from './deal-dialog';
import { Deal } from '@/types';

interface DealsListProps {
    customerId: string;
}

export function DealsList({ customerId }: DealsListProps) {
    const { deals, loading, createDeal, updateDeal } = useDeals(customerId);
    const { stages } = useDealStages();
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
            await createDeal({ ...dealData, customer_id: customerId });
        }
    };

    const handleDialogClose = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setSelectedDeal(undefined);
        }
    };

    if (loading) {
        return <div className="text-sm text-muted-foreground">Loading deals...</div>;
    }

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                    {deals.length} {deals.length === 1 ? 'deal' : 'deals'}
                </p>
                <Button size="sm" onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-1 h-3 w-3" /> Add Deal
                </Button>
            </div>

            {deals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deals yet</p>
            ) : (
                <div className="space-y-2">
                    {deals.map((deal) => (
                        <Card
                            key={deal.id}
                            className="cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => handleDealClick(deal)}
                        >
                            <CardContent className="p-3">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium text-sm">{deal.title}</div>
                                    <div className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                        {deal.stage}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    {deal.value && (
                                        <div className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            {formatCurrency(deal.value)}
                                        </div>
                                    )}
                                    {deal.expected_close_date && (
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="h-3 w-3" />
                                            {new Date(deal.expected_close_date).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <DealDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                deal={selectedDeal}
                stages={stages}
                onSave={handleSaveDeal}
                defaultCustomerId={customerId}
            />
        </div>
    );
}
