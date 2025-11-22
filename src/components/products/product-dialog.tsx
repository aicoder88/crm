'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Product } from '@/types';
import { ProductForm } from './product-form';

interface ProductDialogProps {
    product?: Product;
    trigger: React.ReactNode;
    onSuccess?: () => void;
}

export function ProductDialog({ product, trigger, onSuccess }: ProductDialogProps) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
        onSuccess?.();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {product ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                </DialogHeader>
                <ProductForm
                    product={product}
                    onSuccess={handleSuccess}
                    onCancel={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
