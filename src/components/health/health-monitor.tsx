'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Database, 
  Server, 
  Globe, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  build?: {
    commit: string;
    branch: string;
    buildDate: string;
  };
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      queries?: {
        customers: number;
        deals: number;
        invoices: number;
      };
      error?: string;
    };
    memory: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      heapUsed: number;
      heapTotal: number;
      external?: number;
      rss?: number;
    };
    environment: {
      status: 'healthy' | 'unhealthy';
      node_env: string;
      region: string;
      nodeVersion?: string;
      platform?: string;
      missingEnvVars?: string[];
    };
    external?: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      services: {
        supabase: {
          status: 'healthy' | 'unhealthy';
          responseTime?: number;
          error?: string;
        };
      };
    };
  };
}

interface HealthMonitorProps {
  detailed?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function HealthMonitor({ 
  detailed = false, 
  autoRefresh = true, 
  refreshInterval = 30000 
}: HealthMonitorProps) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch(detailed ? '/api/health/detailed' : '/api/health');
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      setHealth(data);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
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
  }, [detailed, autoRefresh, refreshInterval]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'degraded':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case 'unhealthy':
        return 'bg-red-500/10 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  const formatUptime = (uptime: number) => {
    const seconds = Math.floor(uptime / 1000);
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
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading && !health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">Loading health status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Health
            <Badge variant="outline" className="ml-auto bg-red-500/10 text-red-700 dark:text-red-300">
              Error
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button onClick={fetchHealth} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!health) {
    return null;
  }

  const memoryUsagePercent = health.checks.memory.heapTotal > 0 
    ? Math.round((health.checks.memory.heapUsed / health.checks.memory.heapTotal) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          System Health
          <Badge 
            variant="outline" 
            className={`ml-auto ${getStatusColor(health.status)}`}
          >
            {getStatusIcon(health.status)}
            <span className="ml-1 capitalize">{health.status}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Uptime:</span>
            <span className="ml-2 font-medium">{formatUptime(health.uptime)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Version:</span>
            <span className="ml-2 font-medium">{health.version}</span>
          </div>
          <div className="col-span-2">
            <span className="text-muted-foreground">Last Check:</span>
            <span className="ml-2 font-medium">{formatTimestamp(health.timestamp)}</span>
          </div>
        </div>

        {/* Build Info (if detailed) */}
        {health.build && detailed && (
          <div className="grid grid-cols-1 gap-2 text-xs border-t pt-4">
            <div>
              <span className="text-muted-foreground">Commit:</span>
              <span className="ml-2 font-mono">{health.build.commit.slice(0, 8)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Branch:</span>
              <span className="ml-2 font-medium">{health.build.branch}</span>
            </div>
          </div>
        )}

        {/* Service Checks */}
        <div className="space-y-4">
          {/* Database */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Database</div>
                <div className="text-xs text-muted-foreground">
                  Response: {health.checks.database.responseTime}ms
                  {health.checks.database.queries && detailed && (
                    <span className="ml-2">
                      • {health.checks.database.queries.customers} customers
                      • {health.checks.database.queries.deals} deals
                      • {health.checks.database.queries.invoices} invoices
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={getStatusColor(health.checks.database.status)}
            >
              {getStatusIcon(health.checks.database.status)}
            </Badge>
          </div>

          {/* Memory */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3 flex-1">
              <Server className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">Memory</div>
                <div className="text-xs text-muted-foreground mb-2">
                  {health.checks.memory.heapUsed}MB / {health.checks.memory.heapTotal}MB
                  {detailed && health.checks.memory.rss && (
                    <span className="ml-2">• RSS: {health.checks.memory.rss}MB</span>
                  )}
                </div>
                {health.checks.memory.heapTotal > 0 && (
                  <Progress 
                    value={memoryUsagePercent} 
                    className="h-2"
                  />
                )}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={getStatusColor(health.checks.memory.status)}
            >
              {getStatusIcon(health.checks.memory.status)}
            </Badge>
          </div>

          {/* Environment */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Environment</div>
                <div className="text-xs text-muted-foreground">
                  {health.checks.environment.node_env} • {health.checks.environment.region}
                  {detailed && health.checks.environment.nodeVersion && (
                    <span className="ml-2">• Node {health.checks.environment.nodeVersion}</span>
                  )}
                </div>
                {health.checks.environment.missingEnvVars?.length && (
                  <div className="text-xs text-red-600 mt-1">
                    Missing: {health.checks.environment.missingEnvVars.join(', ')}
                  </div>
                )}
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={getStatusColor(health.checks.environment.status)}
            >
              {getStatusIcon(health.checks.environment.status)}
            </Badge>
          </div>

          {/* External Services (if detailed) */}
          {health.checks.external && detailed && (
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">External Services</div>
                  <div className="text-xs text-muted-foreground">
                    Supabase: {health.checks.external.services.supabase.responseTime 
                      ? `${health.checks.external.services.supabase.responseTime}ms`
                      : 'N/A'
                    }
                  </div>
                  {health.checks.external.services.supabase.error && (
                    <div className="text-xs text-red-600 mt-1">
                      {health.checks.external.services.supabase.error}
                    </div>
                  )}
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={getStatusColor(health.checks.external.status)}
              >
                {getStatusIcon(health.checks.external.status)}
              </Badge>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchHealth}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}