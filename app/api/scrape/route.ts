import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { processBatchMetadata, saveProcessedTracks } from "@/lib/metadata/batch-processor"

interface Track {
  id: string
  artist: string
  title: string
  filename: string
  url: string
  source: string
  collection: string
}

// Function to check if file is a valid MP3
function isValidMP3(filename: string): boolean {
  return (
    filename.toLowerCase().endsWith(".mp3") &&
    !filename.includes("_spectrogram") &&
    !filename.toLowerCase().endsWith(".afpk") &&
    !filename.toLowerCase().endsWith(".png") &&
    !filename.toLowerCase().endsWith(".jpg") &&
    !filename.toLowerCase().endsWith(".gif")
  )
}

// Function to extract metadata from filename
function extractMetadataFromFilename(filename: string) {
  let name = filename.replace(/\.mp3$/i, "")

  // Remove common hash patterns
  name = name.replace(/_\d+kb_mp3$/i, "")
  name = name.replace(/_[a-f0-9]{32}$/i, "")
  name = name.replace(/_[a-f0-9]{8}$/i, "")

  let artist = "Unknown Artist"
  let title = name

  if (name.includes("__")) {
    const parts = name.split("__")
    artist = cleanString(parts[0])
    title = cleanString(parts.slice(1).join(" "))
  } else if (name.includes("_-_")) {
    const parts = name.split("_-_")
    artist = cleanString(parts[0])
    title = cleanString(parts.slice(1).join(" "))
  } else if (name.includes(" - ")) {
    const parts = name.split(" - ")
    artist = cleanString(parts[0])
    title = cleanString(parts.slice(1).join(" - "))
  } else if (name.includes("_")) {
    const parts = name.split("_")
    if (parts[0].length < 30 && parts.length > 1) {
      artist = cleanString(parts[0])
      title = cleanString(parts.slice(1).join(" "))
    } else {
      title = cleanString(name.replace(/_/g, " "))
    }
  } else {
    title = cleanString(name)
  }

  return { artist, title }
}

function cleanString(str: string): string {
  return str
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

// Parse Archive.org HTML to extract MP3 links
function parseArchiveHTML(html: string, baseURL: string): Track[] {
  const tracks: Track[] = []

  // Extract collection name
  const collectionMatch = baseURL.match(/mp3[_-]com[_-](?:rescue[_-])?barge[_-]?([A-Z0-9-]*)/i)
  const collection = collectionMatch ? collectionMatch[1] || "Main" : "Unknown"

  // Archive.org uses different HTML patterns, try multiple approaches
  // Pattern 1: Standard href links
  const linkRegex = /<a\s+href="([^"]+\.mp3[^"]*)"/gi
  let match

  while ((match = linkRegex.exec(html)) !== null) {
    let filename = match[1]

    // Remove any query parameters or fragments
    filename = filename.split("?")[0].split("#")[0]

    // Skip if not a valid MP3
    if (!isValidMP3(filename)) {
      continue
    }

    const metadata = extractMetadataFromFilename(filename)
    const trackId = `${collection}-${filename}`.replace(/[^a-zA-Z0-9-]/g, "_")

    tracks.push({
      id: trackId,
      artist: metadata.artist,
      title: metadata.title,
      filename: filename,
      url: `${baseURL}/${filename}`,
      source: baseURL,
      collection: collection,
    })
  }

  return tracks
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 5
  const extractID3 = searchParams.get("extractID3") !== "false"
  const formatTitles = searchParams.get("formatTitles") !== "false"
  const normalizeArtists = searchParams.get("normalizeArtists") !== "false"

  console.log("[v0] Starting scrape process...")
  console.log(`[v0] Scraping first ${limit} URLs from mp3index.txt`)
  console.log(`[v0] Metadata processing: ID3=${extractID3}, Format=${formatTitles}, Normalize=${normalizeArtists}`)

  try {
    const supabase = await createServiceRoleClient()

    // Read mp3index.txt from public folder
    const indexResponse = await fetch(`${request.url.split("/api")[0]}/mp3index.txt`)
    if (!indexResponse.ok) {
      throw new Error("Failed to load mp3index.txt")
    }

    const indexText = await indexResponse.text()
    const urls = indexText
      .split("\n")
      .filter((url) => url.trim())
      .slice(0, limit)

    console.log(`[v0] Found ${urls.length} URLs to scrape`)

    const allTracks: any[] = []
    const errors: string[] = []

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      console.log(`[v0] [${i + 1}/${urls.length}] Scraping: ${url}`)

      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; MP3ArchiveSearch/1.0)",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const html = await response.text()
        const tracks = parseArchiveHTML(html, url)

        console.log(`[v0] Found ${tracks.length} valid MP3 tracks from ${url}`)
        allTracks.push(...tracks)

        // Add delay to avoid overwhelming Archive.org
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        const errorMsg = `Error scraping ${url}: ${error instanceof Error ? error.message : "Unknown error"}`
        console.error(`[v0] ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    console.log(`[v0] Scraping complete! Total tracks: ${allTracks.length}`)

    if (allTracks.length > 0) {
      console.log("[v0] Processing metadata...")
      const processedTracks = await processBatchMetadata(allTracks, {
        extractID3,
        formatTitles,
        normalizeArtists,
      })

      console.log("[v0] Saving tracks to Supabase...")
      const { saved, errors: saveErrors } = await saveProcessedTracks(processedTracks)

      errors.push(...saveErrors)

      const { error: metadataError } = await supabase.from("scrape_metadata").insert({
        total_tracks: saved,
        urls_scraped: urls.length,
        status: "completed",
      })

      if (metadataError) {
        console.error("[v0] Error updating metadata:", metadataError)
      }

      console.log("[v0] Database save complete!")
    }

    return NextResponse.json({
      success: true,
      totalTracks: allTracks.length,
      urlsScraped: urls.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("[v0] Scrape error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
