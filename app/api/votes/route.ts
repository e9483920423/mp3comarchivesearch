import { redis, VOTES_KEY, checkRateLimit, generateVoteHash, VOTE_HASH_KEY } from "@/lib/redis"
import { NextResponse } from "next/server"
import { shortcuts } from "@/lib/shortcuts-data"

const CACHE_DURATION = 5 // seconds

// GET - Fetch all vote counts with caching
export async function GET(request: Request) {
  try {
    const votes = (await redis.hgetall(VOTES_KEY)) as Record<string, number> | null

    return NextResponse.json(
      {
        votes: votes || {},
      },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=${CACHE_DURATION * 2}`,
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error fetching votes:", error)
    return NextResponse.json({ error: "Failed to fetch votes" }, { status: 500 })
  }
}

// POST - Cast a vote with validation and rate limiting
export async function POST(request: Request) {
  try {
    const { shortcutId, action } = await request.json()

    if (!shortcutId || typeof shortcutId !== "string") {
      return NextResponse.json({ error: "Invalid shortcutId" }, { status: 400 })
    }

    if (action !== "upvote" && action !== "downvote") {
      return NextResponse.json({ error: "Invalid action. Must be 'upvote' or 'downvote'" }, { status: 400 })
    }

    const shortcutExists = shortcuts.some((s) => s.id === shortcutId)
    if (!shortcutExists) {
      return NextResponse.json({ error: "Shortcut not found" }, { status: 404 })
    }

    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : "unknown"

    const withinLimit = await checkRateLimit(ip)
    if (!withinLimit) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 })
    }

    const voteHash = generateVoteHash(shortcutId, ip)
    const hasVoted = await redis.sismember(VOTE_HASH_KEY, voteHash)

    // Prevent duplicate votes
    if (action === "upvote" && hasVoted) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 })
    }

    if (action === "downvote" && !hasVoted) {
      return NextResponse.json({ error: "Cannot downvote without upvoting first" }, { status: 400 })
    }

    // Update vote count
    const increment = action === "upvote" ? 1 : -1
    const newCount = await redis.hincrby(VOTES_KEY, shortcutId, increment)

    // Update vote tracking
    if (action === "upvote") {
      await redis.sadd(VOTE_HASH_KEY, voteHash)
    } else {
      await redis.srem(VOTE_HASH_KEY, voteHash)
    }

    // Ensure vote count doesn't go below 0
    if (newCount < 0) {
      await redis.hset(VOTES_KEY, { [shortcutId]: 0 })
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: newCount })
  } catch (error) {
    console.error("[v0] Error updating vote:", error)
    return NextResponse.json({ error: "Failed to update vote" }, { status: 500 })
  }
}
