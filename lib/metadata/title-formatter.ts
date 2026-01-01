interface TitleFormatOptions {
  artist: string
  oldTitle: string
  filename: string
  includeFilename?: boolean
}

export function formatTrackTitle(options: TitleFormatOptions): string {
  const { artist, oldTitle, filename, includeFilename = true } = options
  const cleanTitle = removeArtistFromTitle(oldTitle, artist)
  if (includeFilename) {
    return `[${artist} - ${cleanTitle}] / ${filename}`
  }

  return `${artist} - ${cleanTitle}`
}

function removeArtistFromTitle(title: string, artist: string): string {
  if (!title.toLowerCase().startsWith(artist.toLowerCase())) {
    return title
  }
  const withoutArtist = title
    .slice(artist.length)
    .replace(/^\s*[-–—]\s*/, "")
    .replace(/^\s*:?\s*/, "")
    .trim()

  return withoutArtist || title
}
