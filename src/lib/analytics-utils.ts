import { Customer, Deal, Invoice, Shipment } from '@/types';

/**
 * Calculate conversion rate between two numbers
 */
export function calculateConversionRate(converted: number, total: number): number {
    if (total === 0) return 0;
    return (converted / total) * 100;
}

/**
 * Calculate Customer Lifetime Value based on historical invoices
 */
export function calculateCustomerLifetimeValue(invoices: Invoice[]): number {
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    return paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
}

/**
 * Calculate churn rate based on customer activity
 */
export function calculateChurnRate(
    totalCustomers: number,
    churnedCustomers: number,
    periodDays: number = 90
): number {
    if (totalCustomers === 0) return 0;
    return (churnedCustomers / totalCustomers) * 100;
}

/**
 * Aggregate revenue by time period
 */
export interface RevenueDataPoint {
    period: string;
    revenue: number;
    invoiceCount: number;
    avgOrderValue: number;
}

export function aggregateRevenueByPeriod(
    invoices: Invoice[],
    periodType: 'day' | 'week' | 'month' = 'month'
): RevenueDataPoint[] {
    const paidInvoices = invoices.filter(inv => inv.status === 'paid' && inv.paid_date);

    const grouped = new Map<string, Invoice[]>();

    paidInvoices.forEach(invoice => {
        if (!invoice.paid_date) return;

        const date = new Date(invoice.paid_date);
        let key: string;

        if (periodType === 'month') {
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else if (periodType === 'week') {
            const weekNum = getWeekNumber(date);
            key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
        } else {
            key = date.toISOString().split('T')[0];
        }

        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        grouped.get(key)!.push(invoice);
    });

    return Array.from(grouped.entries())
        .map(([period, invs]) => ({
            period,
            revenue: invs.reduce((sum, inv) => sum + inv.total, 0),
            invoiceCount: invs.length,
            avgOrderValue: invs.reduce((sum, inv) => sum + inv.total, 0) / invs.length
        }))
        .sort((a, b) => a.period.localeCompare(b.period));
}

/**
 * Calculate average order value
 */
export function calculateAverageOrderValue(invoices: Invoice[]): number {
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    if (paidInvoices.length === 0) return 0;

    const total = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    return total / paidInvoices.length;
}

/**
 * Simple linear regression for revenue forecasting
 */
export function forecastRevenue(
    historicalData: RevenueDataPoint[],
    periodsAhead: number = 3
): RevenueDataPoint[] {
    if (historicalData.length < 2) return [];

    // Simple moving average for forecasting
    const recentPeriods = historicalData.slice(-6); // Last 6 periods
    const avgRevenue = recentPeriods.reduce((sum, d) => sum + d.revenue, 0) / recentPeriods.length;

    const forecast: RevenueDataPoint[] = [];
    const lastPeriod = historicalData[historicalData.length - 1];

    for (let i = 1; i <= periodsAhead; i++) {
        const nextPeriod = getNextPeriod(lastPeriod.period, i);
        forecast.push({
            period: nextPeriod,
            revenue: avgRevenue,
            invoiceCount: 0,
            avgOrderValue: 0
        });
    }

    return forecast;
}

/**
 * RFM (Recency, Frequency, Monetary) Customer Segmentation
 */
export interface RFMSegment {
    segment: string;
    description: string;
    customers: string[];
    color: string;
}

export function segmentCustomers(
    customers: Customer[],
    invoices: Invoice[]
): RFMSegment[] {
    const customerMetrics = customers.map(customer => {
        const customerInvoices = invoices.filter(
            inv => inv.customer_id === customer.id && inv.status === 'paid'
        );

        const lastPurchase = customerInvoices
            .filter(inv => inv.paid_date)
            .map(inv => new Date(inv.paid_date!))
            .sort((a, b) => b.getTime() - a.getTime())[0];

        const recencyDays = lastPurchase
            ? Math.floor((Date.now() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
            : 999;

        const frequency = customerInvoices.length;
        const monetary = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);

        return {
            customerId: customer.id,
            recencyDays,
            frequency,
            monetary
        };
    });

    // Calculate quartiles for scoring
    const recencies = customerMetrics.map(m => m.recencyDays).sort((a, b) => a - b);
    const frequencies = customerMetrics.map(m => m.frequency).sort((a, b) => b - a);
    const monetaries = customerMetrics.map(m => m.monetary).sort((a, b) => b - a);

    const getQuartile = (arr: number[], value: number): number => {
        const index = arr.indexOf(value);
        const quartile = Math.floor((index / arr.length) * 4) + 1;
        return Math.min(quartile, 4);
    };

    const segments: Map<string, string[]> = new Map([
        ['Champions', []],
        ['Loyal', []],
        ['Potential Loyalists', []],
        ['Recent Customers', []],
        ['Promising', []],
        ['Need Attention', []],
        ['About to Sleep', []],
        ['At Risk', []],
        ['Cannot Lose', []],
        ['Hibernating', []],
        ['Lost', []]
    ]);

    customerMetrics.forEach(metric => {
        const r = 5 - getQuartile(recencies, metric.recencyDays); // Reverse for recency (lower is better)
        const f = getQuartile(frequencies, metric.frequency);
        const m = getQuartile(monetaries, metric.monetary);

        let segment = 'Other';

        if (r >= 4 && f >= 4 && m >= 4) segment = 'Champions';
        else if (r >= 3 && f >= 3 && m >= 3) segment = 'Loyal';
        else if (r >= 4 && f <= 2) segment = 'Recent Customers';
        else if (r >= 3 && f <= 2 && m >= 3) segment = 'Promising';
        else if (r <= 2 && f >= 3 && m >= 3) segment = 'Cannot Lose';
        else if (r <= 2 && f >= 2) segment = 'At Risk';
        else if (r <= 1) segment = 'Lost';
        else if (r >= 3 && f <= 2) segment = 'Potential Loyalists';
        else if (r >= 2 && f >= 2) segment = 'Need Attention';
        else if (r <= 2 && f <= 2) segment = 'Hibernating';
        else segment = 'About to Sleep';

        segments.get(segment)?.push(metric.customerId);
    });

    const segmentColors: Record<string, string> = {
        'Champions': '#16a34a',
        'Loyal': '#22c55e',
        'Potential Loyalists': '#84cc16',
        'Recent Customers': '#eab308',
        'Promising': '#f59e0b',
        'Need Attention': '#f97316',
        'About to Sleep': '#ef4444',
        'At Risk': '#dc2626',
        'Cannot Lose': '#991b1b',
        'Hibernating': '#6b7280',
        'Lost': '#374151'
    };

    const descriptions: Record<string, string> = {
        'Champions': 'Best customers - Buy often, spend most',
        'Loyal': 'Regular customers with good spend',
        'Potential Loyalists': 'Recent customers showing promise',
        'Recent Customers': 'New, need nurturing',
        'Promising': 'Recent, haven\'t spent much yet',
        'Need Attention': 'Above average recency, frequency & spend',
        'About to Sleep': 'Below average recency, frequency & spend',
        'At Risk': 'Spent big, but long time ago',
        'Cannot Lose': 'High spenders, but haven\'t purchased recently',
        'Hibernating': 'Low spenders, purchased long ago',
        'Lost': 'Lowest recency, frequency & spend'
    };

    return Array.from(segments.entries())
        .filter(([_, customers]) => customers.length > 0)
        .map(([segment, customers]) => ({
            segment,
            description: descriptions[segment] || '',
            customers,
            color: segmentColors[segment] || '#6b7280'
        }));
}

/**
 * Calculate deal velocity (average time in each stage)
 */
export function calculateDealVelocity(deals: Deal[]): Map<string, number> {
    const stageDurations = new Map<string, number[]>();

    deals.forEach(deal => {
        const createdDate = new Date(deal.created_at);
        const closedDate = deal.closed_at ? new Date(deal.closed_at) : new Date();
        const durationDays = Math.floor((closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        if (!stageDurations.has(deal.stage)) {
            stageDurations.set(deal.stage, []);
        }
        stageDurations.get(deal.stage)!.push(durationDays);
    });

    const averages = new Map<string, number>();
    stageDurations.forEach((durations, stage) => {
        const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        averages.set(stage, Math.round(avg));
    });

    return averages;
}

/**
 * Calculate on-time delivery rate
 */
export function calculateOnTimeDeliveryRate(shipments: Shipment[]): number {
    const deliveredShipments = shipments.filter(
        s => s.status === 'delivered' && s.delivered_date && s.estimated_delivery_date
    );

    if (deliveredShipments.length === 0) return 0;

    const onTime = deliveredShipments.filter(s => {
        const delivered = new Date(s.delivered_date!);
        const estimated = new Date(s.estimated_delivery_date!);
        return delivered <= estimated;
    }).length;

    return (onTime / deliveredShipments.length) * 100;
}

/**
 * Calculate average delivery days
 */
export function calculateAverageDeliveryDays(shipments: Shipment[]): number {
    const delivered = shipments.filter(
        s => s.status === 'delivered' && s.shipped_date && s.delivered_date
    );

    if (delivered.length === 0) return 0;

    const totalDays = delivered.reduce((sum, s) => {
        const shipped = new Date(s.shipped_date!);
        const deliveredDate = new Date(s.delivered_date!);
        const days = Math.floor((deliveredDate.getTime() - shipped.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
    }, 0);

    return Math.round(totalDays / delivered.length);
}

/**
 * Helper: Get week number of year
 */
function getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Helper: Get next period string
 */
function getNextPeriod(currentPeriod: string, offset: number): string {
    if (currentPeriod.includes('-W')) {
        // Weekly format
        const [year, week] = currentPeriod.split('-W').map(Number);
        const nextWeek = week + offset;
        const nextYear = year + Math.floor(nextWeek / 52);
        const weekNum = ((nextWeek - 1) % 52) + 1;
        return `${nextYear}-W${String(weekNum).padStart(2, '0')}`;
    } else if (currentPeriod.match(/^\d{4}-\d{2}$/)) {
        // Monthly format
        const [year, month] = currentPeriod.split('-').map(Number);
        const nextMonth = month + offset;
        const nextYear = year + Math.floor((nextMonth - 1) / 12);
        const monthNum = ((nextMonth - 1) % 12) + 1;
        return `${nextYear}-${String(monthNum).padStart(2, '0')}`;
    }
    // Daily format
    const date = new Date(currentPeriod);
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
}

/**
 * Calculate growth percentage
 */
export function calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
}

/**
 * Format percentage with + or - sign
 */
export function formatGrowthPercentage(growth: number): string {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
}
