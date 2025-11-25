'use client';

import { MetricCard } from "@/components/analytics/metric-card";
import { BarChart } from "@/components/analytics/bar-chart";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { Users, DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { useDashboardMetrics, useFinancialAnalytics } from "@/hooks/use-analytics-query";

export default function DashboardPage() {
    const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics(30);
    const { data: analytics, isLoading: analyticsLoading } = useFinancialAnalytics();

    return (
        <div className="flex flex-1 flex-col gap-8 animate-fade-in-up">
            <div className="grid auto-rows-min gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Customers"
                    value={metrics?.totalCustomers.toLocaleString() || '0'}
                    change={metrics?.customerGrowth}
                    changeLabel="vs last 30 days"
                    icon={Users}
                    loading={metricsLoading}
                />
                <MetricCard
                    title="Active Deals"
                    value={metrics?.activeDeals.toLocaleString() || '0'}
                    change={metrics?.dealGrowth}
                    changeLabel="vs last 30 days"
                    icon={TrendingUp}
                    loading={metricsLoading}
                    valueClassName="text-xl md:text-2xl"
                />
                <MetricCard
                    title="Monthly Revenue"
                    value={`$${metrics?.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                    change={metrics?.revenueGrowth}
                    changeLabel="vs last 30 days"
                    icon={DollarSign}
                    loading={metricsLoading}
                    valueClassName="text-xl md:text-2xl"
                />
                <MetricCard
                    title="Outstanding Invoices"
                    value={`$${metrics?.outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
                    icon={CreditCard}
                    loading={metricsLoading}
                    valueClassName="text-xl md:text-2xl"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <BarChart
                            title="Revenue Trend"
                            description="Monthly revenue over the last 12 months"
                            data={analytics?.revenueByMonth.slice(-12).map(item => ({
                                month: item.period,
                                revenue: Math.round(item.revenue),
                                invoices: item.invoiceCount
                            })) || []}
                            xKey="month"
                            bars={[
                                { dataKey: 'revenue', fill: 'hsl(270 70% 60%)', name: 'Revenue ($)' }, // Primary Purple
                            ]}
                            height={350}
                            loading={analyticsLoading}
                        />

                        <BarChart
                            title="Invoice Aging"
                            description="Outstanding invoices by aging bucket"
                            data={analytics ? [
                                { bucket: 'Current', amount: Math.round(analytics.invoiceAging.current) },
                                { bucket: '1-30 days', amount: Math.round(analytics.invoiceAging.overdue30) },
                                { bucket: '31-60 days', amount: Math.round(analytics.invoiceAging.overdue60) },
                                { bucket: '61-90 days', amount: Math.round(analytics.invoiceAging.overdue90) },
                                { bucket: '90+ days', amount: Math.round(analytics.invoiceAging.overdue90Plus) },
                            ] : []}
                            xKey="bucket"
                            bars={[
                                { dataKey: 'amount', fill: 'hsl(180 70% 50%)', name: 'Amount ($)' }, // Electric Cyan
                            ]}
                            height={350}
                            loading={analyticsLoading}
                        />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <ActivityFeed limit={15} compact={true} />
                </div>
            </div>
        </div>
    );
}
