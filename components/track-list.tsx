"use client"

import TrackCard from "./track-card"
import type { Track } from "@/types/track"

interface TrackListProps {
  tracks: Track[]
  globalVolume: number
  onLoadMore?: () => void
  hasMore: boolean
  isLoadingMore: boolean
  totalInDatabase: number
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

  const getNextTrackId = (currentIndex: number): string | null => {
    if (currentIndex < displayTracks.length - 1) {
      return displayTracks[currentIndex + 1].id
    }
    return null 
  }

  const handlePlayNext = (currentIndex: number) => {
    const nextIndex = currentIndex + 1
    if (nextIndex < displayTracks.length) {
      const nextTrack = displayTracks[nextIndex]
      onTrackPlay(nextTrack.id)
    }
  }

  if (tracks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center border border-gray-200">
        <p className="text-gray-600 text-base sm:text-lg">No tracks found. Try a different search query.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg shadow-sm p-3 sm:p-6 border border-gray-200 bg-zinc-200">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-black">
        {totalInDatabase > 0
          ? `Showing ${displayTracks.length.toLocaleString()} of ${totalInDatabase.toLocaleString()} Tracks`
          : `${displayTracks.length.toLocaleString()} Track${displayTracks.length === 1 ? "" : "s"}`}
      </h2>
      <div className="space-y-3 sm:space-y-4 overflow-y-auto">
        {displayTracks.map((track, index) => (
          <TrackCard
            key={`${track.url}-${index}`}
            track={track}
            globalVolume={globalVolume}
            currentlyPlayingId={currentlyPlayingId}
            onTrackPlay={onTrackPlay}
            nextTrackId={getNextTrackId(index)}
            onPlayNext={() => handlePlayNext(index)}
          />
        ))}

        {hasMore && onLoadMore && (
          <div className="text-center py-4 sm:py-6 border-t border-gray-200">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base touch-manipulation w-full sm:w-auto"
            >
              {isLoadingMore ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </span>
              ) : (
                `Load More (${(totalInDatabase - displayTracks.length).toLocaleString()} left)`
              )}
            </button>
            <p className="text-xs sm:text-sm mt-2 text-black">
              {displayTracks.length.toLocaleString()} of {totalInDatabase.toLocaleString()} tracks
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
