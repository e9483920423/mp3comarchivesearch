/**
 * Normalizes and deduplicates artist names
 * Handles featured artists, aliases, and common variations
 */

interface ArtistRecord {
  canonical: string
  variants: Set<string>
  confidence: number
}

const artistCache = new Map<string, ArtistRecord>()

/**
 * Normalizes artist name and applies deduplication rules
 */
export function normalizeArtist(rawArtist: string): { name: string; confidence: number } {
  if (!rawArtist || rawArtist === "Unknown Artist") {
    return { name: "Unknown Artist", confidence: 0 }
  }

  const normalized = sanitizeArtistName(rawArtist)
  const cached = artistCache.get(normalized.toLowerCase())

  if (cached) {
    return { name: cached.canonical, confidence: cached.confidence }
  }

  // Extract primary artist if featured artist present
  const primary = extractPrimaryArtist(normalized)
  const canonical = titleCase(primary)

  // Cache the result
  artistCache.set(normalized.toLowerCase(), {
    canonical,
    variants: new Set([normalized, rawArtist]),
    confidence: 0.8,
  })

  return { name: canonical, confidence: 0.8 }
}

/**
 * Removes special characters and normalizes spacing
 */
function sanitizeArtistName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s&()]/g, "")
    .trim()
}

/**
 * Extracts primary artist from "Artist A feat. Artist B" patterns
 */
function extractPrimaryArtist(name: string): string {
  const patterns = [
    /^([^(]*?)(?:\s+feat\.|\s+featuring|\s+ft\.|\s+f\.|\s+\(feat\.|\s+&.*)/i,
    /^([^(]*?)(?:\s*$$.*feat\..*$$)/i,
  ]

  for (const pattern of patterns) {
    const match = name.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return name
}

/**
 * Applies title case to artist name
 */
function titleCase(name: string): string {
  return name
    .split(/(\s+)/)
    .map((word, i) => {
      if (i % 2 === 1) return word // Preserve spacing
      if (word.length === 0) return word
      if (["&", "and", "or", "the"].includes(word.toLowerCase()) && i > 0) {
        return word.toLowerCase()
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join("")
}

/**
 * Gets or creates canonical artist name
 */
export function getCanonicalArtist(rawArtist: string): string {
  return normalizeArtist(rawArtist).name
}

/**
 * Clears artist cache (call after large batch updates)
 */
export function clearArtistCache(): void {
  artistCache.clear()
}
