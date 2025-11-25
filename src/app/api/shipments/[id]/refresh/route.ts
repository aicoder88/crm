/**
 * API route to refresh shipment tracking from NetParcel
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getTrackingInfo } from '@/lib/netparcel';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        
        // Add auth check at the start
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get shipment
        const { data: shipment, error: shipmentError } = await supabase
            .from('shipments')
            .select('*')
            .eq('id', id)
            .single();

        if (shipmentError || !shipment) {
            return NextResponse.json(
                { error: 'Shipment not found' },
                { status: 404 }
            );
        }

        if (!shipment.tracking_number) {
            return NextResponse.json(
                { error: 'No tracking number available' },
                { status: 400 }
            );
        }

        // Fetch tracking info from NetParcel
        const trackingData = await getTrackingInfo(shipment.tracking_number);

        // Update shipment status
        const { error: updateError } = await supabase
            .from('shipments')
            .update({
                status: trackingData.status as any,
                delivered_date: trackingData.delivered_date || null,
            })
            .eq('id', id);

        if (updateError) {
            throw updateError;
        }

        // Add new tracking events
        if (trackingData.events && trackingData.events.length > 0) {
            // Get existing event timestamps to avoid duplicates
            const { data: existingEvents } = await supabase
                .from('shipping_events')
                .select('timestamp')
                .eq('shipment_id', id);

            const existingTimestamps = new Set(
                existingEvents?.map(e => e.timestamp) || []
            );

            // Filter out existing events
            const newEvents = trackingData.events
                .filter(event => !existingTimestamps.has(event.timestamp))
                .map(event => ({
                    shipment_id: id,
                    status: event.status,
                    message: event.message,
                    location: event.location || null,
                    timestamp: event.timestamp,
                }));

            if (newEvents.length > 0) {
                const { error: eventsError } = await supabase
                    .from('shipping_events')
                    .insert(newEvents);

                if (eventsError) {
                    console.error('Error inserting events:', eventsError);
                }
            }
        }

        return NextResponse.json({
            success: true,
            status: trackingData.status,
            eventsAdded: trackingData.events?.length || 0,
        });
    } catch (error: any) {
        console.error('Error refreshing tracking:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to refresh tracking' },
            { status: 500 }
        );
    }
}
