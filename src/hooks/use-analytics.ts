'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Customer, Deal, Invoice, Shipment } from '@/types';
import {
    aggregateRevenueByPeriod,
    calculateGrowth,
    segmentCustomers,
    calculateOnTimeDeliveryRate,
    calculateAverageDeliveryDays,
    calculateAverageOrderValue,
    calculateDealVelocity,
    type RevenueDataPoint,
    type RFMSegment
} from '@/lib/analytics-utils';

export interface DashboardMetrics {
    totalCustomers: number;
    customerGrowth: number;
    activeDeals: number;
    activeDealValue: number;
    dealGrowth: number;
    monthlyRevenue: number;
    revenueGrowth: number;
    outstandingInvoices: number;
    outstandingAmount: number;
    overdueCount: number;
}

export function useDashboardMetrics(periodDays: number = 30) {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMetrics();
    }, [periodDays]);

    async function fetchMetrics() {
        try {
            setLoading(true);
            const supabase = createClient();

            const now = new Date();
            const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
            const previousPeriodStart = new Date(periodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

            // Fetch customers
            const { data: customers, error: customersError } = await supabase
                .from('customers')
                .select('id, created_at');

            if (customersError) throw customersError;

            const currentCustomers = customers?.filter(c => new Date(c.created_at) >= periodStart).length || 0;
            const previousCustomers = customers?.filter(
                c => new Date(c.created_at) >= previousPeriodStart && new Date(c.created_at) < periodStart
            ).length || 0;

            // Fetch deals
            const { data: deals, error: dealsError } = await supabase
                .from('deals')
                .select('id, value, created_at, closed_at')
                .is('closed_at', null);

            if (dealsError) throw dealsError;

            const currentDeals = deals?.filter(d => new Date(d.created_at) >= periodStart).length || 0;
            const previousDeals = deals?.length ? deals.length - currentDeals : 0;

            // Fetch invoices
            const { data: invoices, error: invoicesError } = await supabase
                .from('invoices')
                .select('id, total, status, paid_date, due_date, created_at');

            if (invoicesError) throw invoicesError;

            const currentMonthRevenue = invoices
                ?.filter(i => i.status === 'paid' && i.paid_date && new Date(i.paid_date) >= periodStart)
                .reduce((sum, i) => sum + i.total, 0) || 0;

            const previousMonthRevenue = invoices
                ?.filter(
                    i => i.status === 'paid' && i.paid_date &&
                        new Date(i.paid_date) >= previousPeriodStart &&
                        new Date(i.paid_date) < periodStart
                )
                .reduce((sum, i) => sum + i.total, 0) || 0;

            const outstandingInvoices = invoices?.filter(
                i => i.status !== 'paid' && i.status !== 'cancelled'
            ) || [];

            const overdueInvoices = outstandingInvoices.filter(
                i => i.due_date && new Date(i.due_date) < now
            );

            setMetrics({
                totalCustomers: customers?.length || 0,
                customerGrowth: calculateGrowth(currentCustomers, previousCustomers),
                activeDeals: deals?.length || 0,
                activeDealValue: deals?.reduce((sum, d) => sum + (d.value || 0), 0) || 0,
                dealGrowth: calculateGrowth(currentDeals, previousDeals),
                monthlyRevenue: currentMonthRevenue,
                revenueGrowth: calculateGrowth(currentMonthRevenue, previousMonthRevenue),
                outstandingInvoices: outstandingInvoices.length,
                outstandingAmount: outstandingInvoices.reduce((sum, i) => sum + i.total, 0),
                overdueCount: overdueInvoices.length
            });

            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard metrics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load metrics');
        } finally {
            setLoading(false);
        }
    }

    return { metrics, loading, error, refresh: fetchMetrics };
}

export interface SalesAnalytics {
    pipelineMetrics: Array<{
        stage: string;
        dealCount: number;
        totalValue: number;
        avgValue: number;
        probability: number;
    }>;
    conversionRates: Map<string, number>;
    dealVelocity: Map<string, number>;
    forecastedRevenue: number;
    winRate: number;
    lossRate: number;
}

export function useSalesAnalytics() {
    const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    async function fetchAnalytics() {
        try {
            setLoading(true);
            const supabase = createClient();

            const { data: deals, error: dealsError } = await supabase
                .from('deals')
                .select('*')
                .order('created_at', { ascending: false });

            if (dealsError) throw dealsError;

            // Group by stage
            const stageGroups = new Map<string, Deal[]>();
            deals?.forEach(deal => {
                if (!stageGroups.has(deal.stage)) {
                    stageGroups.set(deal.stage, []);
                }
                stageGroups.get(deal.stage)!.push(deal);
            });

            const pipelineMetrics = Array.from(stageGroups.entries()).map(([stage, stageDeals]) => ({
                stage,
                dealCount: stageDeals.length,
                totalValue: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0),
                avgValue: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0) / stageDeals.length,
                probability: stageDeals.reduce((sum, d) => sum + (d.probability || 0), 0) / stageDeals.length
            }));

            const closedDeals = deals?.filter(d => d.closed_at) || [];
            const wonDeals = closedDeals.filter(d => d.stage === 'Closed Won');
            const lostDeals = closedDeals.filter(d => d.stage === 'Closed Lost');

            const forecastedRevenue = deals
                ?.filter(d => !d.closed_at)
                .reduce((sum, d) => sum + (d.value || 0) * ((d.probability || 0) / 100), 0) || 0;

            setAnalytics({
                pipelineMetrics,
                conversionRates: new Map(),
                dealVelocity: calculateDealVelocity(deals || []),
                forecastedRevenue,
                winRate: closedDeals.length ? (wonDeals.length / closedDeals.length) * 100 : 0,
                lossRate: closedDeals.length ? (lostDeals.length / closedDeals.length) * 100 : 0
            });

            setError(null);
        } catch (err) {
            console.error('Error fetching sales analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load sales analytics');
        } finally {
            setLoading(false);
        }
    }

    return { analytics, loading, error, refresh: fetchAnalytics };
}

