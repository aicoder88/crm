'use client';

import { useState, useEffect, useCallback } from 'react';
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

    const fetchInvoices = useCallback(async () => {
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
    }, [filters]);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

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

    const fetchInvoice = useCallback(async () => {
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
    }, [id]);

    useEffect(() => {
        if (!id) {
            setInvoice(null);
            setLoading(false);
            return;
        }

        fetchInvoice();
    }, [id, fetchInvoice]);

    async function createInvoice(
        invoice: Omit<Invoice, 'id' | 'created_at' | 'invoice_number'>,
        items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[]
    ) {
        try {
            // Generate invoice number
            const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
                .rpc('generate_invoice_number');

            if (invoiceNumberError) throw invoiceNumberError;

            // Prepare invoice data for the atomic function
            const invoiceData = {
                ...invoice,
                invoice_number: invoiceNumberData,
            };

            // Use atomic RPC function to create invoice with items
            const { data: invoiceId, error } = await supabase
                .rpc('create_invoice_with_items', {
                    p_invoice: invoiceData,
                    p_items: items,
                });

            if (error) throw error;

            // Fetch the created invoice with full details
            const { data: createdInvoice, error: fetchError } = await supabase
                .from('invoices')
                .select(`
                    *,
                    customer:customers(store_name, email),
                    items:invoice_items(*)
                `)
                .eq('id', invoiceId)
                .single();

            if (fetchError) throw fetchError;

            return createdInvoice;
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
