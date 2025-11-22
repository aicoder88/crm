/**
 * API route to cancel a shipment via NetParcel
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { cancelShipment as cancelNetParcelShipment } from '@/lib/netparcel';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createClient();

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

        // Check if shipment can be cancelled
        if (!['pending', 'label_created'].includes(shipment.status)) {
            return NextResponse.json(
                { error: 'Shipment cannot be cancelled in current status' },
                { status: 400 }
            );
        }

        // Cancel via NetParcel if tracking number exists
        if (shipment.tracking_number) {
            try {
                await cancelNetParcelShipment(shipment.tracking_number);
            } catch (error: any) {
                console.error('NetParcel cancellation error:', error);
                // Continue with local cancellation even if NetParcel fails
            }
        }

        // Update shipment status to cancelled
        const { error: updateError } = await supabase
            .from('shipments')
            .update({ status: 'cancelled' })
            .eq('id', id);

        if (updateError) {
            throw updateError;
        }

        // Add cancellation event
        await supabase.from('shipping_events').insert({
            shipment_id: id,
            status: 'cancelled',
            message: 'Shipment cancelled',
        });

        return NextResponse.json({
            success: true,
            message: 'Shipment cancelled successfully',
        });
    } catch (error: any) {
        console.error('Error cancelling shipment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to cancel shipment' },
            { status: 500 }
        );
    }
}
