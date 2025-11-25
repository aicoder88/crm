import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Customer } from '@/types';
import { toast } from 'sonner';

export function useCustomers() {
    const [customers, setCustomers] = useState<Pick<Customer, 'id' | 'store_name'>[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    async function fetchCustomers() {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('customers')
                .select('id, store_name')
                .order('store_name');

            if (error) throw error;
            setCustomers(data || []);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    }

    return { customers, loading };
}
