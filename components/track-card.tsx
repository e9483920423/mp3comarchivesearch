"use client"

import { Download, Volume2 } from "lucide-react"
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
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="mb-3">
        <h3 className="font-semibold text-lg text-gray-900 mb-1">{track.artist || "Unknown Artist"}</h3>
        <p className="text-gray-600">{track.title || "Unknown Title"}</p>
      </div>

      {track.collection && (
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
            Collection: {track.collection}
          </span>
        </div>
      )}

      <audio ref={audioRef} controls className="w-full mb-3" preload="none" src={track.url}>
        Your browser does not support the audio element.
      </audio>

      <div className="mb-3 flex items-center gap-2">
        <Volume2 className="w-4 h-4 text-gray-600" />
        <input
          type="range"
          min="0"
          max="100"
          value={localVolume}
          onChange={(e) => setLocalVolume(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600"
          title={`Track volume: ${localVolume}%`}
        />
        <span className="text-sm text-gray-600 w-12 text-right">{localVolume}%</span>
      </div>

      <a
        href={track.url}
        download={`${track.artist || "Unknown"} - ${track.title || "Unknown"}.mp3`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium w-full justify-center"
      >
        <Download className="w-4 h-4" />
        Open MP3
      </a>
    </div>
  )
}
