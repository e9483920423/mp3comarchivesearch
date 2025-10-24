"use client"

import type React from "react"

import { Search } from "lucide-react"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPreference: "both" | "artist" | "title"
  onPreferenceChange: (preference: "both" | "artist" | "title") => void
  totalTracks: number
  filteredCount: number
  isSearching?: boolean
  onSearch: () => void
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  searchPreference,
  onPreferenceChange,
  totalTracks,
  filteredCount,
  isSearching = false,
  onSearch,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 mb-3">
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 cursor-pointer hover:text-red-600 transition-colors active:scale-95"
            onClick={onSearch}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search entire archive..."
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex gap-4 sm:gap-6 text-sm">
          <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
            <input
              type="radio"
              name="search-preference"
              value="both"
              checked={searchPreference === "both"}
              onChange={() => onPreferenceChange("both")}
              className="w-4 h-4 text-red-600 accent-red-600"
            />
            <span className="select-none">Both</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
            <input
              type="radio"
              name="search-preference"
              value="artist"
              checked={searchPreference === "artist"}
              onChange={() => onPreferenceChange("artist")}
              className="w-4 h-4 text-red-600 accent-red-600"
            />
            <span className="select-none">Artist</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer touch-manipulation">
            <input
              type="radio"
              name="search-preference"
              value="title"
              checked={searchPreference === "title"}
              onChange={() => onPreferenceChange("title")}
              className="w-4 h-4 text-red-600 accent-red-600"
            />
            <span className="select-none">Title</span>
          </label>
        </div>

        <div className="text-xs sm:text-sm text-gray-600 sm:ml-auto">
          {isSearching ? (
            <span>
              Found <strong>{totalTracks.toLocaleString()}</strong> matching tracks
              {filteredCount < totalTracks && ` (showing ${filteredCount.toLocaleString()})`}
            </span>
          ) : (
            <span>
              <strong>{totalTracks.toLocaleString()}</strong> tracks
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
