// Stripe server-side client
import Stripe from 'stripe';
import type { Customer, Invoice, Product } from '@/types';
import { createClient } from './supabase/server';
import { env } from './env';

// Validate Stripe configuration on module load
if (!env.stripe.secretKey) {
    console.warn('Stripe not configured - invoicing features will be unavailable');
}

export const stripe = env.stripe.secretKey ? new Stripe(env.stripe.secretKey, {
    apiVersion: '2025-11-17.clover' as Stripe.LatestApiVersion,
    typescript: true,
}) : null; // Provide a fallback for type safety if Stripe is not configured

/**
 * Create or update a Stripe customer
 */
export async function createStripeCustomer(customer: Customer): Promise<string> {
    if (!stripe) {
        throw new Error('Stripe is not configured');
    }
    try {
        // Check if customer already has a Stripe ID
        if (customer.stripe_customer_id) {
            // Update existing customer
            await stripe.customers.update(customer.stripe_customer_id, {
                email: customer.email || undefined,
                name: customer.store_name,
                phone: customer.phone || undefined,
                metadata: {
                    crm_customer_id: customer.id,
                },
            });
            return customer.stripe_customer_id;
        }

        // Create new Stripe customer
        const stripeCustomer = await stripe.customers.create({
            email: customer.email || undefined,
            name: customer.store_name,
            phone: customer.phone || undefined,
            metadata: {
                crm_customer_id: customer.id,
            },
        });

        return stripeCustomer.id;
    } catch (error) {
        console.error('Error creating Stripe customer:', error);
        throw error;
    }
}

/**
 * Create a Stripe Price for a product
 */
export async function createStripePrice(product: Product): Promise<string> {
    if (!stripe) {
        throw new Error('Stripe is not configured');
    }
    try {
        // Check if product already has a price ID
        if (product.stripe_price_id) {
            return product.stripe_price_id;
        }

        // Create a Stripe product first
        const stripeProduct = await stripe.products.create({
            name: product.name,
            description: product.description || undefined,
            metadata: {
                crm_product_id: product.id,
                sku: product.sku,
            },
        });

        // Create a price for the product
        const price = await stripe.prices.create({
            product: stripeProduct.id,
            currency: product.currency.toLowerCase(),
            unit_amount: Math.round(product.unit_price * 100), // Convert to cents
            metadata: {
                crm_product_id: product.id,
            },
        });

        return price.id;
    } catch (error) {
        console.error('Error creating Stripe price:', error);
        throw error;
    }
}

/**
 * Create a Stripe invoice
 */
export async function createStripeInvoice(
    invoice: Invoice,
    stripeCustomerId: string
): Promise<string> {
    if (!stripe) {
        throw new Error('Stripe is not configured');
    }
    try {
        // Create the invoice
        const stripeInvoice = await stripe.invoices.create({
            customer: stripeCustomerId,
            auto_advance: false, // Don't auto-finalize
            collection_method: 'send_invoice',
            days_until_due: invoice.due_date
                ? Math.ceil((new Date(invoice.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : 30,
            description: invoice.notes || undefined,
            metadata: {
                crm_invoice_id: invoice.id,
                invoice_number: invoice.invoice_number,
            },
        });

        // Add line items
        if (invoice.items) {
            for (const item of invoice.items) {
                await stripe.invoiceItems.create({
                    customer: stripeCustomerId,
                    invoice: stripeInvoice.id,
                    description: item.description || 'Product',
                    amount: Math.round(item.unit_price * item.quantity * 100), // Convert to cents
                    // quantity is not supported with amount, it's implied as 1 unit of 'amount' value
                    metadata: { quantity: item.quantity },
                });
            }
        }

        // Add tax if applicable
        if (invoice.tax > 0) {
            await stripe.invoiceItems.create({
                customer: stripeCustomerId,
                invoice: stripeInvoice.id,
                description: 'Tax',
                amount: Math.round(invoice.tax * 100),
            });
        }

        // Add shipping if applicable
        if (invoice.shipping > 0) {
            await stripe.invoiceItems.create({
                customer: stripeCustomerId,
                invoice: stripeInvoice.id,
                description: 'Shipping',
                amount: Math.round(invoice.shipping * 100),
            });
        }

        // Apply discount if applicable
        if (invoice.discount > 0) {
            await stripe.invoiceItems.create({
                customer: stripeCustomerId,
                invoice: stripeInvoice.id,
                description: 'Discount',
                amount: -Math.round(invoice.discount * 100),
            });
        }

        // Finalize the invoice to make it ready to send
        await stripe.invoices.finalizeInvoice(stripeInvoice.id);

        return stripeInvoice.id;
    } catch (error) {
        console.error('Error creating Stripe invoice:', error);
        throw error;
    }
}

/**
 * Send a Stripe invoice to the customer
 */
export async function sendStripeInvoice(stripeInvoiceId: string): Promise<void> {
    if (!stripe) {
        throw new Error('Stripe is not configured');
    }
    try {
        await stripe.invoices.sendInvoice(stripeInvoiceId);
    } catch (error) {
        console.error('Error sending Stripe invoice:', error);
        throw error;
    }
}

/**
 * Sync invoice status from Stripe
 */
export async function syncStripeInvoiceStatus(stripeInvoiceId: string) {
    if (!stripe) {
        throw new Error('Stripe is not configured');
    }
    try {
        const stripeInvoice = await stripe.invoices.retrieve(stripeInvoiceId);

        return {
            status: stripeInvoice.status,
            paid: stripeInvoice.status === 'paid',
            amount_paid: stripeInvoice.amount_paid / 100, // Convert from cents
            hosted_invoice_url: stripeInvoice.hosted_invoice_url,
            invoice_pdf: stripeInvoice.invoice_pdf,
        };
    } catch (error) {
        console.error('Error syncing Stripe invoice status:', error);
        throw error;
    }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
    payload: string | Buffer,
    signature: string,
    secret: string
): Stripe.Event {
    if (!stripe) {
        throw new Error('Stripe is not configured');
    }
    return stripe.webhooks.constructEvent(payload, signature, secret);
}
