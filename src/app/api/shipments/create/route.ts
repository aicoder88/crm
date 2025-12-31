/**
 * API route to create a new shipment via NetParcel
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createShipment as createNetParcelShipment } from '@/lib/netparcel';
import { withRateLimit } from '@/lib/with-rate-limit';

async function handler(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        // Add auth check at the start
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            customer_id,
            invoice_id,
            weight,
            length,
            width,
            height,
            service_level,
            package_count = 1,
            notes,
        } = body;

        // Validate required fields
        if (!customer_id || !weight || !length || !width || !height || !service_level) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get customer info
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('store_name, city, province, postal_code')
            .eq('id', customer_id)
            .single();

        if (customerError || !customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        // Create shipment via NetParcel
        let netparcelResponse;
        try {
            netparcelResponse = await createNetParcelShipment({
                customerId: customer_id,
                invoiceId: invoice_id,
                weight,
                length,
                width,
                height,
                serviceLevel: service_level,
                packageCount: package_count,
            });
        } catch (error: unknown) {
            console.error('NetParcel API error:', error);
            const message = error instanceof Error ? error.message : 'Unknown error';
            return NextResponse.json(
                { error: `NetParcel error: ${message}` },
                { status: 500 }
            );
        }

        // Generate order number
        const { data: orderNumberData } = await supabase
            .rpc('generate_order_number');

        const order_number = orderNumberData || `ORD-${Date.now()}`;

        // Create shipment in database
        const { data: shipment, error: shipmentError } = await supabase
            .from('shipments')
            .insert({
                customer_id,
                invoice_id: invoice_id || null,
                order_number,
                carrier: netparcelResponse.carrier,
                tracking_number: netparcelResponse.tracking_number,
                status: 'label_created',
                actual_weight: weight,
                dimensions_length: length,
                dimensions_width: width,
                dimensions_height: height,
                service_level,
                package_count,
                shipping_cost: netparcelResponse.cost,
                label_url: netparcelResponse.label_url,
                estimated_delivery_date: netparcelResponse.estimated_delivery_date,
                notes: notes || null,
            })
            .select()
            .single();

        if (shipmentError) {
            throw shipmentError;
        }

        // Create initial tracking event
        await supabase.from('shipping_events').insert({
            shipment_id: shipment.id,
            status: 'label_created',
            message: 'Shipping label created',
        });

        return NextResponse.json({
            success: true,
            shipment,
        });
    } catch (error: unknown) {
        console.error('Error creating shipment:', error);
        const message = error instanceof Error ? error.message : 'Failed to create shipment';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

export const POST = withRateLimit(handler, 'shipments');
