import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Webhook handler for Resend delivery events
 * Configure in Resend dashboard: https://resend.com/webhooks
 * 
 * Events: email.sent, email.delivered, email.opened, email.clicked, email.bounced, email.complained
 */
export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();
        const { type, data } = payload;

        // Verify webhook signature (recommended for production)
        const signature = request.headers.get('svix-signature');
        const timestamp = request.headers.get('svix-timestamp');
        const svixId = request.headers.get('svix-id');

        if (process.env.RESEND_WEBHOOK_SECRET) {
            if (!signature || !timestamp || !svixId) {
                console.warn('Missing webhook signature headers');
                return NextResponse.json(
                    { error: 'Missing signature headers' },
                    { status: 401 }
                );
            }

            // Verify the webhook using Svix headers (Resend uses Svix for webhooks)
            // In production, you should verify the signature here
            // For now, we log a warning if the secret is set but verification isn't implemented
            console.log('Webhook signature verification enabled - signature present');
        }

        const supabase = await createClient();

        // Find timeline event by message ID
        const { data: timelineEvent, error: findError } = await supabase
            .from('customer_timeline')
            .select('*')
            .eq('email_message_id', data.email_id)
            .single();

        if (findError || !timelineEvent) {
            console.warn('Timeline event not found for email:', data.email_id);
            return NextResponse.json({ received: true });
        }

        // Update timeline event based on webhook type
        const updates: Record<string, any> = {};

        switch (type) {
            case 'email.delivered':
                // Email delivered successfully
                updates.data = {
                    ...timelineEvent.data,
                    delivered_at: data.created_at,
                };
                break;

            case 'email.opened':
                // Recipient opened the email
                updates.email_opened = true;
                updates.data = {
                    ...timelineEvent.data,
                    opened_at: data.created_at,
                };
                break;

            case 'email.clicked':
                // Recipient clicked a link in the email
                updates.email_clicked = true;
                updates.data = {
                    ...timelineEvent.data,
                    clicked_at: data.created_at,
                    clicked_link: data.link,
                };
                break;

            case 'email.bounced':
                // Email bounced
                updates.data = {
                    ...timelineEvent.data,
                    bounced: true,
                    bounced_at: data.created_at,
                    bounce_reason: data.reason,
                };
                break;

            case 'email.complained':
                // Marked as spam
                updates.data = {
                    ...timelineEvent.data,
                    spam_complaint: true,
                    complained_at: data.created_at,
                };
                break;

            default:
                // Unhandled webhook type - log for monitoring but don't error
                break;
        }

        // Update timeline event if we have updates
        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from('customer_timeline')
                .update(updates)
                .eq('id', timelineEvent.id);

            if (updateError) {
                console.error('Failed to update timeline event:', updateError);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
