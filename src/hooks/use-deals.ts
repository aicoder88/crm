import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Deal, DealStage } from '@/types';
import { toast } from 'sonner';

export function useDealStages() {
    const [stages, setStages] = useState<DealStage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStages();
    }, []);

    async function fetchStages() {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('deal_stages')
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            setStages(data || []);
        } catch (error) {
            console.error('Error fetching deal stages:', error);
            toast.error('Failed to load deal stages');
        } finally {
            setLoading(false);
        }
    }

    return { stages, loading };
}

export function useDeals(customerId?: string) {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeals();
    }, [customerId]);

    async function fetchDeals() {
        try {
            const supabase = createClient();
            let query = supabase
                .from('deals')
                .select('*, customer:customers(store_name)')
                .order('created_at', { ascending: false });

            if (customerId) {
                query = query.eq('customer_id', customerId);
            }

            const { data, error } = await query;

            if (error) throw error;
            setDeals(data || []);
        } catch (error) {
            console.error('Error fetching deals:', error);
            toast.error('Failed to load deals');
        } finally {
            setLoading(false);
        }
    }

    async function createDeal(deal: Partial<Deal>) {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('deals')
                .insert([deal])
                .select()
                .single();

            if (error) throw error;

            setDeals([data, ...deals]);
            toast.success('Deal created successfully');
            return data;
        } catch (error) {
            console.error('Error creating deal:', error);
            toast.error('Failed to create deal');
            throw error;
        }
    }

    async function updateDeal(id: string, updates: Partial<Deal>) {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('deals')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            setDeals(deals.map(d => d.id === id ? { ...d, ...data } : d));
            // Don't show toast for drag-and-drop updates to keep it smooth
            if (!updates.stage) {
                toast.success('Deal updated successfully');
            }
            return data;
        } catch (error) {
            console.error('Error updating deal:', error);
            toast.error('Failed to update deal');
            throw error;
        }
    }

    async function deleteDeal(id: string) {
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('deals')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setDeals(deals.filter(d => d.id !== id));
            toast.success('Deal deleted successfully');
        } catch (error) {
            console.error('Error deleting deal:', error);
            toast.error('Failed to delete deal');
            throw error;
        }
    }

    return {
        deals,
        loading,
        createDeal,
        updateDeal,
        deleteDeal,
        refreshDeals: fetchDeals
    };
}
