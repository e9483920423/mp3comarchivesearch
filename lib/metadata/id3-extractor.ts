import https from "https"
import http from "http"

export interface ID3Metadata {
  artist?: string
  title?: string
  album?: string
  genre?: string
  year?: string
  source: "id3" | "filename" | "fallback"
  confidence: number
}

interface ID3Header {
  version: number
  flags: number
  size: number
}

export async function extractID3Metadata(url: string): Promise<ID3Metadata> {
  try {
    const buffer = await fetchID3Header(url)
    if (!buffer) {
      return { source: "fallback", confidence: 0 }
    }

    const metadata = parseID3Tags(buffer)
    return metadata.artist || metadata.title
      ? { ...metadata, source: "id3", confidence: 0.95 }
      : { source: "fallback", confidence: 0 }
  } catch (error) {
    console.error(`[ID3] Error extracting metadata from ${url}:`, error)
    return { source: "fallback", confidence: 0 }
  }
}

async function fetchID3Header(url: string, maxBytes = 102400): Promise<Buffer | null> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http
    const timeout = setTimeout(() => {
      reject(new Error("ID3 fetch timeout"))
    }, 10000)

    const request = protocol.get(url, { headers: { Range: `bytes=0-${maxBytes}` } }, (response) => {
      clearTimeout(timeout)
      const chunks: Buffer[] = []

      response.on("data", (chunk) => {
        chunks.push(chunk)
        if (chunks.reduce((sum, b) => sum + b.length, 0) > maxBytes) {
          response.destroy()
        }
      })

      response.on("end", () => {
        resolve(Buffer.concat(chunks))
      })
    })

    request.on("error", () => {
      clearTimeout(timeout)
      resolve(null)
    })
  })
}

function parseID3Tags(buffer: Buffer): Partial<ID3Metadata> {
  const metadata: Partial<ID3Metadata> = {}

  if (buffer.length < 10 || buffer.toString("ascii", 0, 3) !== "ID3") {
    return metadata
  }

  const header = parseID3Header(buffer)
  if (!header) return metadata

  let offset = 10
  const limit = Math.min(header.size + 10, buffer.length)

  while (offset + 4 < limit) {
    const frameID = buffer.toString("ascii", offset, offset + 4)

    if (frameID[0] === "\u0000") break

    const frameSize = readSynchsafeInt(buffer, offset + 4)
    offset += 10

    const frameData = buffer.slice(offset, offset + frameSize)

    switch (frameID) {
      case "TPE1": // Artist
        metadata.artist = parseTextFrame(frameData)
        break
      case "TIT2": // Title
        metadata.title = parseTextFrame(frameData)
        break
      case "TALB": // Album
        metadata.album = parseTextFrame(frameData)
        break
      case "TCON": // Genre
        metadata.genre = parseTextFrame(frameData)
        break
      case "TDRC": // Recording date
        metadata.year = parseTextFrame(frameData)?.split("-")[0]
        break
    }

    offset += frameSize
  }

  return metadata
}

function parseID3Header(buffer: Buffer): ID3Header | null {
  if (buffer.length < 10) return null

  const version = buffer[3]
  const flags = buffer[5]
  const size = readSynchsafeInt(buffer, 6)

  return { version, flags, size }
}

function readSynchsafeInt(buffer: Buffer, offset: number): number {
  return (buffer[offset] << 21) | (buffer[offset + 1] << 14) | (buffer[offset + 2] << 7) | buffer[offset + 3]
}

function parseTextFrame(data: Buffer): string | undefined {
  if (data.length < 2) return undefined
  const encoding = data[0]
  const text = data.slice(1).toString(encoding === 0 ? "latin1" : "utf16le")
  return text.split("\u0000")[0].trim()
}
