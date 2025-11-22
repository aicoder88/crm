'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { InvoiceForm } from './invoice-form';

interface InvoiceDialogProps {
    onSuccess?: () => void;
}

export function InvoiceDialog({ onSuccess }: InvoiceDialogProps) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
        onSuccess?.();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                        Create a new invoice for a customer. Add line items, set pricing, and configure payment terms.
                    </DialogDescription>
                </DialogHeader>
                <InvoiceForm onSuccess={handleSuccess} onCancel={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}
