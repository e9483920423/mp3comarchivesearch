import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")

    // ✅ Fixed limit of 500 (safe for most devices)
    const limit = 500
    const offset = (page - 1) * limit

    const query = searchParams.get("query") || ""
    const searchBy = searchParams.get("searchBy") || "both"
    const collectionsParam = searchParams.get("collections") || "all"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    const supabase = await createClient()

    let countQuery = supabase.from("tracks").select("*", { count: "exact", head: true })
    let tracksQuery = supabase.from("tracks").select("*")

    // Filter by collections
    if (collectionsParam !== "all") {
      const collections = collectionsParam.split(",").filter(Boolean)
      if (collections.length > 0) {
        countQuery = countQuery.in("collection", collections)
        tracksQuery = tracksQuery.in("collection", collections)
      }
    }

    // Apply search filters
    if (query.trim()) {
      const searchTerm = `%${query.trim()}%`
      if (searchBy === "artist") {
        countQuery = countQuery.ilike("artist", searchTerm)
        tracksQuery = tracksQuery.ilike("artist", searchTerm)
      } else if (searchBy === "title") {
        countQuery = countQuery.ilike("title", searchTerm)
        tracksQuery = tracksQuery.ilike("title", searchTerm)
      } else {
        countQuery = countQuery.or(`artist.ilike.%${query.trim()}%,title.ilike.%${query.trim()}%`)
        tracksQuery = tracksQuery.or(`artist.ilike.%${query.trim()}%,title.ilike.%${query.trim()}%`)
      }
    }

    // Get total count
    const { count, error: countError } = await countQuery
    if (countError) throw countError
    const totalCount = count || 0

    let finalTracks: any[] = []

    if (query.trim()) {
      // 🔍 Search mode (normal pagination)
      tracksQuery = tracksQuery
        .order("artist", { ascending: sortOrder === "asc" })
        .range(offset, offset + limit - 1)

      const { data: tracks, error: tracksError } = await tracksQuery
      if (tracksError) throw tracksError
      finalTracks = tracks || []
    } else {
      // 🎲 Random lightweight mode for browsing
      const { count: totalCount } = await supabase
        .from("tracks")
        .select("*", { count: "exact", head: true })

      const randomOffset = Math.max(0, Math.floor(Math.random() * Math.max(0, (totalCount || 1000) - limit)))

      const { data: randomTracks, error: randomError } = await supabase
        .from("tracks")
        .select("*")
        .range(randomOffset, randomOffset + limit - 1)

      if (randomError) throw randomError
      finalTracks = randomTracks || []
    }

    console.log(`[v0] Loaded ${finalTracks.length} tracks (total: ${totalCount})`)

    return NextResponse.json({
      tracks: finalTracks,
      total: totalCount,
      page,
      limit,
      hasMore: totalCount > offset + limit,
      query: query || null,
      searchBy: searchBy || null,
      collections: collectionsParam,
      sortOrder,
    })
  } catch (error) {
    console.error("[v0] Error fetching tracks:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch tracks",
      },
      { status: 500 },
    )
  }
}
