import { NextResponse } from "next/server"
import tracksData from "@/public/data/tracks.json"

export async function GET() {
  try {
    return NextResponse.json(tracksData, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("[v0] Error reading tracks:", error)
    return NextResponse.json(
      { error: "Failed to load tracks", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
