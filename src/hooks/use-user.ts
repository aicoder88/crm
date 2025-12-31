import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function getUser() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);
            } catch (error) {
                logger.error('Error fetching user', error instanceof Error ? error : new Error(String(error)));
            } finally {
                setLoading(false);
            }
        }

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const updateProfile = async (attributes: { data?: Record<string, unknown>; email?: string; password?: string }) => {
        const { data, error } = await supabase.auth.updateUser(attributes);
        if (error) throw error;
        if (data.user) setUser(data.user);
        return data;
    };

    return {
        user,
        loading,
        updateProfile,
    };
}
