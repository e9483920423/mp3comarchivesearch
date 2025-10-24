import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "1000")
    const offset = (page - 1) * limit

    const query = searchParams.get("query") || ""
    const searchBy = searchParams.get("searchBy") || "both"
    const collectionsParam = searchParams.get("collections") || "all"
    const sortOrder = searchParams.get("sortOrder") || "asc"

    const supabase = await createClient()

    let countQuery = supabase.from("tracks").select("*", { count: "exact", head: true })
    let tracksQuery = supabase.from("tracks").select("*")

    // Filter by collection(s)
    if (collectionsParam !== "all") {
      const collections = collectionsParam.split(",").filter(Boolean)
      if (collections.length > 0) {
        countQuery = countQuery.in("collection", collections)
        tracksQuery = tracksQuery.in("collection", collections)
      }
    }

    // Apply search filters if query exists
    if (query.trim()) {
      const searchTerm = `%${query.trim()}%`

      if (searchBy === "artist") {
        countQuery = countQuery.ilike("artist", searchTerm)
        tracksQuery = tracksQuery.ilike("artist", searchTerm)
      } else if (searchBy === "title") {
        countQuery = countQuery.ilike("title", searchTerm)
        tracksQuery = tracksQuery.ilike("title", searchTerm)
      } else {
        // Search both artist and title
        countQuery = countQuery.or(`artist.ilike.%${query.trim()}%,title.ilike.%${query.trim()}%`)
        tracksQuery = tracksQuery.or(`artist.ilike.%${query.trim()}%,title.ilike.%${query.trim()}%`)
      }
    }

    // Get total count
    const { count, error: countError } = await countQuery
    if (countError) throw countError

    // Sort order logic
    if (collectionsParam === "all") {
      // Random order handled directly in Supabase/Postgres
      tracksQuery = tracksQuery.order("random()", { ascending: true })
    } else {
      // Alphabetical order by artist for specific collections
      tracksQuery = tracksQuery.order("artist", { ascending: sortOrder === "asc" })
    }

    // Get paginated tracks
    const { data: tracks, error: tracksError } = await tracksQuery.range(offset, offset + limit - 1)
    if (tracksError) throw tracksError

    console.log(`[v0] Loaded ${tracks?.length ?? 0} tracks (total: ${count})`)

    return NextResponse.json({
      tracks: tracks || [],
      total: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
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
