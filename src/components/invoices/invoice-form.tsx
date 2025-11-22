'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Customer, Product } from '@/types';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getProvincialTaxRate, generateInvoiceNumber } from '@/lib/invoice-utils';
import { toast } from 'sonner';

interface InvoiceFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

interface InvoiceFormData {
    customer_id: string;
    items: Array<{
        product_sku: string | null;
        description: string;
        quantity: number;
        unit_price: number;
    }>;
    shipping: number;
    discount: number;
    due_date: string;
    notes: string;
    status: 'draft' | 'sent';
}

export function InvoiceForm({ onSuccess, onCancel }: InvoiceFormProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const { register, control, watch, setValue, handleSubmit, formState: { errors } } = useForm<InvoiceFormData>({
        defaultValues: {
            customer_id: '',
            items: [{ product_sku: null, description: '', quantity: 1, unit_price: 0 }],
            shipping: 0,
            discount: 0,
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: '',
            status: 'draft'
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const watchItems = watch('items');
    const watchShipping = watch('shipping');
    const watchDiscount = watch('discount');

    // Calculate totals
    const subtotal = watchItems.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
    }, 0);

    const taxRate = selectedCustomer?.province ? getProvincialTaxRate(selectedCustomer.province) : 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax + (watchShipping || 0) - (watchDiscount || 0);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const supabase = createClient();

            const [customersResult, productsResult] = await Promise.all([
                supabase.from('customers').select('*').order('store_name'),
                supabase.from('products').select('*').eq('active', true).order('name')
            ]);

            if (customersResult.error) throw customersResult.error;
            if (productsResult.error) throw productsResult.error;

            setCustomers(customersResult.data || []);
            setProducts(productsResult.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load customers and products');
        } finally {
            setLoading(false);
        }
    }

    const onSubmit = async (data: InvoiceFormData) => {
        try {
            setSubmitting(true);
            const supabase = createClient();

            // Generate invoice number
            const invoiceNumber = await generateInvoiceNumber();

            // Calculate order number (simple sequential)
            const orderNumber = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

            // Create invoice
            const { data: invoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert({
                    customer_id: data.customer_id,
                    invoice_number: invoiceNumber,
                    order_number: orderNumber,
                    subtotal,
                    tax,
                    shipping: data.shipping,
                    discount: data.discount,
                    total,
                    amount: total, // Legacy field
                    currency: 'CAD',
                    status: data.status,
                    due_date: data.due_date,
                    notes: data.notes,
                    stripe_invoice_id: 'manual-' + invoiceNumber // Placeholder
                })
                .select()
                .single();

            if (invoiceError) throw invoiceError;

            // Create invoice items
            const items = data.items.map(item => ({
                invoice_id: invoice.id,
                product_sku: item.product_sku,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                total: item.quantity * item.unit_price
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(items);

            if (itemsError) throw itemsError;

            toast.success('Invoice created successfully');
            onSuccess?.();
        } catch (error) {
            console.error('Error creating invoice:', error);
            toast.error('Failed to create invoice');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Selection */}
            <div className="space-y-2">
                <Label htmlFor="customer_id">Customer *</Label>
                <Select
                    value={watch('customer_id')}
                    onValueChange={(value) => {
                        setValue('customer_id', value);
                        const customer = customers.find(c => c.id === value);
                        setSelectedCustomer(customer || null);
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                        {customers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>
                                {customer.store_name} {customer.city && `(${customer.city})`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.customer_id && (
                    <p className="text-sm text-red-600">Customer is required</p>
                )}
            </div>

            {/* Line Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Line Items *</Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ product_sku: null, description: '', quantity: 1, unit_price: 0 })}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                </div>

                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start border p-3 rounded-md">
                        <div className="col-span-3">
                            <Label className="text-xs">Product</Label>
                            <Select
                                value={watchItems[index]?.product_sku || ''}
                                onValueChange={(value) => {
                                    const product = products.find(p => p.sku === value);
                                    if (product) {
                                        setValue(`items.${index}.product_sku`, product.sku);
                                        setValue(`items.${index}.description`, product.name);
                                        setValue(`items.${index}.unit_price`, product.unit_price);
                                    }
                                }}
                            >
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                    {products.map(product => (
                                        <SelectItem key={product.sku} value={product.sku}>
                                            {product.sku} - {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-4">
                            <Label className="text-xs">Description</Label>
                            <Input
                                {...register(`items.${index}.description`, { required: true })}
                                placeholder="Item description"
                                className="h-9"
                            />
                        </div>

                        <div className="col-span-2">
                            <Label className="text-xs">Quantity</Label>
                            <Input
                                type="number"
                                {...register(`items.${index}.quantity`, { required: true, min: 1, valueAsNumber: true })}
                                className="h-9"
                            />
                        </div>

                        <div className="col-span-2">
                            <Label className="text-xs">Unit Price</Label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register(`items.${index}.unit_price`, { required: true, min: 0, valueAsNumber: true })}
                                className="h-9"
                            />
                        </div>

                        <div className="col-span-1 flex items-end">
                            {fields.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => remove(index)}
                                    className="h-9"
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="shipping">Shipping</Label>
                        <Input
                            id="shipping"
                            type="number"
                            step="0.01"
                            {...register('shipping', { valueAsNumber: true })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="discount">Discount</Label>
                        <Input
                            id="discount"
                            type="number"
                            step="0.01"
                            {...register('discount', { valueAsNumber: true })}
                        />
                    </div>
                </div>

                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tax ({taxRate}%):</span>
                        <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span className="font-medium">${(watchShipping || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Discount:</span>
                        <span className="font-medium text-red-600">-${(watchDiscount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                        id="due_date"
                        type="date"
                        {...register('due_date')}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={watch('status')} onValueChange={(value: any) => setValue('status', value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    {...register('notes')}
                    rows={3}
                    placeholder="Additional notes..."
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        'Create Invoice'
                    )}
                </Button>
            </div>
        </form>
    );
}
