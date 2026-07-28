import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export async function checkIpRateLimit(ip: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) {
    console.warn("[rate-limit] Redis not configured for IP rate limiting — allowing request")
    return true
  }

  const key = `ip:${ip}`
  const now = Date.now()
  const windowMs = 60_000
  const maxRequests = 20

  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, Math.ceil(windowMs / 1000))
  }

  if (count > maxRequests) return false
  return true
}

function createRatelimit() {
  const redis = getRedis()
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "m2a",
  })
}

let ratelimit: Ratelimit | null = null

export async function checkRateLimit(identifier: string, failClosed = false): Promise<{ allowed: boolean; remaining: number }> {
  if (!ratelimit) {
    ratelimit = createRatelimit()
  }
  if (!ratelimit) {
    if (failClosed) {
      console.warn("[rate-limit] Redis not configured — denying request (fail closed)")
      return { allowed: false, remaining: 0 }
    }
    console.warn("[rate-limit] Redis not configured — allowing request (fail open for non-critical)")
    return { allowed: true, remaining: 999 }
  }
  const result = await ratelimit.limit(identifier)
  return { allowed: result.success, remaining: result.remaining }
}
