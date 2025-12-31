'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import type { Product } from '@/types';
import { Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';

const formSchema = z.object({
    sku: z.string().min(1, 'SKU is required'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    unit_price: z.coerce.number().min(0, 'Price must be positive'),
    currency: z.string().default('CAD'),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
    product?: Product;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            sku: product?.sku || '',
            name: product?.name || '',
            description: product?.description || '',
            unit_price: product?.unit_price || 0,
            currency: product?.currency || 'CAD',
        },
    });

    async function onSubmit(values: FormValues) {
        setLoading(true);
        try {
            if (product) {
                // Update existing product
                const { error } = await supabase
                    .from('products')
                    .update(values)
                    .eq('id', product.id);

                if (error) throw error;
            } else {
                // Create new product
                const { error } = await supabase
                    .from('products')
                    .insert([values]);

                if (error) throw error;
            }

            onSuccess?.();
        } catch (error) {
            logger.error('Error saving product', error instanceof Error ? error : new Error(String(error)), {
                productId: product?.id,
                operation: product ? 'update' : 'create'
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                                <Input placeholder="PURR-10LB" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Purrify Odor Control - 10lb" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Premium cat litter odor eliminator"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="unit_price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unit Price (CAD)</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="29.99" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {product ? 'Update Product' : 'Create Product'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
