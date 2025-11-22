import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend-client';
import { renderTemplate, formatEmailDate, formatCurrency } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Parse request body
        const { customerId, templateId, to, subject, body, context } = await request.json();

        // Validate required fields
        if (!customerId || !to || (!subject && !templateId)) {
            return NextResponse.json(
                { error: 'Missing required fields: customerId, to, and subject/templateId' },
                { status: 400 }
            );
        }

        // Fetch customer data for context
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('*, contacts(*)')
            .eq('id', customerId)
            .single();

        if (customerError || !customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        let finalSubject = subject;
        let finalBody = body;

        // If using a template, fetch and render it
        if (templateId) {
            const { data: template, error: templateError } = await supabase
                .from('email_templates')
                .select('*')
                .eq('id', templateId)
                .single();

            if (templateError || !template) {
                return NextResponse.json(
                    { error: 'Template not found' },
                    { status: 404 }
                );
            }

            // Prepare template context with customer data + provided context
            const templateContext = {
                customer_name: customer.store_name,
                customer_email: customer.email || '',
                contact_name: customer.contacts?.[0]?.name || customer.owner_manager_name || '',
                ...context,
            };

            finalSubject = renderTemplate(template.subject, templateContext);
            finalBody = renderTemplate(template.body, templateContext);
        }

        // Send email via Resend
        const messageId = await sendEmail({
            to,
            subject: finalSubject,
            html: finalBody,
            tags: [
                { name: 'customer_id', value: customerId },
                { name: 'source', value: 'crm' },
            ],
        });

        // Create timeline event
        const { error: timelineError } = await supabase
            .from('customer_timeline')
            .insert([
                {
                    customer_id: customerId,
                    type: 'email',
                    email_message_id: messageId,
                    email_sent_to: to,
                    email_sent_from: 'Purrify CRM <noreply@purrify.ca>',
                    email_subject: finalSubject,
                    data: {
                        template_id: templateId || null,
                        body_preview: finalBody.substring(0, 200),
                    },
                },
            ]);

        if (timelineError) {
            console.error('Failed to create timeline event:', timelineError);
            // Don't fail the request if timeline creation fails
        }

        return NextResponse.json({
            success: true,
            messageId,
        });
    } catch (error) {
        console.error('Email send error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to send email' },
            { status: 500 }
        );
    }
}
