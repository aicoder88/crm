import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface DetailedHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  build: {
    commit: string;
    branch: string;
    buildDate: string;
  };
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      connections?: number;
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
      external: number;
      rss: number;
    };
    environment: {
      status: 'healthy' | 'unhealthy';
      node_env: string;
      region: string;
      nodeVersion: string;
      platform: string;
      cpuUsage: {
        user: number;
        system: number;
      };
      missingEnvVars?: string[];
    };
    external: {
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

const startTime = Date.now();

export async function GET(request: NextRequest) {
  const healthCheck: DetailedHealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    version: process.env.npm_package_version || '1.0.0',
    build: {
      commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      branch: process.env.VERCEL_GIT_COMMIT_REF || 'unknown',
      buildDate: process.env.BUILD_DATE || new Date().toISOString()
    },
    checks: {
      database: {
        status: 'healthy',
        responseTime: 0
      },
      memory: {
        status: 'healthy',
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0
      },
      environment: {
        status: 'healthy',
        node_env: process.env.NODE_ENV || 'development',
        region: process.env.VERCEL_REGION || 'local',
        nodeVersion: process.version,
        platform: process.platform,
        cpuUsage: process.cpuUsage()
      },
      external: {
        status: 'healthy',
        services: {
          supabase: {
            status: 'healthy'
          }
        }
      }
    }
  };

  try {
    // Database comprehensive health check
    const dbStart = Date.now();
    const supabase = await createClient();
    
    // Test basic connectivity and get table counts
    const [customersResult, dealsResult, invoicesResult] = await Promise.allSettled([
      supabase.from('customers').select('count', { count: 'exact', head: true }),
      supabase.from('deals').select('count', { count: 'exact', head: true }),
      supabase.from('invoices').select('count', { count: 'exact', head: true })
    ]);

    const dbResponseTime = Date.now() - dbStart;
    
    // Check if any database queries failed
    const dbErrors = [customersResult, dealsResult, invoicesResult]
      .filter(result => result.status === 'rejected')
      .map(result => (result as PromiseRejectedResult).reason);

    if (dbErrors.length > 0) {
      healthCheck.checks.database = {
        status: 'unhealthy',
        responseTime: dbResponseTime,
        error: `Database errors: ${dbErrors.map(e => e.message).join(', ')}`
      };
      healthCheck.status = 'unhealthy';
    } else {
      // Extract counts from successful results
      const queries = {
        customers: customersResult.status === 'fulfilled' ? 
          (customersResult.value.count || 0) : 0,
        deals: dealsResult.status === 'fulfilled' ? 
          (dealsResult.value.count || 0) : 0,
        invoices: invoicesResult.status === 'fulfilled' ? 
          (invoicesResult.value.count || 0) : 0
      };

      healthCheck.checks.database = {
        status: dbResponseTime > 2000 ? 'unhealthy' : 'healthy',
        responseTime: dbResponseTime,
        queries
      };
      
      if (dbResponseTime > 2000) {
        healthCheck.status = 'degraded';
      }
    }

    // Memory usage detailed check
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const externalMB = Math.round(memUsage.external / 1024 / 1024);
    const rssMB = Math.round(memUsage.rss / 1024 / 1024);
    
    healthCheck.checks.memory = {
      status: heapUsedMB > heapTotalMB * 0.9 ? 'unhealthy' : 
              heapUsedMB > heapTotalMB * 0.7 ? 'degraded' : 'healthy',
      heapUsed: heapUsedMB,
      heapTotal: heapTotalMB,
      external: externalMB,
      rss: rssMB
    };
    
    if (healthCheck.checks.memory.status === 'unhealthy') {
      healthCheck.status = 'unhealthy';
    } else if (healthCheck.checks.memory.status === 'degraded' && healthCheck.status !== 'unhealthy') {
      healthCheck.status = 'degraded';
    }

    // Environment comprehensive check
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      healthCheck.checks.environment.status = 'unhealthy';
      healthCheck.checks.environment.missingEnvVars = missingEnvVars;
      healthCheck.status = 'unhealthy';
    }

    // External services check
    const supabaseStart = Date.now();
    try {
      // Test Supabase connectivity with a simple query
      const { error: supabaseError } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1)
        .single();

      const supabaseResponseTime = Date.now() - supabaseStart;
      
      if (supabaseError) {
        healthCheck.checks.external.services.supabase = {
          status: 'unhealthy',
          responseTime: supabaseResponseTime,
          error: supabaseError.message
        };
        healthCheck.checks.external.status = 'unhealthy';
        healthCheck.status = 'unhealthy';
      } else {
        healthCheck.checks.external.services.supabase = {
          status: supabaseResponseTime > 1500 ? 'unhealthy' : 'healthy',
          responseTime: supabaseResponseTime
        };
        
        if (supabaseResponseTime > 1500) {
          healthCheck.checks.external.status = 'degraded';
          if (healthCheck.status !== 'unhealthy') {
            healthCheck.status = 'degraded';
          }
        }
      }
    } catch (supabaseError) {
      healthCheck.checks.external.services.supabase = {
        status: 'unhealthy',
        error: supabaseError instanceof Error ? supabaseError.message : 'Unknown error'
      };
      healthCheck.checks.external.status = 'unhealthy';
      healthCheck.status = 'unhealthy';
    }

    // Set appropriate HTTP status code
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
    console.error('Health check error:', error);
    
    // Return minimal unhealthy status
    const errorHealth: DetailedHealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - startTime,
      version: process.env.npm_package_version || '1.0.0',
      build: {
        commit: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
        branch: process.env.VERCEL_GIT_COMMIT_REF || 'unknown',
        buildDate: process.env.BUILD_DATE || new Date().toISOString()
      },
      checks: {
        database: {
          status: 'unhealthy',
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        memory: process.memoryUsage ? {
          status: 'healthy',
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
        } : {
          status: 'healthy',
          heapUsed: 0,
          heapTotal: 0,
          external: 0,
          rss: 0
        },
        environment: {
          status: 'healthy',
          node_env: process.env.NODE_ENV || 'development',
          region: process.env.VERCEL_REGION || 'local',
          nodeVersion: process.version,
          platform: process.platform,
          cpuUsage: process.cpuUsage()
        },
        external: {
          status: 'unhealthy',
          services: {
            supabase: {
              status: 'unhealthy',
              error: 'Health check failed'
            }
          }
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