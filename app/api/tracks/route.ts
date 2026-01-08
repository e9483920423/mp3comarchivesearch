import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "100")
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
      // Search mode: standard pagination with sorting
      tracksQuery = tracksQuery.order("artist", { ascending: sortOrder === "asc" })
      const { data: tracks, error: tracksError } = await tracksQuery.range(offset, offset + limit - 1)

      if (tracksError) {
        throw tracksError
      }

      finalTracks = tracks || []
    } else if (collectionsParam === "all") {
      console.log(`[v0] All Collections - round-robin sampling ${limit} tracks for page ${page}`)

      // Fetch all unique collections from the database
      const { data: collectionsData, error: collectionsError } = await supabase
        .from("tracks")
        .select("collection")
        .not("collection", "is", null)

      if (collectionsError) {
        throw collectionsError
      }

      const uniqueCollections = Array.from(new Set(collectionsData?.map((c) => c.collection) || []))
      console.log(`[v0] Found ${uniqueCollections.length} unique collections`)

      if (uniqueCollections.length === 0) {
        return NextResponse.json({
          tracks: [],
          total: 0,
          page,
          limit,
          hasMore: false,
          query: null,
          searchBy: null,
          collections: collectionsParam,
          sortOrder,
        })
      }

      // Calculate which "round" of collections we're in based on page
      // If we have 35 collections and want 500 tracks per page:
      // - Page 1: Get ~14 tracks from each collection (14 * 35 = 490, then 10 more from first collections)
      // - Page 2: Continue from where we left off
      const globalStartIndex = (page - 1) * limit
      const tracksPerRound = uniqueCollections.length

      // Calculate starting round and position within the round
      const startRound = Math.floor(globalStartIndex / tracksPerRound)
      const positionInRound = globalStartIndex % tracksPerRound

      console.log(`[v0] Starting at global index ${globalStartIndex}, round ${startRound}, position ${positionInRound}`)

      // Fetch tracks from each collection with proper offset
      const collectionPromises = uniqueCollections.map(async (collection, collectionIndex) => {
        // Calculate how many tracks this collection should contribute
        const tracksNeeded = Math.ceil(limit / uniqueCollections.length)

        // Adjust for position in round if we're starting mid-round
        let collectionOffset = startRound
        if (collectionIndex < positionInRound) {
          collectionOffset = startRound + 1
        }

        // Fetch tracks from this collection
        const { data: tracks, error } = await supabase
          .from("tracks")
          .select("*")
          .eq("collection", collection)
          .order("id", { ascending: true })
          .range(collectionOffset, collectionOffset + tracksNeeded - 1)

        if (error) {
          console.error(`[v0] Error fetching from collection ${collection}:`, error)
          return []
        }

        return (tracks || []).map((track: any) => ({ ...track, _collectionIndex: collectionIndex }))
      })

      // Fetch all collections in parallel
      const collectionResults = await Promise.all(collectionPromises)
      const allFetchedTracks = collectionResults.flat()

      console.log(`[v0] Fetched ${allFetchedTracks.length} total tracks from all collections`)

      // Round-robin interleave: pick one track from each collection in sequence
      const interleavedTracks: any[] = []
      const maxRounds = Math.max(...collectionResults.map((tracks) => tracks.length))

      for (let round = 0; round < maxRounds && interleavedTracks.length < limit; round++) {
        for (let collectionIndex = 0; collectionIndex < uniqueCollections.length; collectionIndex++) {
          // Adjust starting point if we're in the middle of a round
          const adjustedCollectionIndex = (collectionIndex + positionInRound) % uniqueCollections.length
          const tracks = collectionResults[adjustedCollectionIndex]

          if (tracks && tracks[round]) {
            interleavedTracks.push(tracks[round])
            if (interleavedTracks.length >= limit) break
          }
        }
      }

      // Remove temporary collection index marker
      finalTracks = interleavedTracks.map(({ _collectionIndex, ...track }) => track).slice(0, limit)

      console.log(`[v0] Returning ${finalTracks.length} interleaved tracks for page ${page}`)
    } else {
      // Specific collections: random sampling from those collections
      console.log("[v0] Specific Collections - using random sampling from specified collections")

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
