import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

const ipRateLimitStore = new Map<string, { count: number; resetAt: number }>()
const IP_WINDOW_MS = 60_000
const IP_MAX_REQUESTS = 20

export async function checkIpRateLimit(ip: string): Promise<boolean> {
  const now = Date.now()
  const entry = ipRateLimitStore.get(ip)
  if (!entry || now > entry.resetAt) {
    ipRateLimitStore.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS })
    return true
  }
  entry.count++
  if (entry.count > IP_MAX_REQUESTS) return false
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
