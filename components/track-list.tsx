"use client"

import TrackCard from "./track-card"
import type { Track } from "@/types/track"

interface TrackListProps {
  tracks: Track[]
  globalVolume: number
  onLoadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
  totalInDatabase?: number
  currentlyPlayingId: string | null
  onTrackPlay: (trackId: string | null) => void
}

export default function TrackList({
  tracks,
  globalVolume,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  totalInDatabase = 0,
  currentlyPlayingId,
  onTrackPlay,
}: TrackListProps) {
  const displayTracks = tracks

  if (tracks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
        <p className="text-gray-600 text-lg">No tracks found. Try a different search query.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg shadow-sm p-6 border border-gray-200 bg-stone-50">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">
        {totalInDatabase > 0
          ? `Showing ${displayTracks.length.toLocaleString()} of ${totalInDatabase.toLocaleString()} Tracks`
          : `${displayTracks.length.toLocaleString()} Track${displayTracks.length === 1 ? "" : "s"}`}
      </h2>
      <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
        {displayTracks.map((track, index) => (
          <TrackCard
            key={`${track.url}-${index}`}
            track={track}
            globalVolume={globalVolume}
            currentlyPlayingId={currentlyPlayingId}
            onTrackPlay={onTrackPlay}
          />
        ))}

        {hasMore && onLoadMore && (
          <div className="text-center py-6 border-t border-gray-200">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoadingMore ? (
                <span className="flex items-center gap-2">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading more tracks...
                </span>
              ) : (
                `Load More Tracks (${(totalInDatabase - displayTracks.length).toLocaleString()} remaining)`
              )}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Currently showing {displayTracks.length.toLocaleString()} of {totalInDatabase.toLocaleString()} total
              tracks
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
