import { QueryClient } from '@tanstack/react-query';

// Create a query client with optimized defaults for our CRM
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 1000 * 60 * 5,
      // Keep data in cache for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry failed requests 2 times
      retry: 2,
      // Only retry on network errors, not 4xx/5xx responses
      retryOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Don't retry mutations that return 4xx errors
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Query keys for consistent cache management
export const queryKeys = {
  // Customer queries
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters: Record<string, any> = {}) =>
      [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
    stats: () => [...queryKeys.customers.all, 'stats'] as const,
  },

  // Deal queries  
  deals: {
    all: ['deals'] as const,
    lists: () => [...queryKeys.deals.all, 'list'] as const,
    list: (filters: Record<string, any> = {}) =>
      [...queryKeys.deals.lists(), filters] as const,
    details: () => [...queryKeys.deals.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.deals.details(), id] as const,
    stages: () => [...queryKeys.deals.all, 'stages'] as const,
  },

  // Invoice queries
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (filters: Record<string, any> = {}) =>
      [...queryKeys.invoices.lists(), filters] as const,
    details: () => [...queryKeys.invoices.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.invoices.details(), id] as const,
    stats: () => [...queryKeys.invoices.all, 'stats'] as const,
  },

  // Product queries
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: Record<string, any> = {}) =>
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.products.details(), id] as const,
  },

  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    dashboard: (days: number = 30) =>
      [...queryKeys.analytics.all, 'dashboard', days] as const,
    financial: () => [...queryKeys.analytics.all, 'financial'] as const,
    revenue: (period: string) =>
      [...queryKeys.analytics.all, 'revenue', period] as const,
  },

  // Activity queries
  activities: {
    all: ['activities'] as const,
    recent: (limit: number = 50) =>
      [...queryKeys.activities.all, 'recent', limit] as const,
    user: (userId: string, limit: number = 50) =>
      [...queryKeys.activities.all, 'user', userId, limit] as const,
    entity: (entityType: string, entityId: string, limit: number = 20) =>
      [...queryKeys.activities.all, 'entity', entityType, entityId, limit] as const,
  },

  // Search queries
  search: {
    all: ['search'] as const,
    global: (query: string) =>
      [...queryKeys.search.all, 'global', query] as const,
    customers: (query: string) =>
      [...queryKeys.search.all, 'customers', query] as const,
    deals: (query: string) =>
      [...queryKeys.search.all, 'deals', query] as const,
    products: (query: string) =>
      [...queryKeys.search.all, 'products', query] as const,
  },

  // Health queries
  health: {
    all: ['health'] as const,
    basic: () => [...queryKeys.health.all, 'basic'] as const,
    detailed: () => [...queryKeys.health.all, 'detailed'] as const,
  },
} as const;

// Helper function to invalidate related queries after mutations
export const invalidationHelpers = {
  customer: (customerId?: string) => {
    // Invalidate customer lists and specific customer details
    const keys: any[] = [
      queryKeys.customers.lists(),
      queryKeys.customers.stats(),
      queryKeys.analytics.dashboard(),
    ];

    if (customerId) {
      keys.push(queryKeys.customers.detail(customerId));
    }

    return keys;
  },

  deal: (dealId?: string, customerId?: string) => {
    const keys: any[] = [
      queryKeys.deals.lists(),
      queryKeys.analytics.dashboard(),
      queryKeys.analytics.financial(),
    ];

    if (dealId) {
      keys.push(queryKeys.deals.detail(dealId));
    }

    if (customerId) {
      keys.push(queryKeys.customers.detail(customerId));
    }

    return keys;
  },

  invoice: (invoiceId?: string, customerId?: string) => {
    const keys: any[] = [
      queryKeys.invoices.lists(),
      queryKeys.invoices.stats(),
      queryKeys.analytics.dashboard(),
      queryKeys.analytics.financial(),
    ];

    if (invoiceId) {
      keys.push(queryKeys.invoices.detail(invoiceId));
    }

    if (customerId) {
      keys.push(queryKeys.customers.detail(customerId));
    }

    return keys;
  },

  product: (productId?: string) => {
    const keys: any[] = [queryKeys.products.lists()];

    if (productId) {
      keys.push(queryKeys.products.detail(productId));
    }

    return keys;
  },
} as const;

// Performance monitoring for queries
export const performanceConfig = {
  // Log slow queries for monitoring
  logSlowQueries: true,
  slowQueryThreshold: 2000, // 2 seconds

  // Background refresh configuration
  backgroundRefresh: {
    // Refresh stale data when user returns to tab
    refetchOnWindowFocus: false,
    // Refresh when reconnecting to internet
    refetchOnReconnect: true,
    // Refresh when component mounts if data is stale
    refetchOnMount: true,
  },

  // Cache optimization
  cache: {
    // Maximum number of queries to keep in cache
    maxQueries: 1000,
    // Default cache time (10 minutes)
    defaultCacheTime: 1000 * 60 * 10,
    // Time before data is considered stale (5 minutes)
    defaultStaleTime: 1000 * 60 * 5,
  },
} as const;