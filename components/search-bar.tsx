"use client"

import { Search } from "lucide-react"

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  searchPreference: "both" | "artist" | "title"
  onPreferenceChange: (preference: "both" | "artist" | "title") => void
  totalTracks: number
  filteredCount: number
  isSearching?: boolean
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  searchPreference,
  onPreferenceChange,
  totalTracks,
  filteredCount,
  isSearching = false,
}: SearchBarProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-3">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-text-muted]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search entire archive..."
            className="w-full pl-10 pr-4 py-3 border-2 border-[--color-border] rounded-lg focus:outline-none focus:border-[--color-primary] transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="search-preference"
              value="both"
              checked={searchPreference === "both"}
              onChange={() => onPreferenceChange("both")}
              className="w-4 h-4 text-[--color-primary] accent-[--color-primary]"
            />
            <span>Both</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="search-preference"
              value="artist"
              checked={searchPreference === "artist"}
              onChange={() => onPreferenceChange("artist")}
              className="w-4 h-4 text-[--color-primary] accent-[--color-primary]"
            />
            <span>Artist</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="search-preference"
              value="title"
              checked={searchPreference === "title"}
              onChange={() => onPreferenceChange("title")}
              className="w-4 h-4 text-[--color-primary] accent-[--color-primary]"
            />
            <span>Title</span>
          </label>
        </div>

        <div className="text-sm text-[--color-text-muted] ml-auto">
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
