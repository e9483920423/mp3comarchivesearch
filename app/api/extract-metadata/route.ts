import { NextResponse } from "next/server"
import { extractID3Metadata } from "@/lib/metadata/id3-extractor"

/**
 * API endpoint for server-side ID3 metadata extraction
 * Accepts MP3 URL and returns extracted artist, title, etc.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const trackUrl = searchParams.get("url")

    if (!trackUrl) {
      return NextResponse.json({ error: "URL parameter is required" }, { status: 400 })
    }

    const metadata = await extractID3Metadata(trackUrl)

    return NextResponse.json(metadata)
  } catch (error) {
    console.error("[ID3 API] Error extracting metadata:", error)
    return NextResponse.json({ source: "fallback", confidence: 0 }, { status: 500 })
  }
}
