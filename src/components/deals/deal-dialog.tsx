import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Deal, DealStage } from '@/types';
import { useCustomers } from '@/hooks/use-customers';
import { CustomerCombobox } from '@/components/ui/customer-combobox';

interface DealDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deal?: Deal;
    stages: DealStage[];
    onSave: (deal: Partial<Deal>) => Promise<void>;
    defaultCustomerId?: string;
}

export function DealDialog({ open, onOpenChange, deal, stages, onSave, defaultCustomerId }: DealDialogProps) {
    const { customers } = useCustomers();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Deal>>({
        title: '',
        value: 0,
        stage: stages[0]?.name || '',
        customer_id: defaultCustomerId || '',
        expected_close_date: '',
        notes: '',
    });

    useEffect(() => {
        if (deal) {
            setFormData({
                title: deal.title,
                value: deal.value,
                stage: deal.stage,
                customer_id: deal.customer_id,
                expected_close_date: deal.expected_close_date ? new Date(deal.expected_close_date).toISOString().split('T')[0] : '',
                notes: deal.notes,
            });
        } else {
            setFormData({
                title: '',
                value: 0,
                stage: stages[0]?.name || '',
                customer_id: defaultCustomerId || '',
                expected_close_date: '',
                notes: '',
            });
        }
    }, [deal, stages, open, defaultCustomerId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onOpenChange(false);
        } catch (error) {
            // Error handling is done in the parent
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{deal ? 'Edit Deal' : 'Create Deal'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Deal Title</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customer">Customer</Label>
                        <CustomerCombobox
                            customers={customers}
                            value={formData.customer_id}
                            onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                            placeholder="Select customer"
                            disabled={!!deal}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="value">Value ($)</Label>
                            <Input
                                id="value"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.value || ''}
                                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stage">Stage</Label>
                            <Select
                                value={formData.stage}
                                onValueChange={(value) => setFormData({ ...formData, stage: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stages.map((stage) => (
                                        <SelectItem key={stage.id} value={stage.name}>
                                            {stage.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Expected Close Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.expected_close_date || ''}
                            onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Deal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
