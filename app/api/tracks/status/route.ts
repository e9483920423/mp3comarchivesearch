import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get total track count
    const { count, error: countError } = await supabase.from("tracks").select("*", { count: "exact", head: true })

    if (countError) {
      throw countError
    }

    // Get latest scrape metadata
    const { data: metadata, error: metadataError } = await supabase
      .from("scrape_metadata")
      .select("*")
      .order("last_scraped_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (metadataError) {
      console.error("[v0] Error fetching metadata:", metadataError)
    }

    return NextResponse.json({
      totalTracks: count || 0,
      lastScraped: metadata?.last_scraped_at || null,
      needsScraping: (count || 0) === 0,
    })
  } catch (error) {
    console.error("[v0] Error checking status:", error)
    return NextResponse.json({
      totalTracks: 0,
      lastScraped: null,
      needsScraping: true,
    })
  }
}
