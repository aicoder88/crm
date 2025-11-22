import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EmailTemplate, EmailCampaign } from '@/types/email-types';

/**
 * Hook for managing email templates
 */
export function useEmailTemplates() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const supabase = createClient();

    const fetchTemplates = async (activeOnly = true) => {
        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('email_templates')
                .select('*')
                .order('created_at', { ascending: false });

            if (activeOnly) {
                query = query.eq('active', true);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            return data as EmailTemplate[];
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getTemplate = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('email_templates')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;
            return data as EmailTemplate;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at'>) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from('email_templates')
                .insert([template])
                .select()
                .single();

            if (insertError) throw insertError;
            return data as EmailTemplate;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateTemplate = async (id: string, updates: Partial<EmailTemplate>) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: updateError } = await supabase
                .from('email_templates')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;
            return data as EmailTemplate;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteTemplate = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('email_templates')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        fetchTemplates,
        getTemplate,
        createTemplate,
        updateTemplate,
        deleteTemplate,
    };
}

/**
 * Hook for managing email campaigns
 */
export function useEmailCampaigns() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const supabase = createClient();

    const fetchCampaigns = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('email_campaigns')
                .select(`
          *,
          template:email_templates(*)
        `)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            return data as EmailCampaign[];
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getCampaign = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('email_campaigns')
                .select(`
          *,
          template:email_templates(*),
          recipients:campaign_recipients(*)
        `)
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;
            return data;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createCampaign = async (campaign: Omit<EmailCampaign, 'id' | 'created_at' | 'recipient_count' | 'opened_count' | 'clicked_count' | 'bounced_count'>) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from('email_campaigns')
                .insert([campaign])
                .select()
                .single();

            if (insertError) throw insertError;
            return data as EmailCampaign;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateCampaign = async (id: string, updates: Partial<EmailCampaign>) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: updateError } = await supabase
                .from('email_campaigns')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;
            return data as EmailCampaign;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteCampaign = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('email_campaigns')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        fetchCampaigns,
        getCampaign,
        createCampaign,
        updateCampaign,
        deleteCampaign,
    };
}

/**
 * Hook for fetching customer email timeline
 */
export function useCustomerEmails(customerId: string) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const supabase = createClient();

    const fetchEmails = async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('customer_timeline')
                .select('*')
                .eq('customer_id', customerId)
                .eq('type', 'email')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            return data;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        fetchEmails,
    };
}

/**
 * Hook for sending emails
 */
export function useSendEmail() {
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const sendEmail = async (emailData: {
        customerId: string;
        templateId?: string;
        to: string;
        subject: string;
        body: string;
        context?: Record<string, string>;
    }) => {
        setSending(true);
        setError(null);

        try {
            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send email');
            }

            const data = await response.json();
            return data;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setSending(false);
        }
    };

    return {
        sending,
        error,
        sendEmail,
    };
}
