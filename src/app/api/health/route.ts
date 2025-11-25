import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
    memory: {
      status: 'healthy' | 'degraded' | 'unhealthy';
      usage: number;
      limit: number;
    };
    environment: {
      status: 'healthy';
      node_env: string;
      region: string;
    };
  };
}

const startTime = Date.now();

export async function GET(request: NextRequest) {
  const healthCheck: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: {
        status: 'healthy'
      },
      memory: {
        status: 'healthy',
        usage: 0,
        limit: 0
      },
      environment: {
        status: 'healthy',
        node_env: process.env.NODE_ENV || 'development',
        region: process.env.VERCEL_REGION || 'local'
      }
    }
  };

  try {
    // Database health check
    const dbStart = Date.now();
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('customers')
      .select('count')
      .limit(1)
      .single();

    const dbResponseTime = Date.now() - dbStart;
    
    if (error) {
      healthCheck.checks.database = {
        status: 'unhealthy',
        responseTime: dbResponseTime,
        error: error.message
      };
      healthCheck.status = 'unhealthy';
    } else {
      healthCheck.checks.database = {
        status: 'healthy',
        responseTime: dbResponseTime
      };
      
      // Slow database response indicates degraded performance
      if (dbResponseTime > 1000) {
        healthCheck.checks.database.status = 'unhealthy';
        healthCheck.status = 'degraded';
      }
    }

    // Memory usage check (Edge runtime has limitations)
    try {
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memUsage = process.memoryUsage();
        const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
        const limitMB = Math.round(memUsage.heapTotal / 1024 / 1024);
        
        healthCheck.checks.memory = {
          status: usedMB > limitMB * 0.9 ? 'unhealthy' : usedMB > limitMB * 0.7 ? 'degraded' : 'healthy',
          usage: usedMB,
          limit: limitMB
        };
        
        if (healthCheck.checks.memory.status === 'unhealthy') {
          healthCheck.status = 'unhealthy';
        } else if (healthCheck.checks.memory.status === 'degraded' && healthCheck.status !== 'unhealthy') {
          healthCheck.status = 'degraded';
        }
      }
    } catch (memError) {
      // Memory check not available in edge runtime
      healthCheck.checks.memory = {
        status: 'healthy',
        usage: 0,
        limit: 0
      };
    }

    // Environment check
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      healthCheck.status = 'unhealthy';
      healthCheck.checks.environment = {
        status: 'healthy', // Keep as healthy but note in logs
        node_env: process.env.NODE_ENV || 'development',
        region: process.env.VERCEL_REGION || 'local'
      };
    }

    // Set appropriate HTTP status code based on health
    const httpStatus = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 207 : 503;

    return NextResponse.json(healthCheck, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    // Unexpected error in health check
    const errorHealth: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: {
          status: 'unhealthy',
          error: error instanceof Error ? error.message : 'Unknown database error'
        },
        memory: {
          status: 'healthy',
          usage: 0,
          limit: 0
        },
        environment: {
          status: 'healthy',
          node_env: process.env.NODE_ENV || 'development',
          region: process.env.VERCEL_REGION || 'local'
        }
      }
    };

    return NextResponse.json(errorHealth, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
}