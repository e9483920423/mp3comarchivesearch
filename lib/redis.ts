import { Redis } from "@upstash/redis"

if (!process.env.UPSTASH_KV_KV_REST_API_URL || !process.env.UPSTASH_KV_KV_REST_API_TOKEN) {
  throw new Error("Missing required Upstash Redis environment variables")
}

export const redis = new Redis({
  url: process.env.UPSTASH_KV_KV_REST_API_URL!,
  token: process.env.UPSTASH_KV_KV_REST_API_TOKEN!,
})

export const VOTES_KEY = "fl-shortcuts:votes"
export const RATE_LIMIT_KEY = "fl-shortcuts:rate-limit"
export const VOTE_HASH_KEY = "fl-shortcuts:vote-hashes"

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const key = `${RATE_LIMIT_KEY}:${identifier}`
  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, 60)
  }

  return count <= 10
}

export function generateVoteHash(shortcutId: string, identifier: string): string {
  return `${shortcutId}:${identifier}`
}
