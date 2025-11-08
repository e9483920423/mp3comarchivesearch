/**
 * Formats track titles with artist information
 * Restructures as: [Artist - Old Title] / MP3 Name
 */

interface TitleFormatOptions {
  artist: string
  oldTitle: string
  filename: string
  includeFilename?: boolean
}

export function formatTrackTitle(options: TitleFormatOptions): string {
  const { artist, oldTitle, filename, includeFilename = true } = options

  // Avoid redundancy if artist already in title
  const cleanTitle = removeArtistFromTitle(oldTitle, artist)

  if (includeFilename) {
    return `[${artist} - ${cleanTitle}] / ${filename}`
  }

  return `${artist} - ${cleanTitle}`
}

/**
 * Removes artist name from title to avoid duplication
 */
function removeArtistFromTitle(title: string, artist: string): string {
  if (!title.toLowerCase().startsWith(artist.toLowerCase())) {
    return title
  }

  // Remove artist prefix and common separators
  const withoutArtist = title
    .slice(artist.length)
    .replace(/^\s*[-–—]\s*/, "")
    .replace(/^\s*:?\s*/, "")
    .trim()

  return withoutArtist || title
}
