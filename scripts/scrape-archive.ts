import fs from "fs"
import path from "path"
import https from "https"

interface Track {
  artist: string
  title: string
  album?: string
  year?: string
  genre?: string
  url: string
  filename: string
  source: string
  collection: string
}

const mp3IndexPath = path.join(process.cwd(), "mp3index.txt")
const urls = fs
  .readFileSync(mp3IndexPath, "utf-8")
  .split("\n")
  .filter((url) => url.trim())

console.log(`Found ${urls.length} URLs to scrape`)

const allTracks: Track[] = []

function fetchHTML(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = ""
        res.on("data", (chunk) => {
          data += chunk
        })
        res.on("end", () => {
          resolve(data)
        })
      })
      .on("error", (err) => {
        reject(err)
      })
  })
}

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

function parseArchiveHTML(html: string, baseURL: string): Track[] {
  const tracks: Track[] = []

  const collectionMatch = baseURL.match(/mp3_com_barge_([A-Z])/)
  const collection = collectionMatch ? collectionMatch[1] : "Unknown"

  const linkRegex = /<a href="([^"]+)">([^<]+)<\/a>/gi
  let match

  while ((match = linkRegex.exec(html)) !== null) {
    const filename = match[1]

    if (!isValidMP3(filename)) {
      continue
    }

    const metadata = extractMetadataFromFilename(filename)

    tracks.push({
      artist: metadata.artist,
      title: metadata.title,
      album: metadata.album || "",
      year: metadata.year || "",
      genre: metadata.genre || "",
      url: `${baseURL}/${filename}`,
      filename: filename,
      source: baseURL,
      collection: collection,
    })
  }

  return tracks
}

function extractMetadataFromFilename(filename: string) {
  let name = filename.replace(/\.mp3$/i, "")

  // Common hash patterns (_64kb_mp3, _128kb_mp3.)
  name = name.replace(/_\d+kb_mp3$/i, "")
  name = name.replace(/_[a-f0-9]{32}$/i, "") // MD5 hashes
  name = name.replace(/_[a-f0-9]{8}$/i, "") // Short hashes

  let artist = "Unknown Artist"
  let title = name
  const album = ""
  const year = ""
  const genre = ""

  // Common patterns in MP3.com filenames:
  // 1. ARTIST__TITLE (double underscore)
  // 2. ARTIST_-_TITLE (underscore dash underscore)
  // 3. ARTIST - TITLE (space dash space)
  // 4. ARTIST_TITLE (single underscore, if artist is short)

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

  return { artist, title, album, year, genre }
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

async function scrapeAll() {
  console.log("Starting scrape process...")
  console.log("Filtering: Only .mp3 files (excluding .afpk, .png, _spectrogram, etc.)\n")

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    console.log(`[${i + 1}/${urls.length}] Scraping: ${url}`)

    try {
      const html = await fetchHTML(url)
      const tracks = parseArchiveHTML(html, url)

      console.log(`  Found ${tracks.length} valid MP3 tracks`)
      allTracks.push(...tracks)

      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error(`  Error scraping ${url}:`, error instanceof Error ? error.message : error)
    }
  }

  console.log(`\nScraping complete! Total tracks: ${allTracks.length}`)

  const dataDir = path.join(process.cwd(), "public", "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const outputPath = path.join(dataDir, "tracks.json")
  fs.writeFileSync(outputPath, JSON.stringify(allTracks, null, 2))
  console.log(`Saved to ${outputPath}`)
}

// Run the scraper
scrapeAll().catch(console.error)
