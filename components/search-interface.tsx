"use client"

import { useState, useEffect, useCallback } from "react"
import SearchBar from "./search-bar"
import TrackList from "./track-list"
import type { Track } from "@/types/track"
import { Volume2 } from "lucide-react"

export default function SearchInterface() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchPreference, setSearchPreference] = useState<"both" | "artist" | "title">("both")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [globalVolume, setGlobalVolume] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTracks, setTotalTracks] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [collections, setCollections] = useState<string[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>(["all"])
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null)
  const [isCollectionDropdownOpen, setIsCollectionDropdownOpen] = useState(false)

  const TRACKS_PER_PAGE = 5000

  useEffect(() => {
    async function loadCollections() {
      try {
        const response = await fetch("/api/collections")
        if (response.ok) {
          const data = await response.json()
          setCollections(data.collections || [])
        }
      } catch (err) {
        console.error("[v0] Error loading collections:", err)
      }
    }
    loadCollections()
  }, [])

  const loadTracks = useCallback(
    async (page: number, query?: string, searchBy?: string, append = false) => {
      try {
        const isSearch = Boolean(query?.trim())
        const collectionsParam = selectedCollections.includes("all") ? "all" : selectedCollections.join(",")

        console.log(`[v0] ${isSearch ? "Searching" : "Loading"} tracks...`, {
          page,
          query,
          searchBy,
          collections: collectionsParam,
          sortOrder,
        })

        const params = new URLSearchParams({
          limit: TRACKS_PER_PAGE.toString(),
          page: page.toString(),
          collections: collectionsParam,
          sortOrder: sortOrder,
        })

        if (query?.trim()) {
          params.append("query", query.trim())
          params.append("searchBy", searchBy || "both")
        }

        const response = await fetch(`/api/tracks?${params.toString()}`)

        if (!response.ok) {
          throw new Error(`Failed to load tracks: ${response.status}`)
        }

        const data = await response.json()
        const trackData = data.tracks || []

        console.log(`[v0] ${isSearch ? "Search returned" : "Loaded"} ${trackData.length} tracks (total: ${data.total})`)

        if (append) {
          setTracks((prev) => [...prev, ...trackData])
        } else {
          setTracks(trackData)
        }

        setTotalTracks(data.total || 0)
        setHasMore(data.hasMore || false)
        setCurrentPage(page)
        setIsSearching(isSearch)
        setIsLoading(false)
      } catch (err) {
        console.error("[v0] Error loading tracks:", err)
        setError(err instanceof Error ? err.message : "Failed to load tracks")
        setIsLoading(false)
      }
    },
    [selectedCollections, sortOrder],
  )

  useEffect(() => {
    loadTracks(1)
  }, [loadTracks])

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setIsLoading(true)
      loadTracks(1)
      return
    }

    console.log("[v0] Executing database search:", searchQuery)
    setIsLoading(true)
    loadTracks(1, searchQuery, searchPreference)
  }, [searchQuery, searchPreference, loadTracks])

  async function loadMoreTracks() {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      await loadTracks(
        nextPage,
        isSearching ? searchQuery : undefined,
        isSearching ? searchPreference : undefined,
        true,
      )
    } catch (err) {
      console.error("[v0] Error loading more tracks:", err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  function handleCollectionToggle(collection: string) {
    setSelectedCollections((prev) => {
      if (collection === "all") {
        return ["all"]
      }

      const withoutAll = prev.filter((c) => c !== "all")

      if (withoutAll.includes(collection)) {
        const newSelections = withoutAll.filter((c) => c !== collection)
        return newSelections.length === 0 ? ["all"] : newSelections
      } else {
        return [...withoutAll, collection]
      }
    })

    setIsLoading(true)
    setCurrentPage(1)
  }

  function handleClearFilters() {
    setSelectedCollections(["all"])
    setIsLoading(true)
    setCurrentPage(1)
  }

  function handleSortOrderToggle() {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    setIsLoading(true)
    setCurrentPage(1)
  }

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="rounded-xl shadow-sm p-6 border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/50 mb-3 max-w-md mx-auto">
          <div className="animate-pulse">
            <div className="h-3 bg-gray-200 rounded-full w-3/4 mx-auto mb-3"></div>
            <div className="h-3 bg-gray-200 rounded-full w-1/2 mx-auto"></div>
          </div>
        </div>
        <p className="mt-5 text-gray-600 font-medium tracking-wide">
          {isSearching ? "Searching entire archive..." : "Loading tracks from archive..."}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="text-red-600 max-w-md mx-auto">
          <p className="font-semibold text-lg tracking-tight">Error loading archive</p>
          <p className="text-sm mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPreference={searchPreference}
        onPreferenceChange={setSearchPreference}
        totalTracks={totalTracks}
        filteredCount={tracks.length}
        isSearching={isSearching}
        onSearch={handleSearch}
      />

      <div className="rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/30 mb-3 hover:border-gray-300 transition-colors duration-200 max-w-full overflow-hidden">
        <div className="flex items-center gap-3 sm:gap-4 w-full">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200/60 flex-shrink-0">
            <Volume2 className="w-4 h-4 text-gray-700" />
          </div>
          <label className="text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap tracking-wide flex-shrink-0">
            Volume
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={globalVolume}
            onChange={(e) => setGlobalVolume(Number(e.target.value))}
            className="flex-1 min-w-0 max-w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-red-600 touch-manipulation hover:accent-red-700 transition-all"
            title={`Global volume: ${globalVolume}%`}
          />
          <span className="text-xs sm:text-sm font-semibold text-gray-700 w-11 sm:w-12 text-right tabular-nums flex-shrink-0">
            {globalVolume}%
          </span>
        </div>
      </div>

      <TrackList
        tracks={tracks}
        globalVolume={globalVolume}
        onLoadMore={loadMoreTracks}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        totalInDatabase={totalTracks}
        currentlyPlayingId={currentlyPlayingId}
        onTrackPlay={setCurrentlyPlayingId}
      />
    </div>
  )
}
