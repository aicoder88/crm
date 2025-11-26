import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface CompanySettings {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
    province: string | null;
    postal_code: string | null;
    country: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    logo_url: string | null;
    currency: string;
    tax_rate: number;
}

export function useCompanySettings() {
    const [settings, setSettings] = useState<CompanySettings | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            const { data, error } = await supabase
                .from('company_settings')
                .select('*')
                .single();

            if (error) {
                // If no settings found, we might need to create one or it's just empty
                if (error.code === 'PGRST116') {
                    // No rows found
                    setSettings(null);
                } else {
                    logger.error('Error fetching company settings', error instanceof Error ? error : new Error(String(error)));
                }
            } else {
                setSettings(data);
            }
        } catch (error) {
            logger.error('Error in fetchSettings', error instanceof Error ? error : new Error(String(error)));
        } finally {
            setLoading(false);
        }
    }

    async function updateSettings(newSettings: Partial<CompanySettings>) {
        try {
            if (settings?.id) {
                const { data, error } = await supabase
                    .from('company_settings')
                    .update(newSettings)
                    .eq('id', settings.id)
                    .select()
                    .single();

                if (error) throw error;
                setSettings(data);
                toast.success('Company settings updated');
            } else {
                // Create new
                const { data, error } = await supabase
                    .from('company_settings')
                    .insert([newSettings])
                    .select()
                    .single();

                if (error) throw error;
                setSettings(data);
                toast.success('Company settings created');
            }
        } catch (error) {
            logger.error('Error updating settings', error instanceof Error ? error : new Error(String(error)));
            toast.error('Failed to update settings');
            throw error;
        }
    }

    return {
        settings,
        loading,
        updateSettings,
        refresh: fetchSettings
    };
}
