/**
 * Health check utilities for monitoring system status
 */

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  error?: string;
  details?: Record<string, any>;
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: Record<string, HealthCheckResult>;
}

/**
 * Calculate overall health status from individual checks
 */
export function calculateOverallHealth(checks: Record<string, HealthCheckResult>): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(checks).map(check => check.status);
  
  if (statuses.some(status => status === 'unhealthy')) {
    return 'unhealthy';
  }
  
  if (statuses.some(status => status === 'degraded')) {
    return 'degraded';
  }
  
  return 'healthy';
}

/**
 * Format response time for display
 */
export function formatResponseTime(ms: number): string {
  if (ms < 100) {
    return `${Math.round(ms)}ms`;
  } else if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  } else {
    return `${(ms / 1000).toFixed(1)}s`;
  }
}

/**
 * Format memory usage for display
 */
export function formatMemoryUsage(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  if (mb < 1024) {
    return `${Math.round(mb)}MB`;
  } else {
    return `${(mb / 1024).toFixed(1)}GB`;
  }
}

/**
 * Format uptime for display
 */
export function formatUptime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Determine health status based on response time thresholds
 */
export function getHealthFromResponseTime(
  responseTime: number, 
  degradedThreshold: number = 1000,
  unhealthyThreshold: number = 2000
): 'healthy' | 'degraded' | 'unhealthy' {
  if (responseTime > unhealthyThreshold) {
    return 'unhealthy';
  } else if (responseTime > degradedThreshold) {
    return 'degraded';
  }
  return 'healthy';
}

/**
 * Determine memory health status based on usage percentage
 */
export function getMemoryHealth(
  used: number, 
  total: number,
  degradedThreshold: number = 0.7,
  unhealthyThreshold: number = 0.9
): 'healthy' | 'degraded' | 'unhealthy' {
  const usagePercent = used / total;
  
  if (usagePercent > unhealthyThreshold) {
    return 'unhealthy';
  } else if (usagePercent > degradedThreshold) {
    return 'degraded';
  }
  return 'healthy';
}

/**
 * Create a health check result
 */
export function createHealthCheck(
  status: 'healthy' | 'degraded' | 'unhealthy',
  responseTime: number,
  error?: string,
  details?: Record<string, any>
): HealthCheckResult {
  return {
    status,
    responseTime,
    error,
    details
  };
}

/**
 * Validate environment variables
 */
export function validateEnvironment(requiredVars: string[]): {
  isValid: boolean;
  missingVars: string[];
} {
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}

/**
 * Health status icons and colors for UI
 */
export const HEALTH_CONFIG = {
  healthy: {
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    label: 'Healthy',
    icon: '✓'
  },
  degraded: {
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    label: 'Degraded',
    icon: '⚠'
  },
  unhealthy: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    label: 'Unhealthy',
    icon: '✗'
  }
} as const;

/**
 * Get health configuration for a status
 */
export function getHealthConfig(status: 'healthy' | 'degraded' | 'unhealthy') {
  return HEALTH_CONFIG[status];
}

/**
 * Health check priorities for determining which issues to show first
 */
export const HEALTH_PRIORITIES = {
  database: 1,
  external: 2,
  memory: 3,
  environment: 4,
  storage: 5,
  network: 6
} as const;

/**
 * Sort health checks by priority
 */
export function sortHealthChecksByPriority(checks: Record<string, HealthCheckResult>): Array<[string, HealthCheckResult]> {
  return Object.entries(checks).sort(([a], [b]) => {
    const priorityA = HEALTH_PRIORITIES[a as keyof typeof HEALTH_PRIORITIES] || 999;
    const priorityB = HEALTH_PRIORITIES[b as keyof typeof HEALTH_PRIORITIES] || 999;
    return priorityA - priorityB;
  });
}