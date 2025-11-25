import { LRUCache } from 'lru-cache';

type RateLimitConfig = {
  interval: number; // Time window in milliseconds
  limit: number; // Max requests per window
};

const rateLimitCache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 60000, // 1 minute
});

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { interval: 60000, limit: 10 }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const { interval, limit } = config;
  
  const timestamps = rateLimitCache.get(identifier) || [];
  const recent = timestamps.filter(t => now - t < interval);
  
  if (recent.length >= limit) {
    const oldestRequest = Math.min(...recent);
    const reset = oldestRequest + interval;
    
    return {
      success: false,
      limit,
      remaining: 0,
      reset: Math.ceil(reset / 1000), // Convert to seconds
    };
  }
  
  recent.push(now);
  rateLimitCache.set(identifier, recent);
  
  return {
    success: true,
    limit,
    remaining: limit - recent.length,
    reset: Math.ceil((now + interval) / 1000), // Convert to seconds
  };
}

export function getRateLimitHeaders(result: ReturnType<typeof rateLimit>) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  default: { interval: 60000, limit: 60 }, // 60 requests per minute
  auth: { interval: 60000, limit: 5 }, // 5 auth attempts per minute
  email: { interval: 60000, limit: 10 }, // 10 emails per minute
  shipments: { interval: 60000, limit: 30 }, // 30 shipment requests per minute
  webhooks: { interval: 60000, limit: 100 }, // 100 webhook calls per minute
} as const;