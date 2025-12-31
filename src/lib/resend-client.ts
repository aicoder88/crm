import { Resend } from 'resend';
import { env } from './env';
import { logger } from './logger';

// Validate Resend configuration on module load
if (!env.resend.apiKey) {
    console.warn('Resend not configured - email features will be unavailable');
}

export const resend = env.resend.apiKey ? new Resend(env.resend.apiKey) : null;

export interface SendEmailParams {
    to: string | string[];
    from?: string;
    subject: string;
    html: string;
    text?: string;
    cc?: string | string[];
    bcc?: string | string[];
    replyTo?: string | string[];
    attachments?: {
        filename: string;
        content: Buffer | string;
    }[];
    tags?: { name: string; value: string }[];
}

/**
 * Send an email via Resend
 * @param params Email parameters
 * @returns Message ID from Resend
 */
export async function sendEmail(params: SendEmailParams): Promise<string> {
    if (!resend) {
        throw new Error('Resend is not configured');
    }
    try {
        const { data, error } = await resend.emails.send({
            from: params.from || 'Purrify CRM <noreply@purrify.ca>',
            to: Array.isArray(params.to) ? params.to : [params.to],
            subject: params.subject,
            html: params.html,
            text: params.text,
            cc: params.cc,
            bcc: params.bcc,
            replyTo: params.replyTo,
            attachments: params.attachments,
            tags: params.tags,
        });

        if (error) {
            throw new Error(`Resend API error: ${error.message}`);
        }

        if (!data?.id) {
            throw new Error('No message ID returned from Resend');
        }

        return data.id;
    } catch (error) {
        logger.error('Failed to send email', error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Send multiple emails in batch (up to 100 at once)
 * @param emails Array of email parameters
 * @returns Array of message IDs
 */
export async function sendBatchEmails(emails: SendEmailParams[]): Promise<string[]> {
    if (!resend) {
        throw new Error('Resend is not configured');
    }
    try {
        const { data, error } = await resend.batch.send(
            emails.map(email => ({
                from: email.from || 'Purrify CRM <noreply@purrify.ca>',
                to: Array.isArray(email.to) ? email.to : [email.to],
                subject: email.subject,
                html: email.html,
                text: email.text,
                cc: email.cc,
                bcc: email.bcc,
                replyTo: email.replyTo,
                attachments: email.attachments,
                tags: email.tags,
            }))
        );

        if (error) {
            throw new Error(`Resend batch API error: ${error.message}`);
        }

        if (!data) {
            throw new Error('No data returned from Resend batch send');
        }

        return (data as unknown as Array<{ id: string }>).map((item) => item.id);
    } catch (error) {
        logger.error('Failed to send batch emails', error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}

/**
 * Get email delivery status (requires Resend webhook setup)
 */
export async function getEmailStatus(emailId: string) {
    if (!resend) {
        throw new Error('Resend is not configured');
    }
    try {
        const { data, error } = await resend.emails.get(emailId);

        if (error) {
            throw new Error(`Resend API error: ${error.message}`);
        }

        return data;
    } catch (error) {
        logger.error('Failed to get email status', error instanceof Error ? error : new Error(String(error)));
        throw error;
    }
}
