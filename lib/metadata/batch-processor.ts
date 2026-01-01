import { createServiceRoleClient } from "@/lib/supabase/server"
import { extractID3Metadata } from "./id3-extractor"
import { normalizeArtist } from "./artist-normalizer"
import { formatTrackTitle } from "./title-formatter"

interface ProcessedTrack {
  id: string
  artist: string
  title: string
  filename: string
  url: string
  source: string
  collection: string
  metadata_source: "id3" | "filename" | "fallback"
  metadata_confidence: number
}

export async function processBatchMetadata(
  tracks: any[],
  options: {
    extractID3?: boolean
    formatTitles?: boolean
    normalizeArtists?: boolean
  } = {},
): Promise<ProcessedTrack[]> {
  const { extractID3 = true, formatTitles = true, normalizeArtists = true } = options

  const processed: ProcessedTrack[] = []

  for (const track of tracks) {
    try {
      let finalArtist = track.artist || "Unknown Artist"
      let finalTitle = track.title || track.filename
      let metadataSource: "id3" | "filename" | "fallback" = "filename"
      let confidence = 0.7
      if (extractID3) {
        const id3 = await extractID3Metadata(track.url)
        if (id3.artist || id3.title) {
          finalArtist = id3.artist || finalArtist
          finalTitle = id3.title || finalTitle
          metadataSource = id3.source
          confidence = id3.confidence
        }
      }

      if (normalizeArtists) {
        const normalized = normalizeArtist(finalArtist)
        finalArtist = normalized.name
        confidence = Math.max(confidence, normalized.confidence)
      }

      if (formatTitles) {
        finalTitle = formatTrackTitle({
          artist: finalArtist,
          oldTitle: finalTitle,
          filename: track.filename,
          includeFilename: true,
        })
      }

      processed.push({
        ...track,
        artist: finalArtist,
        title: finalTitle,
        metadata_source: metadataSource,
        metadata_confidence: confidence,
      })
    } catch (error) {
      console.error(`[Batch] Error processing track ${track.filename}:`, error)
      processed.push({
        ...track,
        metadata_source: "fallback",
        metadata_confidence: 0,
      })
    }
  }

  return processed
}

export async function saveProcessedTracks(
  tracks: ProcessedTrack[],
  options: { batchSize?: number } = {},
): Promise<{ saved: number; errors: string[] }> {
  const { batchSize = 1000 } = options
  const supabase = await createServiceRoleClient()
  const errors: string[] = []
  let saved = 0

  for (let i = 0; i < tracks.length; i += batchSize) {
    const batch = tracks.slice(i, i + batchSize)

    try {
      const { error } = await supabase.from("tracks").upsert(batch, { onConflict: "id" })

      if (error) {
        errors.push(`Batch ${i / batchSize + 1}: ${error.message}`)
      } else {
        saved += batch.length
        console.log(`[Batch] Saved ${batch.length} tracks (${saved}/${tracks.length})`)
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error"
      errors.push(`Batch ${i / batchSize + 1}: ${msg}`)
    }
  }

  return { saved, errors }
}
