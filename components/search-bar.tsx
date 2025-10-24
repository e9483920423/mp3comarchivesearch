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
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-xl shadow-sm p-4 sm:p-5 border border-gray-200/80 mb-4 hover:border-gray-300 transition-all duration-200">
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
        <div className="relative flex-1 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200/60 group-focus-within:from-red-50 group-focus-within:to-red-100/50 group-focus-within:border-red-200 transition-all duration-200">
            <Search
              className="w-4 h-4 text-gray-600 cursor-pointer hover:text-red-600 transition-colors active:scale-95 group-focus-within:text-red-600"
              onClick={onSearch}
            />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search entire archive..."
            className="w-full pl-14 sm:pl-[3.75rem] pr-4 sm:pr-5 py-3 sm:py-3.5 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100/50 transition-all duration-200 bg-white placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex gap-5 sm:gap-7 text-sm">
          <label className="flex items-center gap-2.5 cursor-pointer touch-manipulation group">
            <div className="relative">
              <input
                type="radio"
                name="search-preference"
                value="both"
                checked={searchPreference === "both"}
                onChange={() => onPreferenceChange("both")}
                className="w-4 h-4 text-red-600 accent-red-600 cursor-pointer"
              />
            </div>
            <span className="select-none font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Both</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer touch-manipulation group">
            <div className="relative">
              <input
                type="radio"
                name="search-preference"
                value="artist"
                checked={searchPreference === "artist"}
                onChange={() => onPreferenceChange("artist")}
                className="w-4 h-4 text-red-600 accent-red-600 cursor-pointer"
              />
            </div>
            <span className="select-none font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Artist</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer touch-manipulation group">
            <div className="relative">
              <input
                type="radio"
                name="search-preference"
                value="title"
                checked={searchPreference === "title"}
                onChange={() => onPreferenceChange("title")}
                className="w-4 h-4 text-red-600 accent-red-600 cursor-pointer"
              />
            </div>
            <span className="select-none font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Title</span>
          </label>
        </div>

        <div className="text-xs sm:text-sm text-gray-600 sm:ml-auto font-medium">
          {isSearching ? (
            <span className="tracking-wide">
              Found <strong className="text-gray-900 font-semibold">{totalTracks.toLocaleString()}</strong> matching tracks
              {filteredCount < totalTracks && ` (showing ${filteredCount.toLocaleString()})`}
            </span>
          ) : (
            <span className="tracking-wide">
              <strong className="text-gray-900 font-semibold">{totalTracks.toLocaleString()}</strong> tracks
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
