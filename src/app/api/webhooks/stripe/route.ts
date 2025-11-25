import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
    const supabase = await createClient();

    try {
        // Get the webhook signature from headers
        const signature = req.headers.get('stripe-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'No signature provided' },
                { status: 400 }
            );
        }

        // Get raw body
        const body = await req.text();

        // Verify the webhook signature
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('Missing STRIPE_WEBHOOK_SECRET');
            return NextResponse.json(
                { error: 'Webhook secret not configured' },
                { status: 500 }
            );
        }

        const event = verifyWebhookSignature(body, signature, webhookSecret);

        // Handle the event
        switch (event.type) {
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;

                // Update invoice status in database
                const { error } = await supabase
                    .from('invoices')
                    .update({
                        status: 'paid',
                        paid_date: new Date().toISOString(),
                        pdf_url: invoice.invoice_pdf || null,
                    })
                    .eq('stripe_invoice_id', invoice.id);

                if (error) {
                    console.error('Error updating invoice:', error);
                    return NextResponse.json(
                        { error: 'Failed to update invoice' },
                        { status: 500 }
                    );
                }

                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;

                // Optionally update invoice status or log the failure
                break;
            }

            case 'invoice.sent': {
                const invoice = event.data.object as Stripe.Invoice;

                // Update sent_date if not already set
                const { error } = await supabase
                    .from('invoices')
                    .update({
                        sent_date: new Date().toISOString(),
                        pdf_url: invoice.invoice_pdf || null,
                    })
                    .eq('stripe_invoice_id', invoice.id)
                    .is('sent_date', null);

                if (error) {
                    console.error('Error updating invoice sent date:', error);
                }

                break;
            }

            case 'invoice.finalized': {
                const invoice = event.data.object as Stripe.Invoice;

                // Update PDF URL when invoice is finalized
                const { error } = await supabase
                    .from('invoices')
                    .update({
                        pdf_url: invoice.invoice_pdf || null,
                    })
                    .eq('stripe_invoice_id', invoice.id);

                if (error) {
                    console.error('Error updating invoice PDF:', error);
                }

                break;
            }

            default:
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 400 }
        );
    }
}
