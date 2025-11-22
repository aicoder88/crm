/**
 * Invoice utility functions
 */

/**
 * Format currency with proper symbol and decimals
 */
export function formatCurrency(amount: number, currency: string = 'CAD'): string {
    return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

/**
 * Calculate invoice totals from line items
 */
export function calculateInvoiceTotals(
    items: Array<{ quantity: number; unit_price: number }>,
    tax: number = 0,
    shipping: number = 0,
    discount: number = 0
) {
    const subtotal = items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
    }, 0);

    const total = subtotal + tax + shipping - discount;

    return {
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        shipping: Number(shipping.toFixed(2)),
        discount: Number(discount.toFixed(2)),
        total: Number(total.toFixed(2)),
    };
}

/**
 * Calculate tax based on subtotal and tax rate
 */
export function calculateTax(subtotal: number, taxRate: number): number {
    return Number((subtotal * (taxRate / 100)).toFixed(2));
}

/**
 * Get tax rate for Canadian provinces
 */
export function getProvincialTaxRate(province: string): number {
    const taxRates: Record<string, number> = {
        'AB': 5,   // Alberta - GST only
        'BC': 12,  // British Columbia - GST + PST
        'MB': 12,  // Manitoba - GST + PST
        'NB': 15,  // New Brunswick - HST
        'NL': 15,  // Newfoundland and Labrador - HST
        'NT': 5,   // Northwest Territories - GST only
        'NS': 15,  // Nova Scotia - HST
        'NU': 5,   // Nunavut - GST only
        'ON': 13,  // Ontario - HST
        'PE': 15,  // Prince Edward Island - HST
        'QC': 14.975, // Quebec - GST + QST
        'SK': 11,  // Saskatchewan - GST + PST
        'YT': 5,   // Yukon - GST only
    };

    return taxRates[province.toUpperCase()] || 0;
}

/**
 * Format invoice status as readable string
 */
export function formatInvoiceStatus(status: string): string {
    const statusMap: Record<string, string> = {
        'draft': 'Draft',
        'sent': 'Sent',
        'paid': 'Paid',
        'overdue': 'Overdue',
        'cancelled': 'Cancelled',
    };

    return statusMap[status] || status;
}

/**
 * Get status color for badges
 */
export function getInvoiceStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
        'draft': 'bg-gray-500',
        'sent': 'bg-blue-500',
        'paid': 'bg-green-500',
        'overdue': 'bg-red-500',
        'cancelled': 'bg-gray-400',
    };

    return colorMap[status] || 'bg-gray-500';
}

/**
 * Check if invoice is overdue
 */
export function isInvoiceOverdue(invoice: { status: string; due_date: string | null }): boolean {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
        return false;
    }

    if (!invoice.due_date) {
        return false;
    }

    const dueDate = new Date(invoice.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dueDate < today;
}

/**
 * Format date for display
 */
export function formatDate(date: string | null): string {
    if (!date) return 'N/A';

    return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(new Date(date));
}

/**
 * Calculate days until due
 */
export function daysUntilDue(dueDate: string | null): number | null {
    if (!dueDate) return null;

    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Generate sequential invoice number (e.g., INV-2025-0001)
 */
export async function generateInvoiceNumber(): Promise<string> {
    // For now, use a simple timestamp-based number
    // In production, this should query the database for the last invoice number
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}-${randomNum}`;
}
