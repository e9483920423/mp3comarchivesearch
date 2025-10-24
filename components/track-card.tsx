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
    <div className="group border border-gray-200/80 rounded-xl p-4 sm:p-5 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm">
      <div className="mb-3 sm:mb-4">
        <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1.5 break-words leading-tight tracking-tight">
          {track.artist || "Unknown Artist"}
        </h3>
        <p className="text-sm sm:text-base text-gray-500 break-words leading-relaxed">
          {track.title || "Unknown Title"}
        </p>
      </div>

      {track.collection && <div className="mb-3 sm:mb-4"></div>}

      <audio 
        ref={audioRef} 
        controls 
        className="w-full mb-3 sm:mb-4 rounded-lg" 
        preload="none" 
        src={track.url}
      >
        Your browser does not support the audio element.
      </audio>

      <a
        href={track.url}
        download={`${track.artist || "Unknown"} - ${track.title || "Unknown"}.mp3`}
        className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 sm:py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 active:from-green-800 active:to-green-700 shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium w-full touch-manipulation group-hover:scale-[1.01]"
      >
        <Download className="w-4 h-4 flex-shrink-0" />
        <span className="tracking-wide">Open MP3</span>
      </a>
    </div>
  )
}
