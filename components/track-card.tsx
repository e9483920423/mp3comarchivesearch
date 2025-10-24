"use client"

import { Download } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { Track } from "@/types/track"

interface TrackCardProps {
  track: Track
  globalVolume: number
  currentlyPlayingId: string | null
  onTrackPlay: (trackId: string | null) => void
}

export default function TrackCard({ track, globalVolume, currentlyPlayingId, onTrackPlay }: TrackCardProps) {
  const [localVolume, setLocalVolume] = useState(100)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      // Combine global and local volume (both are 0-100, convert to 0-1)
      const combinedVolume = (globalVolume / 100) * (localVolume / 100)
      audioRef.current.volume = combinedVolume
    }
  }, [globalVolume, localVolume])

  useEffect(() => {
    if (audioRef.current && currentlyPlayingId !== null && currentlyPlayingId !== track.id) {
      audioRef.current.pause()
    }
  }, [currentlyPlayingId, track.id])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handlePlay = () => {
      onTrackPlay(track.id)
    }

    const handlePause = () => {
      if (currentlyPlayingId === track.id) {
        onTrackPlay(null)
      }
    }

    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("ended", handlePause)

    return () => {
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("ended", handlePause)
    }
  }, [track.id, currentlyPlayingId, onTrackPlay])

  return (
    <div className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white">
      <div className="mb-2 sm:mb-3">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 break-words">
          {track.artist || "Unknown Artist"}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 break-words">{track.title || "Unknown Title"}</p>
      </div>

      {track.collection && <div className="mb-2 sm:mb-3"></div>}

      <audio ref={audioRef} controls className="w-full mb-2 sm:mb-3" preload="none" src={track.url}>
        Your browser does not support the audio element.
      </audio>

      <a
        href={track.url}
        download={`${track.artist || "Unknown"} - ${track.title || "Unknown"}.mp3`}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm font-medium w-full touch-manipulation"
      >
        <Download className="w-4 h-4 flex-shrink-0" />
        <span>Open MP3</span>
      </a>
    </div>
  )
}
