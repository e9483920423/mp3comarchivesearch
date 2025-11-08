"use client"

import { useState, useEffect } from "react"

interface TrackMetadata {
  artist?: string
  title?: string
  source: "id3" | "fallback"
  confidence: number
}

interface UseTrackMetadataResult {
  displayName: string
  isLoading: boolean
}

/**
 * Hook to extract and format track metadata at runtime via API
 * Displays as '[Artist Name - Track Title]' or just title if artist is unknown
 */
export function useTrackMetadata(
  trackUrl: string,
  fallbackArtist: string,
  fallbackTitle: string,
): UseTrackMetadataResult {
  const [displayName, setDisplayName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true)
        setDisplayName(`${fallbackArtist || "Unknown Artist"} - ${fallbackTitle || "Unknown Title"}`)

        const response = await fetch(`/api/extract-metadata?url=${encodeURIComponent(trackUrl)}`)
        if (!response.ok) throw new Error("Metadata extraction failed")

        const extracted: TrackMetadata = await response.json()

        // Format display name based on extracted metadata
        const artist = extracted.artist || fallbackArtist
        const title = extracted.title || fallbackTitle
        const isUnknownArtist = !extracted.artist && (!fallbackArtist || fallbackArtist === "Unknown Artist")

        if (isUnknownArtist) {
          setDisplayName(title || "Unknown Title")
        } else {
          setDisplayName(`[${artist || "Unknown Artist"} - ${title || "Unknown Title"}]`)
        }
      } catch (error) {
        console.error("[useTrackMetadata] Error:", error)
        setDisplayName(`${fallbackArtist || "Unknown Artist"} - ${fallbackTitle || "Unknown Title"}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetadata()
  }, [trackUrl, fallbackArtist, fallbackTitle])

  return { displayName, isLoading }
}
