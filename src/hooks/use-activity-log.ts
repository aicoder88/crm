'use client';

import { useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

export type ActivityCategory =
  | 'auth'
  | 'customer'
  | 'deal'
  | 'invoice'
  | 'product'
  | 'task'
  | 'email'
  | 'shipment'
  | 'system'
  | 'export'
  | 'import';

export interface LogActivityParams {
  action: string;
  category: ActivityCategory;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ActivityLog {
  id: string;
  user_email: string;
  action: string;
  category: ActivityCategory;
  entity_type: string | null;
  entity_id: string | null;
  entity_name: string | null;
  action_display: string;
  entity_url: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export function useActivityLog() {
  const supabase = createClient();

  const logActivity = useCallback(async ({
    action,
    category,
    entityType,
    entityId,
    entityName,
    oldData,
    newData,
    metadata = {}
  }: LogActivityParams): Promise<string | null> => {
    try {
      // Get client info
      const userAgent = navigator.userAgent;
      const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();

      // Store session ID for future use
      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', sessionId);
      }

      const { data, error } = await supabase.rpc('log_activity', {
        p_action: action,
        p_category: category,
        p_entity_type: entityType || null,
        p_entity_id: entityId || null,
        p_entity_name: entityName || null,
        p_old_data: oldData ? JSON.stringify(oldData) : null,
        p_new_data: newData ? JSON.stringify(newData) : null,
        p_metadata: JSON.stringify({
          ...metadata,
          timestamp: new Date().toISOString(),
          url: window.location.pathname
        }),
        p_user_agent: userAgent,
        p_session_id: sessionId
      });

      if (error) {
        logger.error('Failed to log activity', error instanceof Error ? error : new Error(String(error)));
        return null;
      }

      return data;
    } catch (err) {
      logger.error('Activity logging error', err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, [supabase]);

  const getRecentActivities = useCallback(async (limit: number = 50): Promise<ActivityLog[]> => {
    try {
      const { data, error } = await supabase
        .from('recent_activities')
        .select('*')
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      logger.error('Failed to fetch activities', err instanceof Error ? err : new Error(String(err)));
      return [];
    }
  }, [supabase]);

  const getUserActivities = useCallback(async (userId: string, limit: number = 50): Promise<ActivityLog[]> => {
    try {
      const { data, error } = await supabase
        .from('recent_activities')
        .select('*')
        .eq('user_id', userId)
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      logger.error('Failed to fetch user activities', err instanceof Error ? err : new Error(String(err)));
      return [];
    }
  }, [supabase]);

  const getEntityActivities = useCallback(async (
    entityType: string,
    entityId: string,
    limit: number = 20
  ): Promise<ActivityLog[]> => {
    try {
      const { data, error } = await supabase
        .from('recent_activities')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      logger.error('Failed to fetch entity activities', err instanceof Error ? err : new Error(String(err)));
      return [];
    }
  }, [supabase]);

  // Convenience methods for common actions
  const logCustomerAction = useCallback((
    action: 'viewed' | 'created' | 'updated' | 'deleted' | 'exported',
    customerId: string,
    customerName: string,
    oldData?: Record<string, any>,
    newData?: Record<string, any>
  ) => {
    return logActivity({
      action: `customer_${action}`,
      category: 'customer',
      entityType: 'customer',
      entityId: customerId,
      entityName: customerName,
      oldData,
      newData
    });
  }, [logActivity]);

  const logDealAction = useCallback((
    action: 'viewed' | 'created' | 'updated' | 'deleted' | 'stage_changed',
    dealId: string,
    dealTitle: string,
    oldData?: Record<string, any>,
    newData?: Record<string, any>
  ) => {
    return logActivity({
      action: `deal_${action}`,
      category: 'deal',
      entityType: 'deal',
      entityId: dealId,
      entityName: dealTitle,
      oldData,
      newData
    });
  }, [logActivity]);

  const logExportAction = useCallback((
    entityType: string,
    format: string,
    count: number
  ) => {
    return logActivity({
      action: 'data_exported',
      category: 'export',
      entityType,
      metadata: {
        format,
        record_count: count,
        export_type: entityType
      }
    });
  }, [logActivity]);

  const logAuthAction = useCallback((
    action: 'login' | 'logout' | 'signup' | 'password_reset'
  ) => {
    return logActivity({
      action: `auth_${action}`,
      category: 'auth',
      metadata: {
        login_method: 'email'
      }
    });
  }, [logActivity]);

  return {
    logActivity,
    getRecentActivities,
    getUserActivities,
    getEntityActivities,
    logCustomerAction,
    logDealAction,
    logExportAction,
    logAuthAction
  };
}