import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getRateLimitHeaders, RATE_LIMITS } from './rate-limit';

type RateLimitKey = keyof typeof RATE_LIMITS;

export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limitKey: RateLimitKey = 'default'
) {
  return async (req: NextRequest) => {
    // Get identifier for rate limiting (IP + User Agent for better accuracy)
    const ip = (req as NextRequest & { ip?: string }).ip || req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || '';
    const identifier = `${ip}:${userAgent.slice(0, 50)}`;

    // Apply rate limiting
    const result = rateLimit(identifier, RATE_LIMITS[limitKey]);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${result.limit} per minute.`,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(result),
        }
      );
    }

    // Call the original handler
    const response = await handler(req);

    // Add rate limit headers to successful responses
    const headers = getRateLimitHeaders(result);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}