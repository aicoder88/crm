'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys, invalidationHelpers } from '@/lib/react-query';
import { Customer } from '@/types';
import { toast } from 'sonner';

interface CustomerFilters {
  status?: string[];
  city?: string[];
  province?: string[];
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

interface CustomerQueryData {
  customers: Customer[];
  totalCount: number;
}

// Fetch customers with filters and pagination
export function useCustomers(filters: CustomerFilters = {}) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: async (): Promise<CustomerQueryData> => {
      let query = supabase
        .from('customers')
        .select(`
          id,
          store_name,
          email,
          phone,
          city,
          province,
          postal_code,
          status,
          type,
          notes,
          created_at,
          updated_at,
          customer_tags (
            tags (
              id,
              name,
              color
            )
          ),
          customer_contacts (id, name, role, email, phone),
          customer_social_media (id, platform, url)
        `, { count: 'exact' });

      // Apply filters
      if (filters.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters.city?.length) {
        query = query.in('city', filters.city);
      }

      if (filters.province?.length) {
        query = query.in('province', filters.province);
      }

      if (filters.search) {
        query = query.or(`
          store_name.ilike.%${filters.search}%,
          email.ilike.%${filters.search}%,
          phone.ilike.%${filters.search}%,
          city.ilike.%${filters.search}%
        `);
      }

      // Apply pagination
      if (filters.offset !== undefined && filters.limit) {
        query = query.range(filters.offset, filters.offset + filters.limit - 1);
      } else if (filters.limit) {
        query = query.limit(filters.limit);
      }

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch customers: ${error.message}`);
      }

      // Transform the data to include tags and contacts properly
      const transformedCustomers = data?.map((c: any) => ({
        ...c,
        tags: c.customer_tags?.map((ct: any) => ct.tags) || [],
        contacts: c.customer_contacts || [],
        social_media: c.customer_social_media || []
      })) || [];

      return {
        customers: transformedCustomers,
        totalCount: count || 0
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Fetch a single customer by ID
export function useCustomer(customerId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.customers.detail(customerId || ''),
    queryFn: async (): Promise<Customer> => {
      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          customer_tags (
            tags (
              id,
              name,
              color
            )
          ),
          customer_contacts (*),
          customer_addresses (*),
          customer_social_media (*),
          deals (*),
          invoices (*)
        `)
        .eq('id', customerId)
        .single();

      if (error) {
        throw new Error(`Failed to fetch customer: ${error.message}`);
      }

      // Transform the data
      return {
        ...data,
        tags: data.customer_tags?.map((ct: any) => ct.tags) || [],
        contacts: data.customer_contacts || [],
        addresses: data.customer_addresses || [],
        social_media: data.customer_social_media || [],
        deals: data.deals || [],
        invoices: data.invoices || []
      };
    },
    enabled: !!customerId,
    staleTime: 1000 * 60 * 5, // 5 minutes for individual customers
  });
}

// Fetch customer statistics
export function useCustomersStats() {
  const supabase = createClient();

  return useQuery({
    queryKey: queryKeys.customers.stats(),
    queryFn: async () => {
      const [totalResult, statusResult] = await Promise.all([
        supabase
          .from('customers')
          .select('count', { count: 'exact', head: true }),
        supabase
          .from('customers')
          .select('status')
          .not('status', 'is', null)
      ]);

      if (totalResult.error) {
        throw new Error(`Failed to fetch customer stats: ${totalResult.error.message}`);
      }

      if (statusResult.error) {
        throw new Error(`Failed to fetch customer status stats: ${statusResult.error.message}`);
      }

      // Count customers by status
      const statusCounts = (statusResult.data || []).reduce((acc: Record<string, number>, customer: any) => {
        acc[customer.status] = (acc[customer.status] || 0) + 1;
        return acc;
      }, {});

      return {
        total: totalResult.count || 0,
        byStatus: statusCounts
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Create customer mutation
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (customerData: Partial<Customer>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create customer: ${error.message}`);
      }

      return data;
    },
    onSuccess: (newCustomer) => {
      // Invalidate and refetch customer-related queries
      invalidationHelpers.customer().forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });

      toast.success('Customer created successfully');
    },
    onError: (error) => {
      toast.error(`Failed to create customer: ${error.message}`);
    },
  });
}

// Update customer mutation
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Customer> & { id: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update customer: ${error.message}`);
      }

      return data;
    },
    onSuccess: (updatedCustomer) => {
      // Update the specific customer in cache
      queryClient.setQueryData(
        queryKeys.customers.detail(updatedCustomer.id),
        updatedCustomer
      );

      // Invalidate customer lists and stats
      invalidationHelpers.customer(updatedCustomer.id).forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });

      toast.success('Customer updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update customer: ${error.message}`);
    },
  });
}

// Delete customer mutation
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) {
        throw new Error(`Failed to delete customer: ${error.message}`);
      }

      return customerId;
    },
    onSuccess: (deletedCustomerId) => {
      // Remove the customer from cache
      queryClient.removeQueries({
        queryKey: queryKeys.customers.detail(deletedCustomerId)
      });

      // Invalidate customer lists and stats
      invalidationHelpers.customer().forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });

      toast.success('Customer deleted successfully');
    },
    onError: (error) => {
      toast.error(`Failed to delete customer: ${error.message}`);
    },
  });
}