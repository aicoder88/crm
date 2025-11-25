'use client';

import { useState, useEffect } from 'react';
import { Shield, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: { status: string; responseTime: number };
    memory: { status: string };
    environment: { status: string };
  };
}

interface HealthStatusIndicatorProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  compact?: boolean;
}

export function HealthStatusIndicator({ 
  autoRefresh = true, 
  refreshInterval = 60000, // 1 minute
  compact = true 
}: HealthStatusIndicatorProps) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/health');
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealth, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getStatusConfig = (status?: string) => {
    switch (status) {
      case 'healthy':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          label: 'Healthy',
          variant: 'secondary' as const
        };
      case 'degraded':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          label: 'Degraded',
          variant: 'outline' as const
        };
      case 'unhealthy':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          label: 'Unhealthy',
          variant: 'destructive' as const
        };
      default:
        return {
          icon: Activity,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          label: 'Unknown',
          variant: 'outline' as const
        };
    }
  };

  const formatUptime = (uptime: number) => {
    const minutes = Math.floor(uptime / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (loading && !health) {
    return compact ? (
      <Badge variant="outline" className="animate-pulse">
        <Activity className="h-3 w-3 mr-1 animate-spin" />
        ...
      </Badge>
    ) : (
      <Button variant="ghost" size="sm" disabled>
        <Activity className="h-4 w-4 mr-2 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (error) {
    const config = getStatusConfig('unhealthy');
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {compact ? (
              <Badge 
                variant={config.variant}
                className={`${config.bgColor} ${config.color} cursor-pointer`}
                onClick={fetchHealth}
              >
                <config.icon className="h-3 w-3" />
              </Badge>
            ) : (
              <Button variant="ghost" size="sm" onClick={fetchHealth}>
                <config.icon className={`h-4 w-4 mr-2 ${config.color}`} />
                System Error
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium text-red-500">Health Check Failed</div>
              <div className="text-xs text-muted-foreground mt-1">{error}</div>
              <div className="text-xs mt-2">Click to retry</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!health) {
    return null;
  }

  const config = getStatusConfig(health.status);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {compact ? (
            <Badge 
              variant={config.variant}
              className={`${config.bgColor} ${config.color} cursor-pointer`}
              onClick={fetchHealth}
            >
              <config.icon className="h-3 w-3 mr-1" />
              {health.status === 'healthy' ? '✓' : health.status === 'degraded' ? '⚠' : '✗'}
            </Badge>
          ) : (
            <Button variant="ghost" size="sm" onClick={fetchHealth}>
              <config.icon className={`h-4 w-4 mr-2 ${config.color}`} />
              System {config.label}
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <config.icon className={`h-4 w-4 ${config.color}`} />
              <span className="font-medium">System {config.label}</span>
            </div>
            
            <div className="space-y-1 text-xs">
              <div>Uptime: {formatUptime(health.uptime)}</div>
              <div>Database: {health.checks.database.responseTime}ms</div>
              <div>Memory: {health.checks.memory.status}</div>
              <div>Environment: {health.checks.environment.status}</div>
            </div>
            
            <div className="text-xs text-muted-foreground border-t pt-2">
              Last updated: {new Date(health.timestamp).toLocaleTimeString()}
              <br />
              Click to refresh
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}