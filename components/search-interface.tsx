"use client"

import { useState, useEffect, useCallback } from "react"
import SearchBar from "./search-bar"
import TrackList from "./track-list"
import type { Track } from "@/types/track"
import { Volume2, Filter, X, ChevronDown } from "lucide-react"

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
        console.error("Error loading collections:", err)
      }
    }
    loadCollections()
  }, [])

  const loadTracks = useCallback(
    async (page: number, query?: string, searchBy?: string, append = false) => {
      try {
        const isSearch = Boolean(query?.trim())
        const collectionsParam = selectedCollections.includes("all") ? "all" : selectedCollections.join(",")

        console.log(`${isSearch ? "Searching" : "Loading"} tracks...`, {
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

        console.log(`${isSearch ? "Search returned" : "Loaded"} ${trackData.length} tracks (total: ${data.total})`)

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
        console.error("Error loading tracks:", err)
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

    console.log("Executing database search:", searchQuery)
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
      console.error("Error loading more tracks:", err)
    } finally {
      setIsLoadingMore(false)
    }
  }

  function handleCollectionToggle(collection: string) {
    setSelectedCollections((prev) => {
      if (collection === "all") {
        return ["all"]
      }

      // If "all" is currently selected, replace it with the clicked collection
      if (prev.includes("all")) {
        return [collection]
      }

      // Toggle the collection
      if (prev.includes(collection)) {
        const newSelections = prev.filter((c) => c !== collection)
        return newSelections.length === 0 ? ["all"] : newSelections
      } else {
        return [...prev, collection]
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
            <Volume2 className="w-4 h-4 text-red-800" />
          </div>
          <label className="text-xs sm:text-sm font-semibold whitespace-nowrap tracking-wide flex-shrink-0 text-black">
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
          <span className="text-xs sm:text-sm font-semibold w-11 sm:w-12 text-right tabular-nums flex-shrink-0 text-red-800">
            {globalVolume}%
          </span>
        </div>
      </div>

      <div className="rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/30 mb-3 hover:border-gray-300 transition-colors duration-200">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200/60 flex-shrink-0">
            <Filter className="w-4 h-4 text-red-800" />
          </div>
          <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-black">Filter by Collection</h3>
          {!selectedCollections.includes("all") && selectedCollections.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="ml-auto text-xs font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setIsCollectionDropdownOpen(!isCollectionDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm border-2 border-gray-200 rounded-lg hover:border-red-300 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100/50 transition-all duration-200 bg-white"
          >
            <span className="text-black font-medium">
              {selectedCollections.includes("all")
                ? "All Collections"
                : selectedCollections.length === 1
                  ? `Collection: ${selectedCollections[0]}`
                  : `${selectedCollections.length} Collections Selected`}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-red-800 transition-transform duration-200 ${
                isCollectionDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isCollectionDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <div className="p-2">
                <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedCollections.includes("all")}
                    onChange={() => handleCollectionToggle("all")}
                    className="w-4 h-4 text-red-600 accent-red-600 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-black">All Collections</span>
                  <span className="ml-auto text-xs text-gray-500 font-medium">{totalTracks.toLocaleString()}</span>
                </label>
                <div className="border-t border-gray-200 my-2"></div>
                {collections.map((collection) => (
                  <label
                    key={collection}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!selectedCollections.includes("all") && selectedCollections.includes(collection)}
                      onChange={() => handleCollectionToggle(collection)}
                      className="w-4 h-4 text-red-600 accent-red-600 rounded cursor-pointer"
                    />
                    <span className="text-sm text-black font-medium">Collection: {collection}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {!selectedCollections.includes("all") && selectedCollections.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedCollections.map((collection) => (
              <button
                key={collection}
                onClick={() => handleCollectionToggle(collection)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
              >
                {collection}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}
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