export interface CustomerAnalytics {
    segments: RFMSegment[];
    acquisitionTrend: Array<{ month: string; count: number }>;
    customersByType: Map<string, number>;
    customersByStatus: Map<string, number>;
    customersByProvince: Map<string, number>;
    averageLifetimeValue: number;
}

export function useCustomerAnalytics() {
    const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    async function fetchAnalytics() {
        try {
            setLoading(true);
            const supabase = createClient();

            const { data: customers, error: customersError } = await supabase
                .from('customers')
                .select('*');

            if (customersError) throw customersError;

            const { data: invoices, error: invoicesError } = await supabase
                .from('invoices')
                .select('*');

            if (invoicesError) throw invoicesError;

            // RFM Segmentation
            const segments = segmentCustomers(customers || [], invoices || []);

            // Acquisition trend
            const acquisitionByMonth = new Map<string, number>();
            customers?.forEach(customer => {
                const month = new Date(customer.created_at).toISOString().slice(0, 7);
                acquisitionByMonth.set(month, (acquisitionByMonth.get(month) || 0) + 1);
            });

            const acquisitionTrend = Array.from(acquisitionByMonth.entries())
                .map(([month, count]) => ({ month, count }))
                .sort((a, b) => a.month.localeCompare(b.month));

            // Group by type
            const byType = new Map<string, number>();
            customers?.forEach(c => {
                byType.set(c.type, (byType.get(c.type) || 0) + 1);
            });

            // Group by status
            const byStatus = new Map<string, number>();
            customers?.forEach(c => {
                byStatus.set(c.status, (byStatus.get(c.status) || 0) + 1);
            });

            // Group by province
            const byProvince = new Map<string, number>();
            customers?.forEach(c => {
                if (c.province) {
                    byProvince.set(c.province, (byProvince.get(c.province) || 0) + 1);
                }
            });

            // Calculate average LTV
            const paidInvoices = invoices?.filter(i => i.status === 'paid') || [];
            const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);
            const avgLTV = customers?.length ? totalRevenue / customers.length : 0;

            setAnalytics({
                segments,
                acquisitionTrend,
                customersByType: byType,
                customersByStatus: byStatus,
                customersByProvince: byProvince,
                averageLifetimeValue: avgLTV
            });

            setError(null);
        } catch (err) {
            console.error('Error fetching customer analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load customer analytics');
        } finally {
            setLoading(false);
        }
    }

    return { analytics, loading, error, refresh: fetchAnalytics };
}

export interface FinancialAnalytics {
    revenueByMonth: RevenueDataPoint[];
    invoiceAging: {
        current: number;
        overdue30: number;
        overdue60: number;
        overdue90: number;
        overdue90Plus: number;
    };
    revenueByProduct: Array<{ sku: string; revenue: number; count: number }>;
    taxByProvince: Map<string, number>;
    averagePaymentTime: number;
    collectionRate: number;
}

