'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/react-query';

interface DashboardMetrics {
  totalCustomers: number;
  activeDeals: number;
  monthlyRevenue: number;
  outstandingAmount: number;
  customerGrowth?: number;
  dealGrowth?: number;
  revenueGrowth?: number;
}

interface RevenueData {
  period: string;
  revenue: number;
  invoiceCount: number;
}

interface InvoiceAging {
  current: number;
  overdue30: number;
  overdue60: number;
  overdue90: number;
  overdue90Plus: number;
}

interface FinancialAnalytics {
  revenueByMonth: RevenueData[];
  invoiceAging: InvoiceAging;
  topCustomers: Array<{
    customer_name: string;
    total_revenue: number;
    invoice_count: number;
  }>;
}

// Dashboard metrics with growth calculations
export function useDashboardMetrics(days: number = 30) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.analytics.dashboard(days),
    queryFn: async (): Promise<DashboardMetrics> => {
      const currentDate = new Date();
      const startDate = new Date();
      startDate.setDate(currentDate.getDate() - days);
      const prevStartDate = new Date();
      prevStartDate.setDate(startDate.getDate() - days);

      // Fetch current period metrics
      const [
        customersResult,
        dealsResult,
        revenueResult,
        outstandingResult,
        prevCustomersResult,
        prevDealsResult,
        prevRevenueResult
      ] = await Promise.all([
        // Current period
        supabase
          .from('customers')
          .select('count', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString()),
          
        supabase
          .from('deals')
          .select('count', { count: 'exact', head: true })
          .neq('stage', 'Closed Won')
          .neq('stage', 'Closed Lost'),
          
        supabase
          .from('invoices')
          .select('total')
          .eq('status', 'paid')
          .gte('paid_date', startDate.toISOString()),
          
        supabase
          .from('invoices')
          .select('total')
          .in('status', ['sent', 'overdue']),

        // Previous period for growth calculation
        supabase
          .from('customers')
          .select('count', { count: 'exact', head: true })
          .gte('created_at', prevStartDate.toISOString())
          .lt('created_at', startDate.toISOString()),
          
        supabase
          .from('deals')
          .select('count', { count: 'exact', head: true })
          .neq('stage', 'Closed Won')
          .neq('stage', 'Closed Lost')
          .gte('created_at', prevStartDate.toISOString())
          .lt('created_at', startDate.toISOString()),
          
        supabase
          .from('invoices')
          .select('total')
          .eq('status', 'paid')
          .gte('paid_date', prevStartDate.toISOString())
          .lt('paid_date', startDate.toISOString()),
      ]);

      // Calculate current metrics
      const totalCustomers = customersResult.count || 0;
      const activeDeals = dealsResult.count || 0;
      const monthlyRevenue = revenueResult.data?.reduce((sum, invoice) => 
        sum + (Number(invoice.total) || 0), 0) || 0;
      const outstandingAmount = outstandingResult.data?.reduce((sum, invoice) => 
        sum + (Number(invoice.total) || 0), 0) || 0;

      // Calculate growth percentages
      const prevTotalCustomers = prevCustomersResult.count || 0;
      const prevActiveDeals = prevDealsResult.count || 0;
      const prevMonthlyRevenue = prevRevenueResult.data?.reduce((sum, invoice) => 
        sum + (Number(invoice.total) || 0), 0) || 0;

      const customerGrowth = prevTotalCustomers > 0 
        ? ((totalCustomers - prevTotalCustomers) / prevTotalCustomers) * 100 
        : undefined;
      const dealGrowth = prevActiveDeals > 0 
        ? ((activeDeals - prevActiveDeals) / prevActiveDeals) * 100 
        : undefined;
      const revenueGrowth = prevMonthlyRevenue > 0 
        ? ((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100 
        : undefined;

      return {
        totalCustomers,
        activeDeals,
        monthlyRevenue,
        outstandingAmount,
        customerGrowth,
        dealGrowth,
        revenueGrowth
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Financial analytics with revenue trends and invoice aging
export function useFinancialAnalytics() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.analytics.financial(),
    queryFn: async (): Promise<FinancialAnalytics> => {
      const [revenueResult, agingResult, topCustomersResult] = await Promise.all([
        // Revenue by month for the last 12 months
        supabase.rpc('get_monthly_revenue', { months_back: 12 }),
        
        // Invoice aging buckets
        supabase.rpc('get_invoice_aging'),
        
        // Top customers by revenue
        supabase.rpc('get_top_customers', { limit_count: 10 })
      ]);

      // Handle potential RPC function errors
      const revenueByMonth = revenueResult.data || [];
      const invoiceAging = agingResult.data?.[0] || {
        current: 0,
        overdue30: 0,
        overdue60: 0,
        overdue90: 0,
        overdue90Plus: 0
      };
      const topCustomers = topCustomersResult.data || [];

      return {
        revenueByMonth,
        invoiceAging,
        topCustomers
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes (financial data changes less frequently)
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Revenue analytics for specific periods
export function useRevenueAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month', timeframe: number = 12) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.analytics.revenue(`${period}-${timeframe}`),
    queryFn: async (): Promise<RevenueData[]> => {
      let rpcFunction: string;
      
      switch (period) {
        case 'day':
          rpcFunction = 'get_daily_revenue';
          break;
        case 'week':
          rpcFunction = 'get_weekly_revenue';
          break;
        case 'year':
          rpcFunction = 'get_yearly_revenue';
          break;
        case 'month':
        default:
          rpcFunction = 'get_monthly_revenue';
          break;
      }

      const { data, error } = await supabase.rpc(rpcFunction, { 
        [`${period}s_back`]: timeframe 
      });

      if (error) {
        throw new Error(`Failed to fetch revenue analytics: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Customer acquisition analytics
export function useCustomerAnalytics(months: number = 12) {
  const supabase = createClient();

  return useQuery({
    queryKey: [...queryKeys.analytics.all, 'customers', months],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_customer_acquisition', { 
        months_back: months 
      });

      if (error) {
        throw new Error(`Failed to fetch customer analytics: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 20, // 20 minutes
  });
}

// Deal pipeline analytics
export function useDealPipelineAnalytics() {
  const supabase = createClient();

  return useQuery({
    queryKey: [...queryKeys.analytics.all, 'pipeline'],
    queryFn: async () => {
      const [stageResult, conversionResult] = await Promise.all([
        supabase.rpc('get_deals_by_stage'),
        supabase.rpc('get_conversion_rates')
      ]);

      return {
        byStage: stageResult.data || [],
        conversionRates: conversionResult.data || []
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
  });
}