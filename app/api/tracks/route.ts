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

    if (countError) {
      throw countError
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    let finalTracks: any[] = []

    // If searching, use traditional pagination
    if (query.trim()) {
      tracksQuery = tracksQuery.order("artist", { ascending: sortOrder === "asc" })
      const { data: tracks, error: tracksError } = await tracksQuery.range(offset, offset + limit - 1)

      if (tracksError) {
        throw tracksError
      }

      finalTracks = tracks || []
    } else {
      // Random multi-page loading for browsing
      // Randomly select 3-5 pages to fetch from (or fewer if not enough pages exist)
      const numPagesToFetch = Math.min(3, totalPages)
      const randomPages = new Set<number>()

      // Generate unique random page numbers
      while (randomPages.size < numPagesToFetch && randomPages.size < totalPages) {
        const randomPage = Math.floor(Math.random() * totalPages) + 1
        randomPages.add(randomPage)
      }

      console.log(`[v0] Fetching from ${numPagesToFetch} random pages: ${Array.from(randomPages).join(", ")}`)

      // Fetch tracks from each random page
      const fetchPromises = Array.from(randomPages).map(async (pageNum) => {
        const pageOffset = (pageNum - 1) * limit
        const pageQuery = supabase.from("tracks").select("*")

        // Apply same collection filters
        if (collectionsParam !== "all") {
          const collections = collectionsParam.split(",").filter(Boolean)
          if (collections.length > 0) {
            pageQuery.in("collection", collections)
          }
        }

        // Use id ordering for consistent pagination
        pageQuery.order("id", { ascending: true })

        const { data, error } = await pageQuery.range(pageOffset, pageOffset + limit - 1)

        if (error) {
          console.error(`[v0] Error fetching page ${pageNum}:`, error)
          return []
        }

        return data || []
      })

      // Wait for all pages to be fetched
      const pagesData = await Promise.all(fetchPromises)

      // Combine all tracks from different pages
      const combinedTracks = pagesData.flat()

      // Fisher-Yates shuffle algorithm for true randomization across all fetched pages
      finalTracks = [...combinedTracks]
      for (let i = finalTracks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[finalTracks[i], finalTracks[j]] = [finalTracks[j], finalTracks[i]]
      }

      // Limit to requested page size
      finalTracks = finalTracks.slice(0, limit)
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