export function useFinancialAnalytics() {
    const [analytics, setAnalytics] = useState<FinancialAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    async function fetchAnalytics() {
        try {
            setLoading(true);
            const supabase = createClient();

            const { data: invoices, error: invoicesError } = await supabase
                .from('invoices')
                .select(`
          *,
          items:invoice_items(*),
          customer:customers(province)
        `);

            if (invoicesError) throw invoicesError;

            // Revenue by month
            const revenueByMonth = aggregateRevenueByPeriod(invoices || [], 'month');

            // Invoice aging
            const now = new Date();
            const aging = {
                current: 0,
                overdue30: 0,
                overdue60: 0,
                overdue90: 0,
                overdue90Plus: 0
            };

            invoices?.filter(i => i.status !== 'paid' && i.status !== 'cancelled').forEach(invoice => {
                if (!invoice.due_date) {
                    aging.current += invoice.total;
                    return;
                }

                const dueDate = new Date(invoice.due_date);
                const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

                if (daysOverdue < 0) aging.current += invoice.total;
                else if (daysOverdue < 30) aging.overdue30 += invoice.total;
                else if (daysOverdue < 60) aging.overdue60 += invoice.total;
                else if (daysOverdue < 90) aging.overdue90 += invoice.total;
                else aging.overdue90Plus += invoice.total;
            });

            // Revenue by product
            const productRevenue = new Map<string, { revenue: number; count: number }>();
            invoices?.forEach(invoice => {
                invoice.items?.forEach((item: any) => {
                    const sku = item.product_sku || 'N/A';
                    const current = productRevenue.get(sku) || { revenue: 0, count: 0 };
                    productRevenue.set(sku, {
                        revenue: current.revenue + item.total,
                        count: current.count + item.quantity
                    });
                });
            });

            const revenueByProduct = Array.from(productRevenue.entries())
                .map(([sku, data]) => ({ sku, revenue: data.revenue, count: data.count }))
                .sort((a, b) => b.revenue - a.revenue);

            // Tax by province
            const taxByProvince = new Map<string, number>();
            invoices?.forEach(invoice => {
                const province = (invoice.customer as any)?.province || 'Unknown';
                taxByProvince.set(province, (taxByProvince.get(province) || 0) + invoice.tax);
            });

            // Average payment time
            const paidInvoices = invoices?.filter(i => i.status === 'paid' && i.sent_date && i.paid_date) || [];
            const totalPaymentDays = paidInvoices.reduce((sum, invoice) => {
                const sent = new Date(invoice.sent_date!);
                const paid = new Date(invoice.paid_date!);
                const days = Math.floor((paid.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0);
            const averagePaymentTime = paidInvoices.length ? totalPaymentDays / paidInvoices.length : 0;

            // Collection rate
            const totalInvoiced = invoices?.reduce((sum, i) => sum + i.total, 0) || 0;
            const totalCollected = invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0) || 0;
            const collectionRate = totalInvoiced ? (totalCollected / totalInvoiced) * 100 : 0;

            setAnalytics({
                revenueByMonth,
                invoiceAging: aging,
                revenueByProduct,
                taxByProvince,
                averagePaymentTime,
                collectionRate
            });

            setError(null);
        } catch (err) {
            console.error('Error fetching financial analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load financial analytics');
        } finally {
            setLoading(false);
        }
    }

    return { analytics, loading, error, refresh: fetchAnalytics };
}

export interface OperationalAnalytics {
    shipmentsByMonth: Array<{ month: string; count: number }>;
    onTimeDeliveryRate: number;
    averageDeliveryDays: number;
    shippingCostByProvince: Map<string, number>;
    carrierPerformance: Array<{ carrier: string; count: number; avgCost: number }>;
    shipmentsByStatus: Map<string, number>;
}

export function useOperationalAnalytics() {
    const [analytics, setAnalytics] = useState<OperationalAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    async function fetchAnalytics() {
        try {
            setLoading(true);
            const supabase = createClient();

            const { data: shipments, error: shipmentsError } = await supabase
                .from('shipments')
                .select(`
          *,
          customer:customers(province)
        `);

            if (shipmentsError) throw shipmentsError;

            // Shipments by month
            const shipmentsByMonth = new Map<string, number>();
            shipments?.forEach(shipment => {
                const month = new Date(shipment.created_at).toISOString().slice(0, 7);
                shipmentsByMonth.set(month, (shipmentsByMonth.get(month) || 0) + 1);
            });

            // Shipping cost by province
            const costByProvince = new Map<string, number>();
            shipments?.forEach(shipment => {
                const province = (shipment.customer as any)?.province || 'Unknown';
                if (shipment.shipping_cost) {
                    costByProvince.set(province, (costByProvince.get(province) || 0) + shipment.shipping_cost);
                }
            });

            // Carrier performance
            const carrierStats = new Map<string, { count: number; totalCost: number }>();
            shipments?.forEach(shipment => {
                const carrier = shipment.carrier || 'Unknown';
                const current = carrierStats.get(carrier) || { count: 0, totalCost: 0 };
                carrierStats.set(carrier, {
                    count: current.count + 1,
                    totalCost: current.totalCost + (shipment.shipping_cost || 0)
                });
            });

            const carrierPerformance = Array.from(carrierStats.entries())
                .map(([carrier, stats]) => ({
                    carrier,
                    count: stats.count,
                    avgCost: stats.count ? stats.totalCost / stats.count : 0
                }));

            // Shipments by status
            const byStatus = new Map<string, number>();
            shipments?.forEach(s => {
                byStatus.set(s.status, (byStatus.get(s.status) || 0) + 1);
            });

            setAnalytics({
                shipmentsByMonth: Array.from(shipmentsByMonth.entries())
                    .map(([month, count]) => ({ month, count }))
                    .sort((a, b) => a.month.localeCompare(b.month)),
                onTimeDeliveryRate: calculateOnTimeDeliveryRate(shipments || []),
                averageDeliveryDays: calculateAverageDeliveryDays(shipments || []),
                shippingCostByProvince: costByProvince,
                carrierPerformance,
                shipmentsByStatus: byStatus
            });

            setError(null);
        } catch (err) {
            console.error('Error fetching operational analytics:', err);
            setError(err instanceof Error ? err.message : 'Failed to load operational analytics');
        } finally {
            setLoading(false);
        }
    }

    return { analytics, loading, error, refresh: fetchAnalytics };
}
