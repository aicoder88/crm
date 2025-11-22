import { format } from 'date-fns';

export interface TemplateContext {
    // Customer fields
    customer_name?: string;
    customer_email?: string;
    contact_name?: string;

    // Invoice fields
    invoice_number?: string;
    invoice_total?: string;
    invoice_due_date?: string;

    // Shipment fields
    tracking_number?: string;
    shipment_carrier?: string;
    estimated_delivery?: string;

    // Deal fields
    deal_title?: string;
    deal_value?: string;

    // Task fields
    task_title?: string;
    task_due_date?: string;

    // Generic fields
    [key: string]: string | undefined;
}

/**
 * Render an email template by replacing {{variable}} placeholders with actual values
 * @param template Template string with {{variable}} placeholders
 * @param context Object containing variable values
 * @returns Rendered string
 */
export function renderTemplate(template: string, context: TemplateContext): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return context[key] || match; // Keep placeholder if value not found
    });
}

/**
 * Extract all variable names from a template string
 * @param template Template string with {{variable}} placeholders
 * @returns Array of variable names
 */
export function extractTemplateVariables(template: string): string[] {
    const matches = template.matchAll(/\{\{(\w+)\}\}/g);
    return Array.from(matches, m => m[1]);
}

/**
 * Validate that all required variables are present in context
 * @param template Template string
 * @param context Context object
 * @returns Object with isValid boolean and missing array
 */
export function validateTemplateContext(
    template: string,
    context: TemplateContext
): { isValid: boolean; missing: string[] } {
    const required = extractTemplateVariables(template);
    const missing = required.filter(key => !context[key]);

    return {
        isValid: missing.length === 0,
        missing,
    };
}

/**
 * Format currency for email display
 */
export function formatCurrency(amount: number, currency = 'CAD'): string {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency,
    }).format(amount);
}

/**
 * Format date for email display
 */
export function formatEmailDate(date: string | Date): string {
    return format(new Date(date), 'MMMM d, yyyy');
}

/**
 * Convert plain text to HTML with line breaks
 */
export function textToHtml(text: string): string {
    return text
        .split('\n')
        .map(line => `<p>${escapeHtml(line)}</p>`)
        .join('');
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Create a simple plain text version from HTML
 */
export function htmlToText(html: string): string {
    return html
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate email addresses and return only valid ones
 */
export function filterValidEmails(emails: string[]): string[] {
    return emails.filter(isValidEmail);
}

/**
 * Generate unsubscribe link (placeholder - implement based on your routing)
 */
export function generateUnsubscribeLink(customerId: string): string {
    return `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?id=${customerId}`;
}

/**
 * Generate tracking pixel for email opens
 */
export function generateTrackingPixel(emailId: string): string {
    return `<img src="${process.env.NEXT_PUBLIC_APP_URL}/api/email/track/${emailId}.png" width="1" height="1" alt="" />`;
}
