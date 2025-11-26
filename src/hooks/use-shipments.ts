/**
 * Custom hook for managing shipments
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Shipment, ShipmentEvent, ShipmentStatus } from '@/types';
import { logger } from '@/lib/logger';

const supabase = createClient();

export function useShipments(customerId?: string) {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchShipments();
    }, [customerId]);

    async function fetchShipments() {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('shipments')
                .select(`
          *,
          customer:customers(store_name, city, province),
          invoice:invoices(invoice_number)
        `)
                .order('created_at', { ascending: false });

            if (customerId) {
                query = query.eq('customer_id', customerId);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;
            setShipments(data || []);
        } catch (err: any) {
            setError(err.message);
            logger.error('Error fetching shipments', err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }

    async function createShipment(shipment: Partial<Shipment>) {
        try {
            const { data, error: createError } = await supabase
                .from('shipments')
                .insert([shipment])
                .select(`
          *,
          customer:customers(store_name, city, province),
          invoice:invoices(invoice_number)
        `)
                .single();

            if (createError) throw createError;

            setShipments([data, ...shipments]);
            return data;
        } catch (err: any) {
            logger.error('Error creating shipment', err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
    }

    async function updateShipment(id: string, updates: Partial<Shipment>) {
        try {
            const { data, error: updateError } = await supabase
                .from('shipments')
                .update(updates)
                .eq('id', id)
                .select(`
          *,
          customer:customers(store_name, city, province),
          invoice:invoices(invoice_number)
        `)
                .single();

            if (updateError) throw updateError;

            setShipments(shipments.map(s => s.id === id ? data : s));
            return data;
        } catch (err: any) {
            logger.error('Error updating shipment', err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
    }

    async function deleteShipment(id: string) {
        try {
            const { error: deleteError } = await supabase
                .from('shipments')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            setShipments(shipments.filter(s => s.id !== id));
        } catch (err: any) {
            logger.error('Error deleting shipment', err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
    }

    return {
        shipments,
        loading,
        error,
        createShipment,
        updateShipment,
        deleteShipment,
        refetch: fetchShipments,
    };
}

export function useShipment(shipmentId: string | null) {
    const [shipment, setShipment] = useState<Shipment | null>(null);
    const [events, setEvents] = useState<ShipmentEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (shipmentId) {
            fetchShipment();
            fetchShipmentEvents();
        }
    }, [shipmentId]);

    async function fetchShipment() {
        if (!shipmentId) return;

        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('shipments')
                .select(`
          *,
          customer:customers(store_name, email, phone, city, province, street, postal_code),
          invoice:invoices(invoice_number, total)
        `)
                .eq('id', shipmentId)
                .single();

            if (fetchError) throw fetchError;
            setShipment(data);
        } catch (err: any) {
            setError(err.message);
            logger.error('Error fetching shipment', err instanceof Error ? err : new Error(String(err)));
        } finally {
            setLoading(false);
        }
    }

    async function fetchShipmentEvents() {
        if (!shipmentId) return;

        try {
            const { data, error: fetchError } = await supabase
                .from('shipping_events')
                .select('*')
                .eq('shipment_id', shipmentId)
                .order('timestamp', { ascending: true });

            if (fetchError) throw fetchError;
            setEvents(data || []);
        } catch (err: any) {
            logger.error('Error fetching shipment events', err instanceof Error ? err : new Error(String(err)));
        }
    }

    async function updateShipmentStatus(status: ShipmentStatus, message?: string) {
        if (!shipmentId || !shipment) return;

        try {
            // Update shipment status
            const { error: updateError } = await supabase
                .from('shipments')
                .update({ status })
                .eq('id', shipmentId);

            if (updateError) throw updateError;

            // Create status event
            if (message) {
                const { error: eventError } = await supabase
                    .from('shipping_events')
                    .insert([{
                        shipment_id: shipmentId,
                        status,
                        message,
                    }]);

                if (eventError) throw eventError;
            }

            await fetchShipment();
            await fetchShipmentEvents();
        } catch (err: any) {
            logger.error('Error updating shipment status', err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
    }

    async function refreshTracking() {
        if (!shipment?.tracking_number) {
            throw new Error('No tracking number available');
        }

        try {
            // Call API route to refresh tracking from NetParcel
            const response = await fetch(`/api/shipments/${shipmentId}/refresh`, {
                method: 'POST',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to refresh tracking');
            }

            const data = await response.json();

            await fetchShipment();
            await fetchShipmentEvents();

            return data;
        } catch (err: any) {
            logger.error('Error refreshing tracking', err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
    }

    async function cancelShipment() {
        if (!shipmentId) return;

        try {
            // Call API route to cancel via NetParcel
            const response = await fetch(`/api/shipments/${shipmentId}/cancel`, {
                method: 'POST',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to cancel shipment');
            }

            await fetchShipment();
        } catch (err: any) {
            logger.error('Error cancelling shipment', err instanceof Error ? err : new Error(String(err)));
            throw err;
        }
    }

    return {
        shipment,
        events,
        loading,
        error,
        updateShipmentStatus,
        refreshTracking,
        cancelShipment,
        refetch: fetchShipment,
    };
}
