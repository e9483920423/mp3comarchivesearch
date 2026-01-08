import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "100") // Default to 100 for mobile performance
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

    const { count, error: countError } = await countQuery

    if (countError) {
      throw countError
    }

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    let finalTracks: any[] = []

    if (query.trim()) {
      tracksQuery = tracksQuery.order("artist", { ascending: sortOrder === "asc" })
      const { data: tracks, error: tracksError } = await tracksQuery.range(offset, offset + limit - 1)

      if (tracksError) {
        throw tracksError
      }

      finalTracks = tracks || []
    } else {
      if (collectionsParam === "all") {
        console.log(`[v0] All Collections selected - using paginated random sampling (page ${page})`)

        // Get all unique collections from the database
        const { data: collectionsData, error: collectionsError } = await supabase
          .from("tracks")
          .select("collection")
          .not("collection", "is", null)

        if (collectionsError) {
          throw collectionsError
        }

        const uniqueCollections = Array.from(new Set(collectionsData?.map((c) => c.collection) || []))
        console.log(`[v0] Found ${uniqueCollections.length} unique collections`)

        // Calculate how many tracks to fetch per collection for this page
        const tracksPerCollection = Math.ceil(limit / uniqueCollections.length)

        // Use page number to create an offset for each collection
        const collectionOffset = (page - 1) * tracksPerCollection

        // Fetch tracks from each collection in parallel with offset
        const collectionFetchPromises = uniqueCollections.map(async (collection) => {
          const { data, error } = await supabase
            .from("tracks")
            .select("*")
            .eq("collection", collection)
            .order("id", { ascending: true })
            .range(collectionOffset, collectionOffset + tracksPerCollection - 1)

          if (error) {
            console.error(`[v0] Error fetching from collection ${collection}:`, error)
            return []
          }

          return data || []
        })

        const collectionResults = await Promise.all(collectionFetchPromises)

        // Round-robin interleave tracks from each collection
        const interleavedTracks: any[] = []
        const maxLength = Math.max(...collectionResults.map((arr) => arr.length))

        for (let i = 0; i < maxLength; i++) {
          for (const collectionTracks of collectionResults) {
            if (i < collectionTracks.length) {
              interleavedTracks.push(collectionTracks[i])
            }
          }
        }

        console.log(
          `[v0] Page ${page} sampling: ${interleavedTracks.length} tracks from ${uniqueCollections.length} collections`,
        )

        // Shuffle the interleaved tracks for randomness
        for (let i = interleavedTracks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[interleavedTracks[i], interleavedTracks[j]] = [interleavedTracks[j], interleavedTracks[i]]
        }

        finalTracks = interleavedTracks.slice(0, limit)
      } else {
        console.log("[v0] Specific Collections selected - using random sampling from specified collections")

        const numPagesToFetch = Math.min(2, totalPages)
        const randomPages = new Set<number>()

        while (randomPages.size < numPagesToFetch && randomPages.size < totalPages) {
          const randomPage = Math.floor(Math.random() * totalPages) + 1
          randomPages.add(randomPage)
        }

        const mobileLimit = Math.min(limit, 100)

        const fetchPromises = Array.from(randomPages).map(async (pageNum) => {
          const pageOffset = (pageNum - 1) * mobileLimit
          const pageQuery = supabase.from("tracks").select("*")

          if (collectionsParam !== "all") {
            const collections = collectionsParam.split(",").filter(Boolean)
            if (collections.length > 0) {
              pageQuery.in("collection", collections)
            }
          }

          pageQuery.order("id", { ascending: true })

          const { data, error } = await pageQuery.range(pageOffset, pageOffset + mobileLimit - 1)

          if (error) {
            return []
          }

          return data || []
        })

        const timeoutPromise = new Promise<any[][]>((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), 25000)
        })
        const pagesData = await Promise.race([Promise.all(fetchPromises), timeoutPromise])
        const combinedTracks = pagesData.flat()
        finalTracks = [...combinedTracks]
        for (let i = finalTracks.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[finalTracks[i], finalTracks[j]] = [finalTracks[j], finalTracks[i]]
        }
        finalTracks = finalTracks.slice(0, limit)
      }
    }

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
    if (process.env.NODE_ENV === "development") {
      console.error("Error fetching tracks:", error)
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch tracks",
        tracks: [],
        total: 0,
        hasMore: false,
      },
      { status: 500 },
    )
  }
}
