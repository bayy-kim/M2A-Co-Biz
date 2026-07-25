import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
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

export async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number }> {
  if (!ratelimit) {
    ratelimit = createRatelimit()
  }
  if (!ratelimit) {
    console.warn("[rate-limit] Redis not configured — blocking request (fail closed)")
    return { allowed: false, remaining: 0 }
  }
  const result = await ratelimit.limit(identifier)
  return { allowed: result.success, remaining: result.remaining }
}
