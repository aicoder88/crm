'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Invoice, InvoiceItem } from '@/types';

interface InvoiceFilters {
    customer_id?: string;
    status?: Invoice['status'];
    date_from?: string;
    date_to?: string;
}

export function useInvoices(filters?: InvoiceFilters) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const supabase = createClient();

    useEffect(() => {
        fetchInvoices();
    }, [filters]);

    async function fetchInvoices() {
        try {
            setLoading(true);
            let query = supabase
                .from('invoices')
                .select(`
                    *,
                    customer:customers(store_name, email)
                `)
                .order('created_at', { ascending: false });

            // Apply filters
            if (filters?.customer_id) {
                query = query.eq('customer_id', filters.customer_id);
            }
            if (filters?.status) {
                query = query.eq('status', filters.status);
            }
            if (filters?.date_from) {
                query = query.gte('created_at', filters.date_from);
            }
            if (filters?.date_to) {
                query = query.lte('created_at', filters.date_to);
            }

            const { data, error } = await query;

            if (error) throw error;
            setInvoices(data || []);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }

    return {
        invoices,
        loading,
        error,
        refresh: fetchInvoices,
    };
}

export function useInvoice(id: string | null) {
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (!id) {
            setInvoice(null);
            setLoading(false);
            return;
        }

        fetchInvoice();
    }, [id]);

    async function fetchInvoice() {
        if (!id) return;

        try {
            setLoading(true);

            // Fetch invoice with customer and items
            const { data: invoiceData, error: invoiceError } = await supabase
                .from('invoices')
                .select(`
                    *,
                    customer:customers(store_name, email)
                `)
                .eq('id', id)
                .single();

            if (invoiceError) throw invoiceError;

            // Fetch invoice items with products
            const { data: itemsData, error: itemsError } = await supabase
                .from('invoice_items')
                .select(`
                    *,
                    product:products(*)
                `)
                .eq('invoice_id', id);

            if (itemsError) throw itemsError;

            setInvoice({
                ...invoiceData,
                items: itemsData || [],
            });
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }

    async function createInvoice(
        invoice: Omit<Invoice, 'id' | 'created_at' | 'invoice_number'>,
        items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]
    ) {
        try {
            // Generate invoice number
            const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
                .rpc('generate_invoice_number');

            if (invoiceNumberError) throw invoiceNumberError;

            // Create invoice
            const { data: invoiceData, error: invoiceError } = await supabase
                .from('invoices')
                .insert([{
                    ...invoice,
                    invoice_number: invoiceNumberData,
                }])
                .select()
                .single();

            if (invoiceError) throw invoiceError;

            // Create invoice items
            const itemsWithInvoiceId = items.map(item => ({
                ...item,
                invoice_id: invoiceData.id,
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(itemsWithInvoiceId);

            if (itemsError) throw itemsError;

            return invoiceData;
        } catch (err) {
            throw err;
        }
    }

    async function updateInvoice(id: string, updates: Partial<Invoice>) {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            await fetchInvoice();
            return data;
        } catch (err) {
            throw err;
        }
    }

    async function deleteInvoice(id: string) {
        try {
            // Only allow deleting draft invoices
            const { error } = await supabase
                .from('invoices')
                .delete()
                .eq('id', id)
                .eq('status', 'draft');

            if (error) throw error;
        } catch (err) {
            throw err;
        }
    }

    async function sendInvoice(id: string) {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .update({
                    status: 'sent',
                    sent_date: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            await fetchInvoice();
            return data;
        } catch (err) {
            throw err;
        }
    }

    async function markInvoicePaid(id: string) {
        try {
            const { data, error } = await supabase
                .from('invoices')
                .update({
                    status: 'paid',
                    paid_date: new Date().toISOString(),
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            await fetchInvoice();
            return data;
        } catch (err) {
            throw err;
        }
    }

    return {
        invoice,
        loading,
        error,
        createInvoice,
        updateInvoice,
        deleteInvoice,
        sendInvoice,
        markInvoicePaid,
        refresh: fetchInvoice,
    };
}
