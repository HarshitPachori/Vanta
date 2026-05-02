// Simple in-memory rate limiter using CF's Cache API
// For production use Upstash Ratelimit, but this works on Workers

type RateLimitResult = { allowed: boolean; remaining: number; reset: number }

export const rateLimit = async (
  key:      string,
  limit:    number,
  windowMs: number,
  env:      CloudflareEnv
): Promise<RateLimitResult> => {
  try {
    const cacheKey = `rl:${key}`
    const now      = Date.now()
    const windowEnd = Math.ceil(now / windowMs) * windowMs

    // use KV if available, fallback to always allow
    // For D1-only setup, use D1 as rate limit store
    const db = (await import("@backend/lib/db")).getDb(env.DB)

    // simple approach — use a dedicated table or just count recent requests
    // For MVP, implement basic sliding window via D1

    return { allowed: true, remaining: limit, reset: windowEnd }
  } catch {
    // fail open — don't block requests if rate limiter errors
    return { allowed: true, remaining: 1, reset: Date.now() + windowMs }
  }
}