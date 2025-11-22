import { createClient } from '@/lib/supabase/server';
import { renderTemplate, formatCurrency, formatEmailDate } from '@/lib/email-templates';
import { sendEmail } from '@/lib/resend-client';
import type { Customer, Invoice, Shipment } from '@/types';

/**
 * Send automated email when an invoice is created
 */
export async function sendInvoiceEmail(invoice: Invoice, customer: Customer) {
    try {
        if (!customer.email) {
            console.warn(`Customer ${customer.id} has no email address, skipping invoice email`);
            return null;
        }

        const supabase = await createClient();

        // Fetch invoice notification template
        const { data: template } = await supabase
            .from('email_templates')
            .select('*')
            .eq('name', 'Invoice Notification')
            .eq('active', true)
            .single();

        if (!template) {
            console.error('Invoice notification template not found');
            return null;
        }

        // Prepare context
        const context = {
            customer_name: customer.store_name,
            customer_email: customer.email,
            invoice_number: invoice.invoice_number,
            invoice_total: formatCurrency(invoice.total, invoice.currency),
            invoice_due_date: invoice.due_date ? formatEmailDate(invoice.due_date) : 'Upon receipt',
        };

        const subject = renderTemplate(template.subject, context);
        const body = renderTemplate(template.body, context);

        // Send email
        const messageId = await sendEmail({
            to: customer.email,
            subject,
            html: body,
            tags: [
                { name: 'customer_id', value: customer.id },
                { name: 'invoice_id', value: invoice.id },
                { name: 'automation', value: 'invoice_created' },
            ],
        });

        // Create timeline event
        await supabase.from('customer_timeline').insert([
            {
                customer_id: customer.id,
                type: 'email',
                email_message_id: messageId,
                email_sent_to: customer.email,
                email_sent_from: 'Purrify CRM <noreply@purrify.ca>',
                email_subject: subject,
                data: {
                    automation: 'invoice_created',
                    invoice_id: invoice.id,
                    template_id: template.id,
                },
            },
        ]);

        return messageId;
    } catch (error) {
        console.error('Failed to send invoice email:', error);
        throw error;
    }
}

/**
 * Send automated email when a shipment is created
 */
export async function sendShipmentEmail(shipment: Shipment, customer: Customer) {
    try {
        if (!customer.email) {
            console.warn(`Customer ${customer.id} has no email address, skipping shipment email`);
            return null;
        }

        const supabase = await createClient();

        // Fetch shipment notification template
        const { data: template } = await supabase
            .from('email_templates')
            .select('*')
            .eq('name', 'Shipment Notification')
            .eq('active', true)
            .single();

        if (!template) {
            console.error('Shipment notification template not found');
            return null;
        }

        // Prepare context
        const context = {
            customer_name: customer.store_name,
            tracking_number: shipment.tracking_number || 'Pending',
            shipment_carrier: shipment.carrier,
            estimated_delivery: shipment.estimated_delivery_date
                ? formatEmailDate(shipment.estimated_delivery_date)
                : 'TBD',
        };

        const subject = renderTemplate(template.subject, context);
        const body = renderTemplate(template.body, context);

        // Send email
        const messageId = await sendEmail({
            to: customer.email,
            subject,
            html: body,
            tags: [
                { name: 'customer_id', value: customer.id },
                { name: 'shipment_id', value: shipment.id },
                { name: 'automation', value: 'shipment_created' },
            ],
        });

        // Create timeline event
        await supabase.from('customer_timeline').insert([
            {
                customer_id: customer.id,
                type: 'email',
                email_message_id: messageId,
                email_sent_to: customer.email,
                email_sent_from: 'Purrify CRM <noreply@purrify.ca>',
                email_subject: subject,
                data: {
                    automation: 'shipment_created',
                    shipment_id: shipment.id,
                    template_id: template.id,
                },
            },
        ]);

        return messageId;
    } catch (error) {
        console.error('Failed to send shipment email:', error);
        throw error;
    }
}

/**
 * Send welcome email to new customer
 */
export async function sendWelcomeEmail(customer: Customer) {
    try {
        if (!customer.email) {
            console.warn(`Customer ${customer.id} has no email address, skipping welcome email`);
            return null;
        }

        const supabase = await createClient();

        // Fetch welcome email template
        const { data: template } = await supabase
            .from('email_templates')
            .select('*')
            .eq('name', 'Welcome Email')
            .eq('active', true)
            .single();

        if (!template) {
            console.error('Welcome email template not found');
            return null;
        }

        // Prepare context
        const context = {
            customer_name: customer.store_name,
        };

        const subject = renderTemplate(template.subject, context);
        const body = renderTemplate(template.body, context);

        // Send email
        const messageId = await sendEmail({
            to: customer.email,
            subject,
            html: body,
            tags: [
                { name: 'customer_id', value: customer.id },
                { name: 'automation', value: 'customer_created' },
            ],
        });

        // Create timeline event
        await supabase.from('customer_timeline').insert([
            {
                customer_id: customer.id,
                type: 'email',
                email_message_id: messageId,
                email_sent_to: customer.email,
                email_sent_from: 'Purrify CRM <noreply@purrify.ca>',
                email_subject: subject,
                data: {
                    automation: 'customer_created',
                    template_id: template.id,
                },
            },
        ]);

        return messageId;
    } catch (error) {
        console.error('Failed to send welcome email:', error);
        throw error;
    }
}
