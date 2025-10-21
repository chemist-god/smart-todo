import { NextRequest } from 'next/server';

interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: NextRequest) => string;
}

class RateLimiter {
    private requests: Map<string, { count: number; resetTime: number }> = new Map();
    private config: RateLimitConfig;

    constructor(config: RateLimitConfig) {
        this.config = config;

        // Clean up expired entries every minute
        setInterval(() => {
            const now = Date.now();
            for (const [key, value] of this.requests.entries()) {
                if (now > value.resetTime) {
                    this.requests.delete(key);
                }
            }
        }, 60000);
    }

    isAllowed(req: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
        const key = this.config.keyGenerator ? this.config.keyGenerator(req) : this.getDefaultKey(req);
        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        const current = this.requests.get(key);

        if (!current || now > current.resetTime) {
            // New window or expired window
            this.requests.set(key, {
                count: 1,
                resetTime: now + this.config.windowMs
            });

            return {
                allowed: true,
                remaining: this.config.maxRequests - 1,
                resetTime: now + this.config.windowMs
            };
        }

        if (current.count >= this.config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: current.resetTime
            };
        }

        // Increment count
        current.count++;
        this.requests.set(key, current);

        return {
            allowed: true,
            remaining: this.config.maxRequests - current.count,
            resetTime: current.resetTime
        };
    }

    private getDefaultKey(req: NextRequest): string {
        // Use IP address as default key
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
        return ip;
    }
}

// Create rate limiters for different endpoints
export const rateLimiters = {
    // General API rate limiting
    general: new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100
    }),

    // Auth endpoints (more restrictive)
    auth: new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5
    }),

    // Stake creation (very restrictive)
    stakeCreation: new RateLimiter({
        windowMs: 60 * 60 * 1000, // 1 hour
        maxRequests: 10
    }),

    // Payment endpoints (very restrictive)
    payment: new RateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 3
    })
};

export function createRateLimitMiddleware(limiter: RateLimiter) {
    return (req: NextRequest) => {
        const result = limiter.isAllowed(req);

        if (!result.allowed) {
            return {
                allowed: false,
                error: {
                    message: 'Too many requests',
                    retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
                }
            };
        }

        return {
            allowed: true,
            headers: {
                'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
                'X-RateLimit-Remaining': result.remaining.toString(),
                'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
            }
        };
    };
}

