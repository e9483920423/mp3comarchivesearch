"use client"

import { Download } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import type { Track } from "@/types/track"

interface TrackCardProps {
  track: Track
  globalVolume: number
  currentlyPlayingId: string | null
  onTrackPlay: (trackId: string | null) => void
  nextTrackId?: string | null
  onPlayNext?: () => void
}

export default function TrackCard({
  track,
  globalVolume,
  currentlyPlayingId,
  onTrackPlay,
  nextTrackId,
  onPlayNext,
}: TrackCardProps) {
  const [localVolume, setLocalVolume] = useState(100)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      const combinedVolume = (globalVolume / 100) * (localVolume / 100)
      audioRef.current.volume = combinedVolume
    }
  }, [globalVolume, localVolume])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      if (currentlyPlayingId !== track.id) {
        audio.pause()
      }
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

    const handleEnded = () => {
      console.log("[v0] Track ended:", track.id)
      onTrackPlay(null)

      if (nextTrackId && onPlayNext) {
        console.log("[v0] Auto-playing next track:", nextTrackId)
        setTimeout(() => {
          onPlayNext()
        }, 300) 
      } else {
        console.log("[v0] No next track available, playback stopped")
      }
    }

    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [track.id, currentlyPlayingId, onTrackPlay, nextTrackId, onPlayNext])

  useEffect(() => {
    const audio = audioRef.current
    if (audio && currentlyPlayingId === track.id) {
      if (audio.paused || audio.ended) {
        const allAudioElements = document.querySelectorAll<HTMLAudioElement>('audio')
        allAudioElements.forEach((element) => {
          if (element !== audio && element.src === audio.src && !element.paused) {
            element.pause()
          }
        })
        
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log("[v0] Auto-play prevented:", error.message)
          })
        }
      }
    }
  }, [currentlyPlayingId, track.id])

  return (
    <div className="group border border-gray-200/80 rounded-xl p-4 sm:p-5 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/50 transition-all duration-300 bg-white/80 backdrop-blur-sm">
      <div className="mb-3 sm:mb-4">
        <h3 className="font-semibold text-base sm:text-lg mb-1.5 break-words leading-tight tracking-tight text-black">
          {track.artist && track.artist !== "Unknown Artist" ? `${track.artist} ${track.title}` : track.title}
        </h3>
        <p className="text-sm sm:text-base break-words leading-relaxed text-neutral-950">
          {track.filename || "Unknown Filename"} | {track.collection || "Unknown Collection"}
        </p>
      </div>

      {track.collection && <div className="mb-3 sm:mb-4"></div>}

      <audio ref={audioRef} controls className="w-full mb-3 sm:mb-4 rounded-lg" preload="none" src={track.url}>
        Your browser does not support the audio element.
      </audio>

      <a
        href={track.url}
        download={`${track.artist && track.artist !== "Unknown Artist" ? `${track.artist} - ${track.title}` : track.title}.mp3`}
        className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 sm:py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 active:from-green-800 active:to-green-700 shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium w-full touch-manipulation group-hover:scale-[1.01]"
      >
        <Download className="w-4 h-4 flex-shrink-0" />
        <span className="tracking-wide">Open MP3</span>
      </a>
    </div>
  )
}
