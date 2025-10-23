"use client"

import { useState, useEffect, useCallback } from "react"
import SearchBar from "./search-bar"
import TrackList from "./track-list"
import type { Track } from "@/types/track"
import { Volume2, Filter, ArrowUpDown, X } from "lucide-react"

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
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null)
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

  useEffect(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    if (!searchQuery.trim()) {
      setIsLoading(true)
      loadTracks(1)
      return
    }

    const timer = setTimeout(() => {
      console.log("[v0] Executing database search:", searchQuery)
      setIsLoading(true)
      loadTracks(1, searchQuery, searchPreference)
    }, 500)

    setSearchDebounceTimer(timer)

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [searchQuery, searchPreference])

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
      <div className="text-center py-12">
        <div className="rounded-lg shadow-sm p-4 border border-gray-200 mb-2.5"></div>
        <p className="mt-4 text-gray-600">
          {isSearching ? "Searching entire archive..." : "Loading tracks from archive..."}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600">
          <p className="font-semibold text-lg">Error loading archive</p>
          <p className="text-sm mt-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPreference={searchPreference}
        onPreferenceChange={setSearchPreference}
        totalTracks={totalTracks}
        filteredCount={tracks.length}
        isSearching={isSearching}
      />

      <div className="rounded-lg shadow-sm p-4 border border-gray-200 mb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-2">
            

            {isCollectionDropdownOpen && (
              <div className="relative">
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  <div className="p-2 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      {selectedCollections.includes("all")
                        ? "All Collections"
                        : `${selectedCollections.length} selected`}
                    </span>
                    {!selectedCollections.includes("all") && (
                      <button
                        onClick={handleClearFilters}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes("all")}
                      onChange={() => handleCollectionToggle("all")}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">All Collections (Random Order)</span>
                  </label>

                  <div className="border-t border-gray-200"></div>

                  {collections.map((collection) => (
                    <label
                      key={collection}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(collection)}
                        onChange={() => handleCollectionToggle(collection)}
                        disabled={selectedCollections.includes("all")}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-700">{collection}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {!selectedCollections.includes("all") && selectedCollections.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedCollections.map((collection) => (
                  <span
                    key={collection}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-md"
                  >
                    {collection}
                    <button
                      onClick={() => handleCollectionToggle(collection)}
                      className="hover:bg-red-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {!selectedCollections.includes("all") && (
            <div className="flex items-center gap-3">
              <ArrowUpDown className="w-5 h-5 text-gray-700" />
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort Order:</label>
              <button
                onClick={handleSortOrderToggle}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium text-gray-700 transition-colors"
              >
                {sortOrder === "asc" ? "A → Z (Ascending)" : "Z → A (Descending)"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Volume2 className="w-5 h-5 text-gray-700" />
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Global Volume:</label>
          <input
            type="range"
            min="0"
            max="100"
            value={globalVolume}
            onChange={(e) => setGlobalVolume(Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            title={`Global volume: ${globalVolume}%`}
          />
          <span className="text-sm font-medium text-gray-700 w-12 text-right">{globalVolume}%</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {selectedCollections.includes("all")
            ? "Viewing all collections in random order. Select specific collections to enable alphabetical sorting."
            : `Viewing ${selectedCollections.length} collection${selectedCollections.length > 1 ? "s" : ""}. Adjust sort order and volume. Only one track can play at a time.`}
        </p>
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
